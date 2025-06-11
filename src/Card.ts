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
		sprite.scale.set(0.1); // Adjust the scale as needed
		this.addChild(sprite);
	}
}
