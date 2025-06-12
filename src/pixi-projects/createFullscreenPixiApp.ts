import * as PIXI from "pixi.js";

/**
 * Create a fullscreen, responsive PixiJS Application and append its canvas to the DOM.
 * Returns the app and a resize handler you can call or attach to window events.
 */
export interface FullscreenPixiAppOptions
	extends Partial<Omit<PIXI.IApplicationOptions, "view">> {
	globalTweenGroup?: { update: () => void };
}

export function createFullscreenPixiApp(options?: FullscreenPixiAppOptions) {
	const opts = (options as FullscreenPixiAppOptions) || {};
	const app = new PIXI.Application({
		width: opts.width || window.innerWidth,
		height: opts.height || window.innerHeight,
		view: document.createElement("canvas"),
		...opts,
	});

	globalThis.__PIXI_APP__ = app;

	const canvas = app.view as HTMLCanvasElement;
	document.body.appendChild(canvas);
	canvas.classList.add("main-canvas");

	function resizeAll() {
		const width = window.innerWidth;
		const height = window.innerHeight;
		app.renderer.resize(width, height);
	}

	window.addEventListener("resize", resizeAll);
	resizeAll();

	if (opts.globalTweenGroup) {
		app.ticker.add(() => {
			opts.globalTweenGroup!.update();
		});
	}

	return { app, resizeAll };
}
