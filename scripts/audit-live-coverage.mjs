import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const configurations = [
  { id: "user", simulator: "Daily_User_Marketer_Simulator_V3_6.html", adapter: "apps/user-web/src/live-adapter.ts" },
  { id: "admin", simulator: "Daily_Admin_Simulator_V3_6.html", adapter: "apps/admin-web/src/live-adapter.ts" }
];
const functions = (source) => [...source.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map((match) => match[1]);
const liveAssignments = (source) => [...source.matchAll(/(?:asWindow|appWindow|window)\.([A-Za-z_$][\w$]*)\s*=/g)].map((match) => match[1]);

const audit = { generatedAt: new Date().toISOString(), applications: {} };
for (const config of configurations) {
  const [simulator, adapter] = await Promise.all([readFile(resolve(config.simulator), "utf8"), readFile(resolve(config.adapter), "utf8")]);
  const simulatedFunctions = [...new Set(functions(simulator))].sort();
  const overrides = [...new Set(liveAssignments(adapter))].sort();
  const unsupported = simulatedFunctions.filter((name) => !overrides.includes(name));
  audit.applications[config.id] = {
    simulator: config.simulator,
    adapter: config.adapter,
    simulatorFunctionCount: simulatedFunctions.length,
    adapterGlobalOverrideCount: overrides.length,
    simulatorFunctions: simulatedFunctions,
    adapterGlobalOverrides: overrides,
    notOverridden: unsupported,
    staticSimulationMarkers: [...simulator.matchAll(/\b(simulate|demo|mock|dummy)\b/gi)].length,
    toastOnlyButtons: [...simulator.matchAll(/onclick\s*=\s*(["'])[^"']*\btoast\(/gi)].length
  };
}
await writeFile(resolve("docs/live-coverage-audit.json"), `${JSON.stringify(audit, null, 2)}\n`);
for (const [id, report] of Object.entries(audit.applications)) {
  console.log(`${id}: ${report.adapterGlobalOverrideCount}/${report.simulatorFunctionCount} simulator functions replaced; ${report.notOverridden.length} remain simulator-owned; ${report.toastOnlyButtons} toast-only controls; ${report.staticSimulationMarkers} simulation markers.`);
}
