import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const simulators = [
  { id: "user", file: "Daily_User_Marketer_Simulator_V3_6.html" },
  { id: "admin", file: "Daily_Admin_Simulator_V3_6.html" }
];

const clean = (value) => value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const decode = (value) => value.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");

function extractControls(source) {
  const controls = [];
  const pattern = /<(button|a|input|select|textarea|div)\b([^>]*)>([\s\S]*?)<\/\1>|<(input)\b([^>]*)\/?>(?![\s\S]*?<\/input>)/gi;
  let match;
  while ((match = pattern.exec(source))) {
    const tag = (match[1] || match[4]).toLowerCase();
    const attributes = match[2] || match[5] || "";
    const action = attributes.match(/\bonclick\s*=\s*(["'])([\s\S]*?)\1/i)?.[2] ?? "";
    const id = attributes.match(/\bid\s*=\s*(["'])(.*?)\1/i)?.[2] ?? "";
    const dataView = attributes.match(/\bdata-view\s*=\s*(["'])(.*?)\1/i)?.[2] ?? "";
    const dataPane = attributes.match(/\bdata-pane\s*=\s*(["'])(.*?)\1/i)?.[2] ?? "";
    const type = attributes.match(/\btype\s*=\s*(["'])(.*?)\1/i)?.[2] ?? "";
    const isControl = ["button", "input", "select", "textarea"].includes(tag) || action || dataView || dataPane;
    if (!isControl) continue;
    controls.push({
      tag,
      id,
      type,
      dataView,
      dataPane,
      action: decode(action),
      label: clean(match[3] || attributes.match(/\bplaceholder\s*=\s*(["'])(.*?)\1/i)?.[2] || attributes.match(/\baria-label\s*=\s*(["'])(.*?)\1/i)?.[2] || ""),
      sourceOffset: match.index
    });
  }
  return controls;
}

const report = { generatedAt: new Date().toISOString(), simulators: {} };
for (const simulator of simulators) {
  const source = await readFile(resolve(simulator.file), "utf8");
  const controls = extractControls(source);
  report.simulators[simulator.id] = {
    file: simulator.file,
    totals: {
      controls: controls.length,
      buttons: controls.filter((control) => control.tag === "button").length,
      inputs: controls.filter((control) => control.tag === "input").length,
      selects: controls.filter((control) => control.tag === "select").length,
      textareas: controls.filter((control) => control.tag === "textarea").length,
      inlineActions: controls.filter((control) => control.action).length
    },
    controls
  };
}
await writeFile(resolve("docs/simulator-control-inventory.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Wrote docs/simulator-control-inventory.json: ${report.simulators.user.totals.controls} user controls, ${report.simulators.admin.totals.controls} admin controls.`);
