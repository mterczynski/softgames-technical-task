import * as PIXI from "pixi.js";

export class Card extends PIXI.Container {
	constructor() {
		super();
		this.init();
	}

	private async init() {
		const url = "/assets/card.png";

		await PIXI.Assets.load(url);
		const texture = PIXI.Texture.from(url);
		const sprite = new PIXI.Sprite(texture);
		this.addChild(sprite);
	}
}
