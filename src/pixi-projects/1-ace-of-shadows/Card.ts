import * as PIXI from "pixi.js";
import { settings } from "./settings";

export class Card extends PIXI.Container {
	constructor() {
		super();
		this.init();
	}

	private async init() {
		const url = "./assets/card.png";

		await PIXI.Assets.load(url);
		const texture = PIXI.Texture.from(url);
		const sprite = new PIXI.Sprite(texture);
		sprite.width = settings.cardWidth;
		sprite.height = settings.cardHeight;
		this.addChild(sprite);
	}
}
