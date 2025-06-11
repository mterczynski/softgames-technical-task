import * as PIXI from "pixi.js";

export class Campfire extends PIXI.Container {
	private numberOfParticles = 300;
	private particleSpeed = 1.2;
	private campfireWidth = 200;
	private fireHeight = 200;

	constructor() {
		super();
		this.generateParticles();
	}

	private generateParticles() {
		// Remove old particles
		this.removeChildren();
		for (let i = 0; i < this.numberOfParticles; i++) {
			const size = Math.random() * 4 + 4;
			const graphics = new PIXI.Graphics();
			graphics.beginFill(0xff6600, 0.5 + Math.random() * 0.5);
			graphics.drawCircle(0, 0, size);
			graphics.endFill();
			graphics.x = (Math.random() - 0.5) * this.campfireWidth;
			graphics.y = Math.random() * this.fireHeight;
			// Store custom data for animation
			(graphics as any).vy = Math.random() * 0.5 * this.particleSpeed;
			(graphics as any).radius = Math.abs(graphics.x);
			graphics.name = "particle";
			this.addChild(graphics);
		}
	}

	updateParticles(timeDelta: number) {
		const updatedDelta = timeDelta * 1;
		for (const child of this.children) {
			if (child.name !== "particle") continue;
			const particle = child as PIXI.Graphics & {
				vy: number;
				radius: number;
			};
			particle.position.y -=
				Math.random() * 0.5 * this.particleSpeed * updatedDelta;
			// particle.alpha -= 0.002 * this.particleSpeed * updatedDelta;
			// particle.alpha -=
			// 	particle.radius * 0.001 * this.particleSpeed * updatedDelta;
			if (particle.position.y <= 0) {
				particle.position.y = this.fireHeight;
				particle.alpha = 1;
			}
		}
	}
}
