import * as PIXI from "pixi.js";

export class Card extends PIXI.Container {
	constructor() {
		super();
		this.init();
	}

	private async init() {
		await PIXI.Assets.load("/assets/metal-texture.webp")
	}
}
