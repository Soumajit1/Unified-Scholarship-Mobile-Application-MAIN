const fs = require('fs'); const path = require('path'); const transcriptFile = 'C:/Users/souma/.gemini/antigravity/brain/f3d428b7-c88d-4a67-a61a-e24a161c9336/.system_generated/logs/transcript_full.jsonl'; const data = fs.readFileSync(transcriptFile, 'utf8'); const lines = data.split('\n'); const files = {}; function applyWrite(args){ const fp = args.TargetFile; files[fp] = args.CodeContent; } function applyReplace(args){ const fp = args.TargetFile; // ensure file loaded
 if (!files[fp]){ if (fs.existsSync(fp)) files[fp] = fs.readFileSync(fp, 'utf8'); else return; }
 const start = args.StartLine - 1; const end = args.EndLine - 1; const replacement = args.ReplacementContent; // may contain newline chars
 const replacementLines = replacement.split('\n'); const fileLines = files[fp].split('\n'); // replace range
 fileLines.splice(start, end - start + 1, ...replacementLines);
 files[fp] = fileLines.join('\n'); }
 for (const line of lines){ if (!line) continue; try{ const entry = JSON.parse(line); if (entry.step_index >= 2278) break; if (!entry.tool_calls) continue; for (const tc of entry.tool_calls){ const args = tc.arguments || tc.args; if (!args) continue; if (tc.name === 'write_to_file'){ applyWrite(args); } else if (tc.name === 'replace_file_content'){ applyReplace(args); } } }catch(e){} }
 // write back all files
 for (const fp in files){ try{ fs.mkdirSync(path.dirname(fp), {recursive:true}); fs.writeFileSync(fp, files[fp]); console.log('Written', fp); }catch(e){ console.error('Error writing', fp, e); } }

