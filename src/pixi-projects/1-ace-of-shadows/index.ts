import * as PIXI from "pixi.js";
import { Group } from "@tweenjs/tween.js";
import { settings } from "./settings";
import { CardStack } from "./CardStack";

// Allow globalThis.__PIXI_APP__ for Pixi devTools
declare global {
	var __PIXI_APP__: PIXI.Application | undefined;
}

export const tweenGroup = new Group();

export async function init() {
	const app = await initializeApp();
	const background = await createBackground();
	const cardStack = new CardStack(144);
	const cardStack2 = new CardStack(0);

	cardStack2.x = 100;

	app.stage.addChild(background);
	app.stage.addChild(cardStack);
	app.stage.addChild(cardStack2);

	runCardTransferLoop(cardStack, cardStack2);

	return app;
}

async function runCardTransferLoop(
	cardStack: CardStack,
	cardStack2: CardStack,
) {
	while (cardStack.getLength() > 0) {
		await cardStack.transferTopCardTo(cardStack2);
	}
}

async function createBackground() {
	const backgroundUrl = "/assets/card table.webp";
	await PIXI.Assets.load(backgroundUrl);
	const background = PIXI.Sprite.from(backgroundUrl);
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
