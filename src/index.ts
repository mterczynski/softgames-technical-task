import * as PIXI from "pixi.js";
import { settings } from "./settings";

// Allow globalThis.__PIXI_APP__ for Pixi devTools
declare global {
  var __PIXI_APP__: PIXI.Application | undefined;
}

export async function init() {
	const app = await initializeApp();
	const background = await createBackground();

	app.stage.addChild(background);

	return app
}

async function createBackground() {
	await PIXI.Assets.load("/assets/metal-texture.webp")
	const background = PIXI.Sprite.from("/assets/metal-texture.webp");
	background.width = settings.canvasWidth;
	background.height = settings.canvasHeight;

	return background;
}

async function initializeApp() {
	const app = new PIXI.Application();
	await app.init({
		width: settings.canvasWidth,
		height: settings.canvasHeight,
		view: document.createElement('canvas')
	});

	globalThis.__PIXI_APP__ = app;

	const canvas = app.canvas;

	document.body.appendChild(canvas);
	canvas.classList.add("main-canvas");
	return app;
}

init();
