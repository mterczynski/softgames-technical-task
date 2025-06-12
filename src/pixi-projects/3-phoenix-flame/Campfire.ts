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
			const particle = new PIXI.Graphics();
			particle.beginFill(0xff6600, 0.5 + Math.random() * 0.5);
			particle.drawCircle(0, 0, size);
			particle.endFill();
			particle.x = Math.random() * settings.campfireWidth;
			particle.y = Math.random() * settings.fireHeight;
			particle.blendMode = PIXI.BLEND_MODES.ADD; // Set additive blending
			// Store custom data for animation
			(particle as any).vy = Math.random() * 0.5;
			(particle as any).radius = Math.abs(particle.x);
			particle.alpha = 0;
			this.addChild(particle);
		}
	}

	updateParticles(timeDelta: number) {
		const updatedDelta = timeDelta * settings.speed;
		for (const child of this.children) {
			const particle = child as PIXI.Graphics & {
				vy: number;
				radius: number;
			};
			particle.position.y -=
				Math.random() * 0.5 * settings.particleSpeed * updatedDelta;
			particle.alpha -=
				0.0001 *
				settings.particleSpeed *
				Math.abs(particle.x - settings.campfireWidth / 2) *
				updatedDelta;
			particle.alpha -=
				0.0001 *
				updatedDelta *
				Math.abs(particle.x - settings.campfireWidth / 2);
			if (particle.position.y <= 0) {
				particle.position.y = settings.fireHeight;
				particle.alpha = 1;
				particle.position.x = Math.random() * settings.campfireWidth;
			}
		}
	}
}
