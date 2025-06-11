import * as PIXI from "pixi.js";
import { Group } from "@tweenjs/tween.js";
import { settings } from "./settings";
import { MagicWordsApiResponse } from "./apiTypes";
import { Character } from "./Character";
import TWEEN from "@tweenjs/tween.js";

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
		// Move 30px closer to the center on x, and 20px higher on y
		if (avatar.position === "left") {
			char.x = 170;
		} else {
			char.x = app.screen.width - 350;
		}
		char.y = app.screen.height - 450;
		// Do not add to stage yet
		characterMap.set(avatar.name, char);
	}

	// --- Dialogue State ---
	let dialogueIndex = 0;
	let dialogueContainer: PIXI.Container | null = null;
	let currentSpeaker: Character | null = null;

	function clearDialogue() {
		if (dialogueContainer) app.stage.removeChild(dialogueContainer);
		if (currentSpeaker) {
			app.stage.removeChild(currentSpeaker);
			currentSpeaker = null;
		}
	}

	function getSpeaker(line: MagicWordsApiResponse["dialogue"][number]) {
		const char = characterMap.get(line.name);
		if (char) {
			char.speak(line.text);
			app.stage.addChild(char);
			currentSpeaker = char;
			return { char, displayName: line.name };
		}
		return { char: null, displayName: line.name };
	}

	function showNextDialogue() {
		clearDialogue();
		if (dialogueIndex >= data.dialogue.length) {
			fadeOutBackgroundAndShowTheEnd(app, background);
			return;
		}
		const line = data.dialogue[dialogueIndex];
		const { char, displayName } = getSpeaker(line);
		dialogueContainer = renderDialogueLine(
			line.text,
			data.emojies,
			displayName,
			!char,
		);
		dialogueContainer.x = 60;
		dialogueContainer.y = char ? char.y - 80 : app.screen.height - 540;
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

async function createBackground() {
	await PIXI.Assets.load("/assets/bbt-background.jpg");
	const background = PIXI.Sprite.from("/assets/bbt-background.jpg");
	background.width = settings.canvasWidth;
	background.height = settings.canvasHeight;
	background.alpha = 0.35;

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
	showSpeakerName = false,
): PIXI.Container {
	const container = new PIXI.Container();
	let y = 0;
	if (showSpeakerName) {
		const speakerText = new PIXI.Text(`${speaker}:`, {
			fill: 0x000000,
			fontSize: 18,
			fontFamily: "Arial",
			fontWeight: "bold",
		});
		speakerText.x = 0;
		speakerText.y = 0;
		container.addChild(speakerText);
		y = speakerText.height + 4;
	}
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
				sprite.y = y;
				container.addChild(sprite);
				elements.push(sprite);
				if (sprite.height > maxHeight) maxHeight = sprite.height;
				x += 36;
				continue;
			} else {
				// Unknown emoji: render as (emojiName tone)
				const fallbackText = `(${emojiName} tone)`;
				const textObj = new PIXI.Text(fallbackText, {
					fill: 0x000000,
					fontSize: 22,
					fontFamily: "Arial",
					fontWeight: "bold",
				});
				textObj.x = x;
				textObj.y = y;
				container.addChild(textObj);
				elements.push(textObj);
				if (textObj.height > maxHeight) maxHeight = textObj.height;
				x += textObj.width + 4;
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
		textObj.y = y;
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
		maxHeight + padding + y,
		12,
	);
	bg.endFill();
	container.addChildAt(bg, 0);
	return container;
}

function fadeOutBackgroundAndShowTheEnd(
	app: PIXI.Application,
	background: PIXI.Sprite,
) {
	// Fade out background over 2 seconds using tween
	const fadeDuration = 2000;
	const theEndDuration = 3000;

	new TWEEN.Tween(background, tweenGroup)
		.to({ alpha: 0 }, fadeDuration)
		.easing(TWEEN.Easing.Quadratic.Out)
		.onComplete(() => {
			showTheEnd();
		})
		.start();

	function showTheEnd() {
		const theEndText = new PIXI.Text("The end", {
			fill: 0xffffff,
			fontSize: 64,
			fontWeight: "bold",
			fontFamily: "Arial",
			align: "center",
			dropShadow: true,
			dropShadowColor: 0x000000,
			dropShadowBlur: 8,
		});
		theEndText.anchor.set(0.5);
		theEndText.x = app.screen.width / 2;
		theEndText.y = app.screen.height / 2;
		theEndText.alpha = 0;
		app.stage.addChild(theEndText);

		console.log("showTheEnd called");

		new TWEEN.Tween(theEndText, tweenGroup)
			.to({ alpha: 1 }, theEndDuration)
			.easing(TWEEN.Easing.Quadratic.InOut)
			.start();
	}
}
