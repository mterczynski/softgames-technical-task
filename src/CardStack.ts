import * as PIXI from "pixi.js";
import { settings } from "./settings";
import { Card } from "./Card";
import TWEEN from '@tweenjs/tween.js';
import { tweenGroup } from "./index";

export class CardStack extends PIXI.Container {
	constructor(cardCount: number) {
		super();
		this.init(cardCount);
	}

	private async init(cardCount: number) {
		new Array(cardCount).fill(null).forEach((_, index) => {
			const card = new Card();
			this.addChild(card);
			card.y = index * settings.cardGap // stack cards vertically
			return card;
		});
	}

	getLength() {
		return this.children.length;
	}

	appendCard() {
		const card = new Card();
		this.addChild(card);
		card.y = (this.getLength() - 1) * settings.cardGap; // stack cards vertically
		return card;
	}

	async transferTopCardTo(targetStack: CardStack) {
		if (this.getLength() === 0) return;
		const topCard = this.children[this.getLength() - 1] as Card;
		targetStack.parent.addChild(topCard);

		// Animate to target global position
		await new Promise<void>(resolve => {
			console.log('## tween started')
			new TWEEN.Tween(topCard, tweenGroup)
				.to({ x: targetStack.x, y: targetStack.y + targetStack.height }, 2000)
				.easing(TWEEN.Easing.Quadratic.InOut)
				.onComplete(() => {
					targetStack.parent.removeChild(topCard);
					topCard.destroy();
					targetStack.appendCard();
					resolve();
				})
				.start();
		});
	}
}
