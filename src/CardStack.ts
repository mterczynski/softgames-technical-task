import * as PIXI from "pixi.js";
import { settings } from "./settings";
import { Card } from "./Card";

export class CardStack extends PIXI.Container {
	constructor(cardCount: number) {
		super();
		this.init(cardCount);
	}

	private async init(cardCount: number) {
		// const stackHeight = cardCount * settings.cardGap;
		const cards = new Array(cardCount).fill(null).map((_, index) => {
			const card = new Card();
			this.addChild(card);
			card.y = index * settings.cardGap // stack cards vertically
			return card;
		});
	}
}
