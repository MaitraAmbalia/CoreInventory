
const fs = require("fs");
const path = require("path");

function replaceLoading(filePath, relativeDepth) {
  let content = fs.readFileSync(filePath, "utf8");
  
  // Create relative import path for loading.tsx
  const importStatement = `import DashboardLoading from "${"../".repeat(relativeDepth)}loading";\n`;
  
  // Add import if not present
  if (!content.includes("DashboardLoading")) {
    content = content.replace("export default function ", importStatement + "export default function ");
  }

  // Replace manual loading block with DashboardLoading
  content = content.replace(/if\s*\(loading\)\s*{\s*return\s*\([\s\S]*?<\/[^>]+>\s*\);\s*}/, "if (loading) {\n    return <DashboardLoading />;\n  }");
  
  fs.writeFileSync(filePath, content);
}

replaceLoading("app/(dashboard)/analytics/page.tsx", 1);
replaceLoading("app/(dashboard)/operations/[id]/page.tsx", 2);
replaceLoading("app/(dashboard)/products/[id]/page.tsx", 2);
replaceLoading("app/(dashboard)/profile/page.tsx", 1);
replaceLoading("app/(dashboard)/settings/warehouses/page.tsx", 2);
console.log("Done");

