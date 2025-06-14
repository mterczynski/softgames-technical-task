import * as PIXI from "pixi.js";
import { MagicWordsApiResponse } from "./apiTypes";
import { Character } from "./Character";
import { globalTweenGroup } from "./index";
import TWEEN from "@tweenjs/tween.js";
import { settings } from "./settings";

export class DialogueManager {
	private characterMap = new Map<string, Character>();
	private dialogueIndex = 0;
	private dialogueContainer: PIXI.Container | null = null;
	private currentSpeaker: Character | null = null;
	private theEndText: PIXI.Text | null = null;
	private hasShownTheEnd = false;

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
			const character = new Character(avatar.url);
			if (avatar.position === "left") {
				character.x = 170;
			} else {
				character.x = this.app.screen.width - 350;
			}
			this.characterMap.set(avatar.name, character);
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
		if (this.dialogueIndex >= this.data.dialogue.length) {
			// At end screen, do not show any character or dialogue
			this.clearDialogue(true);
			// Also resize 'The end' text if present
			if (this.theEndText) {
				const fontSize = Math.max(32, Math.min(96, Math.floor(width * 0.08)));
				this.theEndText.style = new PIXI.TextStyle({
					fill: 0xffffff,
					fontSize,
					fontWeight: "bold",
					fontFamily: "Arial",
					align: "center",
					dropShadow: true,
					dropShadowColor: 0x000000,
					dropShadowBlur: 8,
				});
				this.theEndText.x = width / 2;
				this.theEndText.y = height / 2;
			}
			return;
		}
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
			character.y = appHeight - (this.isMobile(appWidth) ? 360 : 460);
		}
	}

	private isMobile(appWidth: number) {
		return appWidth < 600;
	}

	private getMarginX(appWidth: number) {
		return this.isMobile(appWidth) ? 12 : 60;
	}

	private resizeDialogue(appWidth: number, appHeight: number) {
		const marginX = this.getMarginX(appWidth);
		const maxWidth = appWidth - marginX * 2;
		const offsetFromHead = 10;
		// Re-render dialogue cloud with new width if present
		if (this.dialogueContainer && this.dialogueIndex > 0) {
			// Get current dialogue line
			const line = this.data.dialogue[this.dialogueIndex - 1];
			const { character: character, displayName } = this.getSpeaker(line);
			// Remove old container
			this.app.stage.removeChild(this.dialogueContainer);
			// Re-render with new width
			this.dialogueContainer = this.renderDialogueLine(
				line.text,
				this.data.emojies,
				displayName,
				!character,
				maxWidth,
			);
			// Position dialogue cloud: left for left, right for right
			if (
				character &&
				this.data.avatars.find((a) => a.name === displayName)?.position ===
					"left"
			) {
				this.dialogueContainer.x = marginX;
				this.dialogueContainer.y =
					character.y - this.dialogueContainer.height - offsetFromHead;
			} else if (character) {
				this.dialogueContainer.x =
					appWidth - this.dialogueContainer.width - marginX;
				this.dialogueContainer.y =
					character.y - this.dialogueContainer.height - offsetFromHead;
			} else {
				this.dialogueContainer.x = marginX;
				this.dialogueContainer.y =
					(appHeight - this.dialogueContainer.height) / 2; // Center the dialogue cloud vertically if there is no character
			}
			this.app.stage.addChild(this.dialogueContainer);
		} else if (this.dialogueContainer) {
			this.dialogueContainer.x = marginX;
			this.dialogueContainer.y =
				appHeight - this.dialogueContainer.height - offsetFromHead;
		}
	}

	private clearDialogue = (removeCharacter: boolean = true) => {
		if (this.dialogueContainer)
			this.app.stage.removeChild(this.dialogueContainer);
		if (removeCharacter && this.currentSpeaker) {
			this.app.stage.removeChild(this.currentSpeaker);
			this.currentSpeaker = null;
		}
	};

	private getSpeaker(
		line: MagicWordsApiResponse["dialogue"][number],
		addToStage: boolean = true,
	) {
		const character = this.characterMap.get(line.name);
		if (character) {
			if (addToStage) this.app.stage.addChild(character);
			this.currentSpeaker = character;
			return { character, displayName: line.name };
		}
		return { character: null, displayName: line.name };
	}

	private showNextDialogue = () => {
		this.clearDialogue();
		if (this.dialogueIndex >= this.data.dialogue.length) {
			if (!this.hasShownTheEnd) {
				this.hasShownTheEnd = true;
				this.fadeOutBackgroundAndShowTheEnd();
			}
			return;
		}
		const line = this.data.dialogue[this.dialogueIndex];
		const { character: character, displayName } = this.getSpeaker(line);
		const appWidth = this.app.screen.width;
		const appHeight = this.app.screen.height;
		// Responsive: use smaller margins and maxWidth on mobile
		const marginX = this.getMarginX(appWidth);
		const maxWidth = appWidth - marginX * 2;
		const offsetFromHead = 24;
		this.dialogueContainer = this.renderDialogueLine(
			line.text,
			this.data.emojies,
			displayName,
			!character,
			maxWidth,
		);
		// Position dialogue cloud: left for left, right for right
		if (
			character &&
			this.data.avatars.find((a) => a.name === displayName)?.position === "left"
		) {
			this.dialogueContainer.x = marginX;
			this.dialogueContainer.y =
				character.y - this.dialogueContainer.height - offsetFromHead;
		} else if (character) {
			this.dialogueContainer.x =
				appWidth - this.dialogueContainer.width - marginX;
			this.dialogueContainer.y =
				character.y - this.dialogueContainer.height - offsetFromHead;
		} else {
			this.dialogueContainer.x = marginX;
			this.dialogueContainer.y =
				(appHeight - this.dialogueContainer.height) / 2; // Center the dialogue cloud vertically if there is no character
		}
		this.app.stage.addChild(this.dialogueContainer);
		this.dialogueIndex++;
		this.resizeDialogue(appWidth, appHeight);
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
		const padding = 8; // reduce padding for a more compact cloud
		const lineSpacing = 4; // reduce line spacing
		const emojiSize = 28; // slightly smaller emojis
		const fontSize = 20; // slightly smaller font
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
		// Improved: Tokenize text into words and emoji tokens for better wrapping
		const parts = text.split(/({[^}]+})/g).filter(Boolean);
		let tokens: Array<{ type: "emoji" | "text"; value: string }> = [];
		for (const part of parts) {
			const emojiMatch = part.match(/^{(.+)}$/);
			if (emojiMatch) {
				tokens.push({ type: "emoji", value: emojiMatch[1] });
			} else {
				// Split text into words, keeping spaces
				const words = part.split(/(\s+)/g).filter(Boolean);
				for (const word of words) {
					tokens.push({ type: "text", value: word });
				}
			}
		}
		let lineY = y;
		let lineMaxHeight = 0;
		x = 0;
		for (const token of tokens) {
			let displayObj: PIXI.DisplayObject;
			let partWidth = 0;
			let partHeight = 0;
			if (token.type === "emoji") {
				const emoji = emojies.find((e) => e.name === token.value);
				if (emoji) {
					const sprite = PIXI.Sprite.from(emoji.url);
					sprite.width = sprite.height = emojiSize;
					displayObj = sprite;
					partWidth = emojiSize + 4;
					partHeight = emojiSize;
				} else {
					const fallbackText = `(${token.value} tone)`;
					const textObj = new PIXI.Text(fallbackText, fontStyle);
					displayObj = textObj;
					partWidth = textObj.width + 4;
					partHeight = textObj.height;
				}
			} else {
				const textObj = new PIXI.Text(token.value, fontStyle);
				displayObj = textObj;
				partWidth = textObj.width;
				partHeight = textObj.height;
			}
			// Only wrap if token is not just a space
			if (token.type !== "text" || token.value.trim() !== "") {
				if (x + partWidth > maxWidth - padding && x > 0) {
					x = 0;
					lineY += lineMaxHeight + lineSpacing;
					lineMaxHeight = 0;
				}
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

		// Remove any shifting of children or y offset hacks
		return container;
	}

	private fadeOutBackgroundAndShowTheEnd() {
		const fadeDuration = settings.backgroundFadeOutDurationMs;
		new TWEEN.Tween(this.background, globalTweenGroup)
			.to({ alpha: 0 }, fadeDuration)
			.easing(TWEEN.Easing.Quadratic.Out)
			.onComplete(() => {
				this.showTheEnd();
			})
			.start();
	}

	private showTheEnd() {
		const appWidth = this.app.screen.width;
		const appHeight = this.app.screen.height;
		// Remove any previous 'The end' text
		if (this.theEndText && this.theEndText.parent) {
			this.theEndText.parent.removeChild(this.theEndText);
		}
		// Responsive font size: clamp between 32 and 96, scale with width
		const fontSize = Math.max(32, Math.min(96, Math.floor(appWidth * 0.08)));
		this.theEndText = new PIXI.Text("The end", {
			fill: 0xffffff,
			fontSize,
			fontWeight: "bold",
			fontFamily: "Arial",
			align: "center",
			dropShadow: true,
			dropShadowColor: 0x000000,
			dropShadowBlur: 8,
		});
		this.theEndText.anchor.set(0.5);
		this.theEndText.x = appWidth / 2;
		this.theEndText.y = appHeight / 2;
		this.theEndText.alpha = 0;
		this.app.stage.addChild(this.theEndText);
		new TWEEN.Tween(this.theEndText, globalTweenGroup)
			.to({ alpha: 1 }, settings.theEndFadeInDurationMs)
			.easing(TWEEN.Easing.Quadratic.InOut)
			.start();
	}
}
