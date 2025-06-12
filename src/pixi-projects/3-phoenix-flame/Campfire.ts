import * as PIXI from "pixi.js";
import { settings } from "./settings";

export class Campfire extends PIXI.Container {
	private particles: PIXI.Graphics[] = [];

	constructor() {
		super();
		this.pivot.set(settings.campfireWidth / 2);
		this.generateParticles();
		this.createGlow();
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
			this.particles.push(particle);
			this.addChild(particle);
		}
	}

	private createGlow() {
		// Create a blurred ellipse to simulate a glowing light at the base
		const glow = new PIXI.Graphics();
		const glowWidth = settings.campfireWidth * 1.1; // much smaller
		const glowHeight = settings.campfireWidth * 0.28; // much smaller
		glow.beginFill(0xffe066, 0.1); // warm yellow
		glow.drawEllipse(0, 0, glowWidth, glowHeight);
		glow.endFill();
		const outerGlow = new PIXI.Graphics();
		outerGlow.beginFill(0xffc300, 0.1);
		outerGlow.drawEllipse(0, 0, glowWidth * 1.2, glowHeight * 1.2);
		outerGlow.endFill();
		const blurFilter = new PIXI.filters.BlurFilter();
		blurFilter.blur = 12;
		glow.filters = [blurFilter];
		outerGlow.filters = [blurFilter];
		const glowContainer = new PIXI.Container();
		const y = settings.fireHeight + glowHeight / 2 + 10;
		glow.y = y;
		outerGlow.y = y;
		// Center the glow horizontally under the fire
		glow.x = settings.campfireWidth / 2;
		outerGlow.x = settings.campfireWidth / 2;
		glowContainer.addChild(outerGlow);
		glowContainer.addChild(glow);
		// Add glowContainer at the very bottom of the Campfire display list
		this.addChildAt(glowContainer, 0);
	}

	updateParticles(timeDelta: number) {
		const updatedDelta = timeDelta * settings.speed;
		for (const particle of this.particles) {
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
