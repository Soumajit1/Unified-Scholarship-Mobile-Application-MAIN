const fs = require("fs"); 
const path = require("path");
function walk(dir) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        const fp = path.join(dir, f);
        if (fs.statSync(fp).isDirectory()) {
            if (f !== "node_modules" && f !== ".next") walk(fp);
        } else if (f.endsWith(".jsx")) {
            let content = fs.readFileSync(fp, "utf-8"); 
            if (content.startsWith("use client\";")) { 
                content = "\"" + content; 
                fs.writeFileSync(fp, content); 
            } 
        }
    });
}
walk("app");
walk("components");

