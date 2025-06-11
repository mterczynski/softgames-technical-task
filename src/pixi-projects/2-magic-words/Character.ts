import * as PIXI from "pixi.js";

export class Character extends PIXI.Container {
	constructor(url: string) {
		super();
		this.init(url);
	}

	private init(url: string) {
		const texture = PIXI.Texture.from(url);
		const sprite = new PIXI.Sprite(texture);
		this.addChild(sprite);
		// Initialize character properties and visuals here
	}
}
