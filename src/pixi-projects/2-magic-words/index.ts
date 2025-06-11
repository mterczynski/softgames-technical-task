import * as PIXI from "pixi.js";
import { Group } from "@tweenjs/tween.js";
import { settings } from "./settings";
import { MagicWordsApiResponse } from "./apiTypes";

// Allow globalThis.__PIXI_APP__ for Pixi devTools
declare global {
	var __PIXI_APP__: PIXI.Application | undefined;
}

export const tweenGroup = new Group();

export async function init() {
	const dataPromise = loadData();
	const app = await initializeApp();
	const background = await createBackground();

	app.stage.addChild(background);

	await dataPromise;

	return app;
}

async function loadData() {
	const data = await fetch(settings.apiUrl);
	const jsonDataPromise = data.json();

	// preload avatars and emojies
	jsonDataPromise.then((data: MagicWordsApiResponse) => {
		data.avatars.forEach((avatar) => {
			fetch(avatar.url);
		});
		data.emojies.forEach((emoji) => {
			fetch(emoji.url);
		});
	});

	return jsonDataPromise;
}

function createCharacters() {}

async function createBackground() {
	await PIXI.Assets.load("/assets/metal-texture.webp");
	const background = PIXI.Sprite.from("/assets/metal-texture.webp");
	background.width = settings.canvasWidth;
	background.height = settings.canvasHeight;

	return background;
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
