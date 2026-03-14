import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireManager } from "@/lib/auth";
import * as XLSX from "xlsx";

export async function POST(request: NextRequest) {
  try {
    await requireManager();

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
      return NextResponse.json({ error: "The spreadsheet is empty" }, { status: 400 });
    }

    // Fetch existing categories for matching
    const existingCategories = await prisma.category.findMany();
    const categoryMap = new Map(existingCategories.map((c) => [c.name.toLowerCase(), c.id]));

    // Fetch existing SKUs to avoid duplicates
    const existingProducts = await prisma.product.findMany({ select: { skuCode: true } });
    const existingSKUs = new Set(existingProducts.map((p) => p.skuCode.toUpperCase()));

    const results = { created: 0, skipped: 0, errors: [] as string[] };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // 1-indexed + header row

      // Flexible column name matching (case-insensitive, optional spaces/underscores)
      const getValue = (keys: string[]): string => {
        for (const key of keys) {
          const found = Object.keys(row).find(
            (k) => k.toLowerCase().replace(/[_\s]/g, "") === key.toLowerCase().replace(/[_\s]/g, "")
          );
          if (found && row[found] !== undefined && row[found] !== null) {
            return String(row[found]).trim();
          }
        }
        return "";
      };

      const name = getValue(["name", "productname", "product_name", "product"]);
      const skuCode = getValue(["sku", "skucode", "sku_code", "skulabel"]).toUpperCase();
      const categoryName = getValue(["category", "categoryname", "category_name", "cat"]);
      const uom = getValue(["uom", "unit", "unitofmeasure", "unit_of_measure"]) || "Units";
      const description = getValue(["description", "desc", "notes"]);
      const thresholdRaw = getValue(["threshold", "lowstockthreshold", "low_stock_threshold", "reorderlevel", "reorder_level"]);
      const lowStockThreshold = thresholdRaw ? parseInt(thresholdRaw) : 10;

      // Validate required fields
      if (!name) {
        results.errors.push(`Row ${rowNum}: Missing product name`);
        results.skipped++;
        continue;
      }
      if (!skuCode) {
        results.errors.push(`Row ${rowNum}: Missing SKU code for "${name}"`);
        results.skipped++;
        continue;
      }

      // Check duplicate SKU
      if (existingSKUs.has(skuCode)) {
        results.errors.push(`Row ${rowNum}: SKU "${skuCode}" already exists, skipped`);
        results.skipped++;
        continue;
      }

      // Resolve or create category
      let categoryId: string | null = null;
      if (categoryName) {
        const existing = categoryMap.get(categoryName.toLowerCase());
        if (existing) {
          categoryId = existing;
        } else {
          const newCat = await prisma.category.create({ data: { name: categoryName } });
          categoryId = newCat.id;
          categoryMap.set(categoryName.toLowerCase(), newCat.id);
        }
      }

      try {
        await prisma.product.create({
          data: {
            name,
            skuCode,
            categoryId,
            uom,
            description: description || null,
            lowStockThreshold: isNaN(lowStockThreshold) ? 10 : lowStockThreshold,
          },
        });
        existingSKUs.add(skuCode);
        results.created++;
      } catch (err: any) {
        results.errors.push(`Row ${rowNum}: ${err.message?.slice(0, 80) || "Failed to create"}`);
        results.skipped++;
      }
    }

    return NextResponse.json({
      message: `Import complete: ${results.created} created, ${results.skipped} skipped`,
      ...results,
      totalRows: rows.length,
    });
  } catch (error: any) {
    if (error.message?.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Import error:", error);
    return NextResponse.json({ error: "Failed to process import" }, { status: 500 });
  }
}
