import simulator from "../../../Daily_User_Marketer_Simulator_V3_6.html?raw";

function mountSimulator(source: string) {
  const documentSource = new DOMParser().parseFromString(source, "text/html");
  document.querySelectorAll("style[data-daily-simulator]").forEach(node => node.remove());
  documentSource.head.querySelectorAll("style").forEach(style => { const copy = document.createElement("style"); copy.dataset.dailySimulator = "true"; copy.textContent = style.textContent; document.head.append(copy); });
  document.body.innerHTML = documentSource.body.innerHTML;
  for (const script of [...document.body.querySelectorAll("script")]) { const executable = document.createElement("script"); if (script.src) executable.src = script.src; else executable.textContent = script.textContent; script.replaceWith(executable); }
}

mountSimulator(simulator);
await import("./live-adapter.js");
