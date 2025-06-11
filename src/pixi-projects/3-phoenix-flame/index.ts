import * as PIXI from "pixi.js";
import { Group } from "@tweenjs/tween.js";
import { settings } from "./settings";
import { Campfire } from "./Campfire";

// Allow globalThis.__PIXI_APP__ for Pixi devTools
declare global {
	var __PIXI_APP__: PIXI.Application | undefined;
}

export const tweenGroup = new Group();

export async function init() {
	const app = await initializeApp();
	const campfire = new Campfire();
	app.stage.addChild(campfire);
	campfire.x = settings.canvasWidth / 2;
	campfire.y = settings.canvasHeight / 2;

	app.ticker.add((delta) => {
		campfire.updateParticles(delta);
	});

	return app;
}

async function initializeApp() {
	const app = new PIXI.Application({
		width: settings.canvasWidth,
		height: settings.canvasHeight,
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
