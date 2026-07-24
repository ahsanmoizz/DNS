import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const workspace = resolve(import.meta.dirname, "../../..");
const normal = value => value.replace(/\r\n/g, "\n").replace(/<script type="module" crossorigin src="\/assets\/Daily_Admin_Simulator_V3_6-[^"]+\.js"><\/script>/, "").replace(/<\/script>\s*<\/body>/, "</script>\n</body>").replace(/>\s+</g, "><");
test("the admin build preserves the sealed simulator markup outside its live adapter", async () => {
  const [source, built] = await Promise.all([readFile(resolve(workspace, "Daily_Admin_Simulator_V3_6.html"), "utf8"), readFile(resolve(import.meta.dirname, "../dist/Daily_Admin_Simulator_V3_6.html"), "utf8")]);
  assert.equal(normal(built), normal(source));
});
