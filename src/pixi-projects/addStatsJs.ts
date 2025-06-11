// Simple wrapper for stats.js for PixiJS projects
import Stats from "stats.js";

export function addStatsJs() {
	let stats = document.getElementById("pixi-stats") as any;
	if (!stats) {
		stats = new Stats();
		stats.showPanel(0); // 0: fps
		stats.dom.id = "pixi-stats";
		stats.dom.style.position = "fixed";
		stats.dom.style.left = "0px";
		stats.dom.style.top = "0px";
		stats.dom.style.zIndex = 10000;
		document.body.appendChild(stats.dom);
	}
	return stats;
}
