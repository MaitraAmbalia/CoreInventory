
const fs = require("fs");

function addTopLevelLoading(filePath, relativeDepth) {
  let content = fs.readFileSync(filePath, "utf8");
  
  // Only proceed if it has a `loading` state but does not yet return DashboardLoading early
  if (content.includes("const [loading") && !content.includes("if (loading) return <DashboardLoading />") && !content.includes("if (loading) {\n    return <DashboardLoading />;\n  }")) {
    
    // Add import if missing
    if (!content.includes("DashboardLoading")) {
      const importStatement = `import DashboardLoading from "${"../".repeat(relativeDepth)}loading";\n`;
      content = content.replace("export default function ", importStatement + "\nexport default function ");
    }
    
    // Find point right before return statement of the component.
    // A bit hacky but we can insert `if (loading) return <DashboardLoading />;` before `return (` / `return <div`
    // Let us just find `return (` and insert it right before the LAST occurrences or main return?
    // Safer to find the main return by regex `\n  return \(`
    content = content.replace(/\n  return \(/, "\n  if (loading) return <DashboardLoading />;\n\n  return (");
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
}

addTopLevelLoading("app/(dashboard)/adjustments/page.tsx", 1);
addTopLevelLoading("app/(dashboard)/categories/page.tsx", 1);
addTopLevelLoading("app/(dashboard)/move-history/page.tsx", 1);
addTopLevelLoading("app/(dashboard)/operations/page.tsx", 1);
addTopLevelLoading("app/(dashboard)/products/page.tsx", 1);
addTopLevelLoading("app/(dashboard)/receipts/page.tsx", 1);

// Handle users/page.tsx specifically since it has an early return
let usersContent = fs.readFileSync("app/(dashboard)/users/page.tsx", "utf8");
if (!usersContent.includes("DashboardLoading")) {
  usersContent = usersContent.replace("export default function ", "import DashboardLoading from \"../loading\";\nexport default function ");
  usersContent = usersContent.replace(/if \(loading\).*?;/, "if (loading) return <DashboardLoading />;");
  fs.writeFileSync("app/(dashboard)/users/page.tsx", usersContent);
}

console.log("Done");

