const fs = require("fs");
const path = require("path");
const transcriptFile = "C:/Users/souma/.gemini/antigravity/brain/f3d428b7-c88d-4a67-a61a-e24a161c9336/.system_generated/logs/transcript_full.jsonl";
const data = fs.readFileSync(transcriptFile, "utf-8");
const lines = data.split("\n");

let memoryFiles = {};

lines.forEach(line => {
    if (!line) return;
    try {
        const parsed = JSON.parse(line);
        if (parsed.step_index >= 2278) return;

        if (parsed.tool_calls) {
            parsed.tool_calls.forEach(tc => {
                const args = tc.args || tc.arguments;
                if (!args) return;
                
                if (tc.name === "write_to_file" && args.TargetFile) {
                    const fp = args.TargetFile.replace(/^"|"$/g, "").replace(/\\\\/g, "\\");
                    memoryFiles[fp] = args.CodeContent.replace(/^"|"$/g, "").replace(/\\n/g, "\n").replace(/\\"/g, "\"");
                }
                if (tc.name === "replace_file_content" && args.TargetFile) {
                    const fp = args.TargetFile.replace(/^"|"$/g, "").replace(/\\\\/g, "\\");
                    if (!memoryFiles[fp]) {
                        if (fs.existsSync(fp)) {
                            memoryFiles[fp] = fs.readFileSync(fp, "utf-8");
                        } else {
                            console.log("Missing", fp);
                            return;
                        }
                    }
                    
                    const target = args.TargetContent.replace(/^"|"$/g, "").replace(/\\n/g, "\n").replace(/\\"/g, "\"");
                    const replacement = args.ReplacementContent.replace(/^"|"$/g, "").replace(/\\n/g, "\n").replace(/\\"/g, "\"");
                    if (memoryFiles[fp].includes(target)) {
                        memoryFiles[fp] = memoryFiles[fp].replace(target, replacement);
                    } else {
                        console.log("Not found target in", fp, "at step", parsed.step_index);
                    }
                }
            });
        }
    } catch(e) {}
});

Object.keys(memoryFiles).forEach(fp => {
    try {
        fs.mkdirSync(path.dirname(fp), { recursive: true });
        fs.writeFileSync(fp, memoryFiles[fp]);
        console.log("Restored " + fp);
    } catch(e) {
        console.error("Failed to write " + fp);
    }
});

