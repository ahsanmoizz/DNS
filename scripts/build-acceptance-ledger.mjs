import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const register = await readFile(resolve("tmp/sealed-register.txt"), "utf8");
const ids = [
  ...Array.from({ length: 118 }, (_, index) => `DLY-${String(index + 1).padStart(3, "0")}`),
  ...Array.from({ length: 82 }, (_, index) => `UX-${String(index + 119).padStart(3, "0")}`)
];

function textFor(id, nextId) {
  const start = register.indexOf(id);
  const end = nextId ? register.indexOf(nextId, start + id.length) : register.length;
  const raw = register.slice(start + id.length, end < 0 ? register.length : end)
    .replace(/Daily Identity V3\.6 - Grand Sealed 200-Feature Register/g, " ")
    .replace(/\s+/g, " ").trim();
  return raw.replace(/\s+(?:Core V3\.0|V3\.[2346] amendment|New safe V3\.6 addition|Optional V3\.0).*$/i, "").trim();
}

function owner(id) {
  const value = Number(id.slice(4));
  if (id.startsWith("DLY")) {
    if (value <= 38) return "contracts / SDK / indexer";
    if (value <= 62 || (value >= 109 && value <= 111)) return "mail client / relay / API";
    if (value <= 89) return "contracts / SDK / indexer";
    if (value <= 108) return "campaign service / escrow";
    return "platform operations";
  }
  if (value <= 128) return "user names UI";
  if (value <= 145 || (value >= 159 && value <= 172) || value === 186 || value === 187 || value === 200) return "user mail UI";
  if (value <= 156 || (value >= 175 && value <= 177) || (value >= 183 && value <= 185) || (value >= 188 && value <= 194)) return "marketer UI";
  return "admin UI / API";
}

function baseline(id) {
  const value = Number(id.slice(4));
  if (id.startsWith("UX")) return value >= 178 && value <= 199 ? "Daily_Admin_Simulator_V3_6.html" : "Daily_User_Marketer_Simulator_V3_6.html";
  return value >= 63 && value <= 89 ? "both simulators" : value >= 90 && value <= 108 ? "Daily_User_Marketer_Simulator_V3_6.html (Marketer Studio)" : "Daily_User_Marketer_Simulator_V3_6.html";
}

const partial = new Set([
  "DLY-001", "DLY-004", "DLY-005", "DLY-007", "DLY-009", "DLY-010", "DLY-011", "DLY-015", "DLY-019", "DLY-020", "DLY-021", "DLY-023", "DLY-025", "DLY-026", "DLY-027", "DLY-028", "DLY-029", "DLY-032", "DLY-039", "DLY-040", "DLY-041", "DLY-042", "DLY-043", "DLY-044", "DLY-045", "DLY-046", "DLY-048", "DLY-049", "DLY-050", "DLY-052", "DLY-054", "DLY-057", "DLY-058", "DLY-059", "DLY-063", "DLY-064", "DLY-065", "DLY-071", "DLY-085", "DLY-086", "DLY-087", "DLY-090", "DLY-092", "DLY-093", "DLY-094", "DLY-095", "DLY-097", "DLY-099", "DLY-102", "DLY-103", "DLY-107", "DLY-108", "UX-119", "UX-120", "UX-121", "UX-122", "UX-129", "UX-130", "UX-131", "UX-132", "UX-134", "UX-135", "UX-136", "UX-137", "UX-138", "UX-139", "UX-140", "UX-141", "UX-142", "UX-143", "UX-144", "UX-146", "UX-147", "UX-148", "UX-149", "UX-150", "UX-151", "UX-152", "UX-153", "UX-154", "UX-155", "UX-156", "UX-157", "UX-158", "UX-163", "UX-164", "UX-168", "UX-178"
]);
function evidence(id) {
  if (!partial.has(id)) return "pending control/API/contract test and visual evidence";
  if (id.startsWith("UX")) return "partial UI adapter; simulator source baseline test passes";
  if (Number(id.slice(4)) <= 38 || (Number(id.slice(4)) >= 63 && Number(id.slice(4)) <= 89)) return "partial: packages/contracts + packages/sdk; contract compile passes";
  return "partial: user adapter/API persistence; API type-check and unit tests pass";
}

const lines = [
  "# Daily Identity V3.6 — sealed acceptance ledger",
  "",
  "This ledger is generated from the sealed PDF register. A box is checked only after the exact simulator route/control, production dependency, automated test, and verification evidence are present. `partial` and `missing` are deliberately unchecked.",
  "",
  "Independent control baseline: `docs/simulator-control-inventory.json` (208 user controls, 92 admin controls). Current audit state: **release blocked** — the live adapters cover only a small subset, and most sealed feature workflows still lack their required production contract/API/UI/test evidence.",
  "",
  "| Done | ID | Sealed requirement | Owner | Simulator baseline | Dependency / evidence | Audit status |",
  "|---|---|---|---|---|---|---|"
];
for (let index = 0; index < ids.length; index++) {
  const id = ids[index];
  lines.push(`| [ ] | ${id} | ${textFor(id, ids[index + 1]).replaceAll("|", "\\|")} | ${owner(id)} | ${baseline(id)} | ${evidence(id)} | ${partial.has(id) ? "partial" : "missing"} |`);
}
lines.push("", "## Acceptance rule", "", "No Testnet release, upload handoff, or deployment runbook is approved until every row is checked with a real implementation and evidence. Static simulator data and toast-only actions do not qualify.", "");
await writeFile(resolve("docs/implementation-checklist.md"), lines.join("\n"));
console.log(`Wrote sealed acceptance ledger with ${ids.length} unchecked rows.`);
