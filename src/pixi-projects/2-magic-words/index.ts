import * as PIXI from "pixi.js";
import { Group } from "@tweenjs/tween.js";
import { settings } from "./settings";
import { MagicWordsApiResponse } from "./apiTypes";
import { DialogueManager } from "./DialogueManager";
import { addStatsJs } from "../addStatsJs";
import { createFullscreenPixiApp } from "../createFullscreenPixiApp";

export const tweenGroup = new Group();

export async function init() {
	const { app } = createFullscreenPixiApp({
		width: settings.initialCanvasWidth,
		height: settings.initialCanvasHeight,
		tweenGroup,
	});
	const background = await createBackground();
	const data: MagicWordsApiResponse = await loadData();
	app.stage.addChild(background);
	const dialogueManager = new DialogueManager(app, data, background);
	dialogueManager.start();

	const stats = addStatsJs();
	app.ticker.add(() => {
		stats?.update?.();
	});

	function resizeAll() {
		background.width = app.renderer.width;
		background.height = app.renderer.height;
		if (dialogueManager.onResize) {
			dialogueManager.onResize(app.renderer.width, app.renderer.height);
		}
	}
	window.addEventListener("resize", resizeAll);
	resizeAll();

	return app;
}

async function createBackground() {
	const url = "/assets/bbt-background.jpg";
	await PIXI.Assets.load(url);
	const background = PIXI.Sprite.from(url);
	background.width = settings.initialCanvasWidth;
	background.height = settings.initialCanvasHeight;
	background.alpha = 0.35;

	return background;
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
