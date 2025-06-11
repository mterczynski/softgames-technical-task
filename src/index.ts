import * as PIXI from "pixi.js";
import { settings } from "./settings";
import { Card } from "./Card";

// Allow globalThis.__PIXI_APP__ for Pixi devTools
declare global {
  var __PIXI_APP__: PIXI.Application | undefined;
}

export async function init() {
	const app = await initializeApp();
	const background = await createBackground();
	const cardStack = new PIXI.Container();
	const cardCount = 144;
	const cards = new Array(cardCount).fill(null).map((_, index) => {
		const card = new Card();
		cardStack.addChild(card);
		card.y = index * 5 // stack cards vertically
		return card;
	});

	app.stage.addChild(background);
	app.stage.addChild(cardStack);

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
