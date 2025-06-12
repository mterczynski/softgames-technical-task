import * as PIXI from "pixi.js";
import { Group } from "@tweenjs/tween.js";
import { settings } from "./settings";
import { Campfire } from "./Campfire";
import { addStatsJs } from "../addStatsJs";

// Allow globalThis.__PIXI_APP__ for Pixi devTools
declare global {
	var __PIXI_APP__: PIXI.Application | undefined;
}

export const tweenGroup = new Group();

export async function init() {
	const app = await initializeApp();
	const campfire = new Campfire();
	app.stage.addChild(campfire);
	campfire.x = settings.initialCanvasWidth / 2;
	campfire.y = settings.initialCanvasHeight / 2;

	const stats = addStatsJs();
	app.ticker.add((delta) => {
		campfire.updateParticles(delta);
		stats?.update?.();
	});

	return app;
}

async function initializeApp() {
	const app = new PIXI.Application({
		width: settings.initialCanvasWidth,
		height: settings.initialCanvasHeight,
		view: document.createElement("canvas"),
	});

	globalThis.__PIXI_APP__ = app;

	const canvas = app.view as HTMLCanvasElement;
	document.body.appendChild(canvas);
	canvas.classList.add("main-canvas");

	app.ticker.add(() => {
		tweenGroup.update();
	});

	return app;
}
