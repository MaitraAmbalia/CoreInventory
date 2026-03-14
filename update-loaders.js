
const fs = require("fs");
const path = require("path");

function replaceLoader(filePath, importName) {
  let content = fs.readFileSync(filePath, "utf8");
  
  // Replace the import
  content = content.replace(/import DashboardLoading from ".*?loading";\n?/, "");
  
  if (!content.includes(importName)) {
    content = content.replace(/export default function/, "import { " + importName + " } from \"@/components/skeletons\";\n\nexport default function");
  }

  // Replace usage
  content = content.replace(/<DashboardLoading \/>/g, `<${importName} />`);
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${filePath} to use ${importName}`);
}

const tableFiles = [
  "app/(dashboard)/products/page.tsx",
  "app/(dashboard)/categories/page.tsx",
  "app/(dashboard)/operations/page.tsx",
  "app/(dashboard)/users/page.tsx",
  "app/(dashboard)/move-history/page.tsx",
  "app/(dashboard)/receipts/page.tsx",
  "app/(dashboard)/settings/warehouses/page.tsx",
  "app/(dashboard)/adjustments/page.tsx"
];

for (const file of tableFiles) { if (fs.existsSync(file)) replaceLoader(file, "TableSkeleton"); }

const formFiles = [
  "app/(dashboard)/products/[id]/page.tsx",
  "app/(dashboard)/operations/[id]/page.tsx",
  "app/(dashboard)/profile/page.tsx"
];

for (const file of formFiles) { if (fs.existsSync(file)) replaceLoader(file, "FormSkeleton"); }

const dashFiles = [
  "app/(dashboard)/dashboard/page.tsx",
  "app/(dashboard)/analytics/page.tsx"
];

for (const file of dashFiles) { if (fs.existsSync(file)) replaceLoader(file, "DashboardSkeleton"); }
console.log("Done");

