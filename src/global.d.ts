import type * as PIXI from "pixi.js";

declare global {
	var __PIXI_APP__: PIXI.Application | undefined;
}
