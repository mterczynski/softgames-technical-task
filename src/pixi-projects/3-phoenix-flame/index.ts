import { Group } from "@tweenjs/tween.js";
import { settings } from "./settings";
import { Campfire } from "./Campfire";
import { addStatsJs } from "../addStatsJs";
import { createFullscreenPixiApp } from "../createFullscreenPixiApp";

/** Global tween group for updating all tweens, can be refactored */
export const globalTweenGroup = new Group();

export async function init() {
	const { app } = createFullscreenPixiApp({
		width: settings.initialCanvasWidth,
		height: settings.initialCanvasHeight,
		globalTweenGroup: globalTweenGroup,
	});
	const campfire = new Campfire();
	app.stage.addChild(campfire);
	campfire.x = app.renderer.width / 2;
	campfire.y = app.renderer.height / 2;

	function resizeAll() {
		campfire.x = app.renderer.width / 2;
		campfire.y = app.renderer.height / 2;
	}
	window.addEventListener("resize", resizeAll);
	resizeAll();

	const stats = addStatsJs();
	app.ticker.add((delta) => {
		campfire.updateParticles(delta);
		stats?.update?.();
	});

	return app;
}
