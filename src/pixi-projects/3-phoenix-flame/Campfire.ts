import * as PIXI from "pixi.js";
import { settings } from "./settings";

export class Campfire extends PIXI.Container {
	constructor() {
		super();
		this.pivot.set(settings.campfireWidth / 2);
		this.generateParticles();
	}

	private generateParticles() {
		// Remove old particles
		this.removeChildren();
		for (let i = 0; i < settings.particleCount; i++) {
			const size = Math.random() * 4 + 4;
			const graphics = new PIXI.Graphics();
			graphics.beginFill(0xff6600, 0.5 + Math.random() * 0.5);
			graphics.drawCircle(0, 0, size);
			graphics.endFill();
			graphics.x = Math.random() * settings.campfireWidth;
			graphics.y = Math.random() * settings.fireHeight;
			// Store custom data for animation
			(graphics as any).vy = Math.random() * 0.5;
			(graphics as any).radius = Math.abs(graphics.x);
			graphics.name = "particle";
			this.addChild(graphics);
		}
	}

	updateParticles(timeDelta: number) {
		const updatedDelta = timeDelta * settings.speed;
		for (const child of this.children) {
			if (child.name !== "particle") continue;
			const particle = child as PIXI.Graphics & {
				vy: number;
				radius: number;
			};
			particle.position.y -=
				Math.random() * 0.5 * settings.particleSpeed * updatedDelta;
			particle.alpha -= 0.003 * settings.particleSpeed;
			particle.alpha -=
				0.00012 * Math.abs(particle.x - settings.campfireWidth / 2);
			if (particle.position.y <= 0) {
				particle.position.y = settings.fireHeight;
				particle.alpha = 1;
			}
		}
	}
}
