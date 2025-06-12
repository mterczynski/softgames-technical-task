import * as PIXI from "pixi.js";
import { settings } from "./settings";
import { Card } from "./Card";
import TWEEN from "@tweenjs/tween.js";
import { tweenGroup } from "./index";

export class CardStack extends PIXI.Container {
	private maxVisible = settings.cardStackMaxVisible;
	private plusText: PIXI.Text | null = null;

	constructor(cardCount: number) {
		super();
		this.init(cardCount);
	}

	private async init(cardCount: number) {
		this.removeChildren();
		if (this.plusText) {
			this.removeChild(this.plusText);
			this.plusText = null;
		}
		const visibleCount = Math.min(cardCount, this.maxVisible);
		for (let index = 0; index < visibleCount; index++) {
			const card = new Card();
			this.addChild(card);
			card.y = index * settings.cardGap;
		}
		if (cardCount > this.maxVisible) {
			this.showPlusText(cardCount - this.maxVisible);
		}
	}

	private showPlusText(extra: number) {
		if (this.plusText) {
			this.plusText.text = `+${extra}`;
			return;
		}
		this.plusText = new PIXI.Text(`+${extra}`, {
			fill: 0xffffff,
			fontSize: 28,
			fontWeight: "bold",
			stroke: 0x000000,
			strokeThickness: 4,
			align: "center",
		});
		this.plusText.anchor.set(0, 0);
		this.plusText.x = this.width / 2;
		this.plusText.y = 0;
		this.addChild(this.plusText);
	}

	getLength() {
		// Count all cards, including those hidden by +n
		if (this.plusText) {
			const visible = this.children.filter(
				(child) => child instanceof Card,
			).length;
			const extra = parseInt(this.plusText.text.slice(1));
			return visible + extra;
		}
		return this.children.filter((child) => child instanceof Card).length;
	}

	appendCard() {
		const total = this.getLength() + 1;
		if (this.plusText) {
			this.init(total);
			return null;
		}
		if (this.children.length < this.maxVisible) {
			const card = new Card();
			this.addChild(card);
			card.y = (this.getLength() - 1) * settings.cardGap;
			return card;
		} else {
			this.init(total);
			return null;
		}
	}

	getHeight() {
		return Math.min(this.getLength(), this.maxVisible) * settings.cardGap;
	}

	async transferTopCardTo(targetStack: CardStack) {
		if (this.getLength() === 0) return;
		const visibleCards = this.children.filter((child) => child instanceof Card);
		const topCard = visibleCards[visibleCards.length - 1] as Card;
		const globalPosition = this.toGlobal(new PIXI.Point(topCard.x, topCard.y));
		targetStack.parent.addChild(topCard);
		topCard.x = globalPosition.x - settings.cardStacksOffset.x;
		topCard.y = globalPosition.y - settings.cardStacksOffset.y;

		// Only decrement plusText once per transfer, and do not call init here
		let skipRemove = false;
		if (this.plusText) {
			const extra = parseInt(this.plusText.text.slice(1));
			if (extra > 1) {
				this.showPlusText(extra - 1);
				skipRemove = true;
			} else {
				this.removeChild(this.plusText);
				this.plusText = null;
			}
		}
		if (!skipRemove) {
			this.removeChild(topCard);
		}

		await new Promise<void>((resolve) => {
			new TWEEN.Tween(topCard, tweenGroup)
				.to(
					{
						x: targetStack.x,
						y: targetStack.y + targetStack.getHeight(),
					},
					settings.flightDurationMs,
				)
				.easing(TWEEN.Easing.Quadratic.InOut)
				.onComplete(() => {
					targetStack.parent.removeChild(topCard);
					topCard.destroy();
					targetStack.appendCard();
					// Only update stack visuals if plusText was removed
					if (!skipRemove) this.init(this.getLength());
					resolve();
				})
				.start();
		});
	}
}
