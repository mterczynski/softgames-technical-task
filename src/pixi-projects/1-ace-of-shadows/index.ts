import * as PIXI from "pixi.js";
import { Group } from "@tweenjs/tween.js";
import { settings } from "./settings";
import { CardStack } from "./CardStack";
import { addStatsJs } from "../addStatsJs";

// Allow globalThis.__PIXI_APP__ for Pixi devTools
declare global {
	var __PIXI_APP__: PIXI.Application | undefined;
}

export const tweenGroup = new Group();

export async function init() {
	const app = await initializeApp();
	const background = await createBackground();
	const cardStacks = new PIXI.Container();
	const cardStack = new CardStack(144);
	const cardStack2 = new CardStack(0);
	cardStacks.addChild(cardStack);
	cardStacks.addChild(cardStack2);

	cardStack2.x = 100;

	app.stage.addChild(background);
	app.stage.addChild(cardStacks);

	const stats = addStatsJs();
	app.ticker.add(() => stats?.update?.());

	runCardTransferLoop(cardStack, cardStack2);

	const onResize = () => {
		const width = window.innerWidth;
		const height = window.innerHeight;
		app.renderer.resize(width, height);
		background.width = width;
		background.height = height;

		cardStacks.x = settings.cardStacksOffset.x;
		cardStacks.y = settings.cardStacksOffset.y;
	};

	// Responsive: handle window resize for card stacks and background
	window.addEventListener("resize", onResize);

	onResize();

	return app;
}

async function runCardTransferLoop(
	cardStack: CardStack,
	cardStack2: CardStack,
) {
	while (cardStack.getLength() > 0) {
		await new Promise((resolve) =>
			setTimeout(resolve, settings.transferIntervalMs),
		);
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
