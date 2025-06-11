import * as PIXI from "pixi.js";

export class Character extends PIXI.Container {
	constructor(
		private characterName: string,
		avatarUrl: string,
	) {
		super();
		this.init(avatarUrl);
	}

	private init(avatarUrl: string) {
		const texture = PIXI.Texture.from(avatarUrl);
		const sprite = new PIXI.Sprite(texture);
		this.addChild(sprite);
		// Initialize character properties and visuals here
	}

	speak(text: string) {
		console.log(`${this.characterName} says: ${text}`);
	}
}
