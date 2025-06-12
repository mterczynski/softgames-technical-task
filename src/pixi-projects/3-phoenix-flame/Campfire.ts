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
			const size =
				Math.random() * (settings.maxParticleSize - settings.minParticleSize) +
				settings.minParticleSize;
			const particle = new PIXI.Graphics();
			particle.beginFill(0xff6600, 0.5 + Math.random() * 0.5);
			particle.drawCircle(0, 0, size);
			particle.endFill();
			particle.x = Math.random() * settings.campfireWidth;
			particle.y = Math.random() * settings.fireHeight;
			particle.blendMode = PIXI.BLEND_MODES.ADD; // Set additive blending
			particle.alpha = 0;
			this.addChild(particle);
		}
	}

	updateParticles(timeDelta: number) {
		const updatedDelta = timeDelta * settings.speed;
		for (const particle of this.children) {
			particle.position.y -=
				Math.random() * 0.5 * settings.particleSpeed * updatedDelta;
			particle.alpha -=
				settings.verticalFadeOutMultiplier *
				settings.particleSpeed *
				updatedDelta;
			particle.alpha -=
				settings.horizontalFadeOutMultiplier *
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
