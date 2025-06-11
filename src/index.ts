import * as PIXI from "pixi.js";
import { settings } from "./settings";
import { CardStack } from "./CardStack";

// Allow globalThis.__PIXI_APP__ for Pixi devTools
declare global {
  var __PIXI_APP__: PIXI.Application | undefined;
}

export async function init() {
	const app = await initializeApp();
	const background = await createBackground();
	const cardStack = new CardStack(40);
	const cardStack2 = new CardStack(10);

	cardStack2.x = 100;

	app.stage.addChild(background);
	app.stage.addChild(cardStack);
	app.stage.addChild(cardStack2);

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
	const app = new PIXI.Application({
		width: settings.canvasWidth,
		height: settings.canvasHeight,
		view: document.createElement('canvas')
	});

	globalThis.__PIXI_APP__ = app;

	const canvas = app.view as HTMLCanvasElement;
	document.body.appendChild(canvas);
	canvas.classList.add("main-canvas");
	return app;
}

init();
