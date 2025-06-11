import * as PIXI from "pixi.js";

export class Character extends PIXI.Container {
	constructor(avatarUrl: string) {
		super();
		this.init(avatarUrl);
	}

	private init(avatarUrl: string) {
		const texture = PIXI.Texture.from(avatarUrl);
		const sprite = new PIXI.Sprite(texture);
		this.addChild(sprite);
	}
}
