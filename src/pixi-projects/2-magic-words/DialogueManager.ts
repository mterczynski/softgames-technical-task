import * as PIXI from "pixi.js";
import { MagicWordsApiResponse } from "./apiTypes";
import { Character } from "./Character";
import { tweenGroup } from "./index";
import TWEEN from "@tweenjs/tween.js";
import { settings } from "./settings";

export class DialogueManager {
	private characterMap = new Map<string, Character>();
	private dialogueIndex = 0;
	private dialogueContainer: PIXI.Container | null = null;
	private currentSpeaker: Character | null = null;

	constructor(
		private app: PIXI.Application,
		private data: MagicWordsApiResponse,
		private background: PIXI.Sprite,
	) {
		this.createCharacterMap();
	}

	private createCharacterMap() {
		this.characterMap.clear();
		for (const avatar of this.data.avatars) {
			const char = new Character(avatar.url);
			if (avatar.position === "left") {
				char.x = 170;
			} else {
				char.x = this.app.screen.width - 350;
			}
			char.y = this.app.screen.height - 450;
			this.characterMap.set(avatar.name, char);
		}
	}

	public start() {
		this.dialogueIndex = 0;
		this.dialogueContainer = null;
		this.currentSpeaker = null;
		this.showNextDialogue();
		const canvas = this.app.view as HTMLCanvasElement;
		canvas.addEventListener("pointerdown", this.showNextDialogue);
	}

	public resizeCharacter(width: number, height: number) {
		// Use a percentage of width, clamped to sensible min/max pixel values
		const MIN_MARGIN_WIDTH_PERCENTAGE = 0.08;
		const MIN_MARGIN_PX = 24;
		const MAX_MARGIN = 120;
		const CHARACTER_WIDTH = 128;
		for (const [name, character] of this.characterMap) {
			const avatar = this.data.avatars.find((a) => a.name === name);
			if (!avatar) continue;
			const margin = Math.max(
				MIN_MARGIN_PX,
				Math.min(width * MIN_MARGIN_WIDTH_PERCENTAGE, MAX_MARGIN),
			);
			if (avatar.position === "left") {
				character.x = margin; // margin from left edge
			} else {
				character.x = width - CHARACTER_WIDTH - margin; // margin from right edge
			}
			character.y = height - 450;
		}
	}

	public resizeDialogue(height: number) {
		// Move dialogue cloud if present
		if (this.dialogueContainer && this.currentSpeaker) {
			this.dialogueContainer.x = 60;
			this.dialogueContainer.y = this.currentSpeaker.y - 80;
		} else if (this.dialogueContainer) {
			this.dialogueContainer.x = 60;
			this.dialogueContainer.y = height - 540;
		}
	}

	public onResize(width: number, height: number) {
		this.resizeCharacter(width, height);
		this.resizeDialogue(height);
	}

	private clearDialogue = () => {
		if (this.dialogueContainer)
			this.app.stage.removeChild(this.dialogueContainer);
		if (this.currentSpeaker) {
			this.app.stage.removeChild(this.currentSpeaker);
			this.currentSpeaker = null;
		}
	};

	private getSpeaker(line: MagicWordsApiResponse["dialogue"][number]) {
		const char = this.characterMap.get(line.name);
		if (char) {
			this.app.stage.addChild(char);
			this.currentSpeaker = char;
			return { char, displayName: line.name };
		}
		return { char: null, displayName: line.name };
	}

	private showNextDialogue = () => {
		this.clearDialogue();
		if (this.dialogueIndex >= this.data.dialogue.length) {
			this.fadeOutBackgroundAndShowTheEnd();
			return;
		}
		const line = this.data.dialogue[this.dialogueIndex];
		const { char, displayName } = this.getSpeaker(line);
		this.dialogueContainer = this.renderDialogueLine(
			line.text,
			this.data.emojies,
			displayName,
			!char,
		);
		this.dialogueContainer.x = 60;
		this.dialogueContainer.y = char
			? char.y - 80
			: this.app.screen.height - 540;
		this.app.stage.addChild(this.dialogueContainer);
		this.dialogueIndex++;
	};

	private renderDialogueLine(
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
					if (sprite.height > maxHeight) maxHeight = sprite.height;
					x += 36;
					continue;
				} else {
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
					if (textObj.height > maxHeight) maxHeight = textObj.height;
					x += textObj.width + 4;
					continue;
				}
			}
			const textObj = new PIXI.Text(part, {
				fill: 0x000000,
				fontSize: 22,
				fontFamily: "Arial",
				fontWeight: "bold",
			});
			textObj.x = x;
			textObj.y = y;
			container.addChild(textObj);
			if (textObj.height > maxHeight) maxHeight = textObj.height;
			x += textObj.width + 4;
		}
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

	private fadeOutBackgroundAndShowTheEnd() {
		const fadeDuration = settings.backgroundFadeOutDurationMs;
		new TWEEN.Tween(this.background, tweenGroup)
			.to({ alpha: 0 }, fadeDuration)
			.easing(TWEEN.Easing.Quadratic.Out)
			.onComplete(() => {
				this.showTheEnd();
			})
			.start();
	}

	private showTheEnd() {
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
		theEndText.x = this.app.screen.width / 2;
		theEndText.y = this.app.screen.height / 2;
		theEndText.alpha = 0;
		this.app.stage.addChild(theEndText);
		new TWEEN.Tween(theEndText, tweenGroup)
			.to({ alpha: 1 }, settings.theEndFadeInDurationMs)
			.easing(TWEEN.Easing.Quadratic.InOut)
			.start();
	}
}
