const fs = require("fs"); 
function fix(fp) { 
    if (!fs.existsSync(fp)) return;
    let content = fs.readFileSync(fp, "utf-8"); 
    if (content.startsWith("use client\";")) { 
        content = "\"" + content; 
        fs.writeFileSync(fp, content); 
    } 
}
fix("app/page.jsx");
fix("app/layout.jsx");
fix("app/login/page.jsx");

