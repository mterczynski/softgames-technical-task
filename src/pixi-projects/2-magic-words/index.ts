import * as PIXI from "pixi.js";
import { Group } from "@tweenjs/tween.js";
import { settings } from "./settings";
import { MagicWordsApiResponse } from "./apiTypes";
import { Character } from "./Character";

// Allow globalThis.__PIXI_APP__ for Pixi devTools
declare global {
	var __PIXI_APP__: PIXI.Application | undefined;
}

export const tweenGroup = new Group();

export async function init() {
	const dataPromise = loadData();
	const app = await initializeApp();
	const background = await createBackground();
	const data: MagicWordsApiResponse = await dataPromise;

	app.stage.addChild(background);

	// Create a map of characters by name
	const characterMap = new Map<string, Character>();
	for (const avatar of data.avatars) {
		const char = new Character(avatar.name, avatar.url);
		char.x = avatar.position === "left" ? 100 : app.screen.width - 300;
		char.y = app.screen.height - 400;
		// Do not add to stage yet
		characterMap.set(avatar.name, char);
	}

	// Dialogue display state
	let dialogueIndex = 0;
	let dialogueContainer: PIXI.Container | null = null;
	let currentSpeaker: Character | null = null;

	function showNextDialogue() {
		if (dialogueContainer) {
			app.stage.removeChild(dialogueContainer);
		}
		if (currentSpeaker) {
			app.stage.removeChild(currentSpeaker);
			currentSpeaker = null;
		}
		if (dialogueIndex >= data.dialogue.length) return;
		const line = data.dialogue[dialogueIndex];
		const char = characterMap.get(line.name);
		if (char) {
			char.speak(line.text);
			app.stage.addChild(char);
			currentSpeaker = char;
		}
		dialogueContainer = renderDialogueLine(line.text, data.emojies, line.name);
		dialogueContainer.x = 60;
		dialogueContainer.y = 40;
		app.stage.addChild(dialogueContainer);
		dialogueIndex++;
	}

	// Show first dialogue
	showNextDialogue();

	// Advance dialogue on click (cast app.view to HTMLCanvasElement)
	const canvas = app.view as HTMLCanvasElement;
	canvas.addEventListener("pointerdown", showNextDialogue);

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
	await PIXI.Assets.load("/assets/bbt-background.jpg");
	const background = PIXI.Sprite.from("/assets/bbt-background.jpg");
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

function renderDialogueLine(
	text: string,
	emojies: MagicWordsApiResponse["emojies"],
	speaker: string,
): PIXI.Container {
	const container = new PIXI.Container();
	const parts = text.split(/({[^}]+})/g).filter(Boolean);
	let x = 0;
	let maxHeight = 0;
	const elements: PIXI.DisplayObject[] = [];
	for (const part of parts) {
		const emojiMatch = part.match(/^{(.+)}$/);
		if (emojiMatch) {
			const emojiName = emojiMatch[1];
			const emoji = emojies.find((e) => e.name === emojiName);
			if (emoji) {
				const sprite = PIXI.Sprite.from(emoji.url);
				sprite.width = sprite.height = 32;
				sprite.x = x;
				container.addChild(sprite);
				elements.push(sprite);
				if (sprite.height > maxHeight) maxHeight = sprite.height;
				x += 36;
				continue;
			}
		}
		// Render text
		const textObj = new PIXI.Text(part, {
			fill: 0x000000,
			fontSize: 22,
			fontFamily: "Arial",
			fontWeight: "bold",
		});
		textObj.x = x;
		container.addChild(textObj);
		elements.push(textObj);
		if (textObj.height > maxHeight) maxHeight = textObj.height;
		x += textObj.width + 4;
	}
	// Add white background behind the text and emojis
	const padding = 12;
	const bg = new PIXI.Graphics();
	bg.beginFill(0xffffff, 1);
	bg.drawRoundedRect(
		-padding / 2,
		-padding / 2,
		x + padding,
		maxHeight + padding,
		12,
	);
	bg.endFill();
	container.addChildAt(bg, 0);
	return container;
}
