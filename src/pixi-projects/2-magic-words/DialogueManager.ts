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

	public onResize(width: number, height: number) {
		this.resizeCharacter(width, height);
		this.resizeDialogue(width, height);
	}

	private resizeCharacter(appWidth: number, appHeight: number) {
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
				Math.min(appWidth * MIN_MARGIN_WIDTH_PERCENTAGE, MAX_MARGIN),
			);
			if (avatar.position === "left") {
				character.x = margin; // margin from left edge
			} else {
				character.x = appWidth - CHARACTER_WIDTH - margin; // margin from right edge
			}
			character.y = appHeight - 450;
		}
	}

	private resizeDialogue(appWidth: number, appHeight: number) {
		// Re-render dialogue cloud with new width if present
		if (this.dialogueContainer && this.dialogueIndex > 0) {
			// Get current dialogue line
			const line = this.data.dialogue[this.dialogueIndex - 1];
			const { char, displayName } = this.getSpeaker(line);
			// Remove old container
			this.app.stage.removeChild(this.dialogueContainer);
			// Re-render with new width
			this.dialogueContainer = this.renderDialogueLine(
				line.text,
				this.data.emojies,
				displayName,
				!char,
				appWidth - 120, // leave margin for padding
			);
			this.dialogueContainer.x = 60;
			this.dialogueContainer.y = char ? char.y - 80 : appHeight - 540;
			this.app.stage.addChild(this.dialogueContainer);
		} else if (this.dialogueContainer) {
			this.dialogueContainer.x = 60;
			this.dialogueContainer.y = appHeight - 540;
		}
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
		maxWidth: number = 480, // default fallback
	): PIXI.Container {
		const container = new PIXI.Container();
		let y = 0;
		let x = 0;
		let maxLineWidth = 0;
		const padding = 12;
		const lineSpacing = 8;
		const emojiSize = 32;
		const fontSize = 22;
		const fontStyle: Partial<PIXI.ITextStyle> = {
			fill: 0x000000,
			fontSize,
			fontFamily: "Arial",
			fontWeight: "bold",
		};
		if (showSpeakerName) {
			const speakerText = new PIXI.Text(`${speaker}:`, {
				...fontStyle,
				fontSize: 18,
			} as Partial<PIXI.ITextStyle>);
			speakerText.x = 0;
			speakerText.y = 0;
			container.addChild(speakerText);
			y = speakerText.height + 4;
		}
		const parts = text.split(/({[^}]+})/g).filter(Boolean);
		let lineY = y;
		let lineMaxHeight = 0;
		x = 0;
		for (const part of parts) {
			let displayObj: PIXI.DisplayObject;
			let partWidth = 0;
			let partHeight = 0;
			const emojiMatch = part.match(/^{(.+)}$/);
			if (emojiMatch) {
				const emojiName = emojiMatch[1];
				const emoji = emojies.find((e) => e.name === emojiName);
				if (emoji) {
					const sprite = PIXI.Sprite.from(emoji.url);
					sprite.width = sprite.height = emojiSize;
					displayObj = sprite;
					partWidth = emojiSize + 4;
					partHeight = emojiSize;
				} else {
					const fallbackText = `(${emojiName} tone)`;
					const textObj = new PIXI.Text(fallbackText, fontStyle);
					displayObj = textObj;
					partWidth = textObj.width + 4;
					partHeight = textObj.height;
				}
			} else {
				const textObj = new PIXI.Text(part, fontStyle);
				displayObj = textObj;
				partWidth = textObj.width + 4;
				partHeight = textObj.height;
			}
			// Wrap to next line if needed
			if (x + partWidth > maxWidth - padding) {
				x = 0;
				lineY += lineMaxHeight + lineSpacing;
				lineMaxHeight = 0;
			}
			displayObj.x = x;
			displayObj.y = lineY;
			container.addChild(displayObj);
			x += partWidth;
			if (partHeight > lineMaxHeight) lineMaxHeight = partHeight;
			if (x > maxLineWidth) maxLineWidth = x;
		}
		const totalHeight = lineY + lineMaxHeight + padding / 2;
		const bg = new PIXI.Graphics();
		bg.beginFill(0xffffff, 1);
		bg.drawRoundedRect(
			-padding / 2,
			-padding / 2,
			Math.max(maxLineWidth + padding, 120),
			totalHeight,
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
