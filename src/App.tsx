import React, { useState } from "react";
import { ProjectSelectionMenu } from "./ProjectSelectionMenu";

export const App: React.FC = () => {
	const [selected, setSelected] = useState<number | null>(null);

	React.useEffect(() => {
		// Remove any previous canvas
		document.querySelectorAll(".main-canvas").forEach((el) => el.remove());
		const projectImports: Record<number, () => Promise<{ init: () => void }>> =
			{
				1: () => import("./pixi-projects/1-ace-of-shadows/index"),
				2: () => import("./pixi-projects/2-magic-words/index"),
				3: () => import("./pixi-projects/3-phoenix-flame/index"),
			};
		if (selected && projectImports[selected]) {
			projectImports[selected]().then((mod) => {
				mod.init();
			});
		}
	}, [selected]);

	if (!selected) {
		return <ProjectSelectionMenu onSelect={setSelected} />;
	}

	if ([1, 2, 3].includes(selected)) {
		return (
			<div
				id="pixi-back-btn"
				style={{
					fontSize: 40,
					cursor: "pointer",
					position: "fixed",
					top: 60, // 0px for stats, 60px for button below
					left: 16,
					zIndex: 10001,
				}}
				onClick={() => setSelected(null)}
			>
				🔙
			</div>
		);
	}

	console.error("Unsupported project selected:", selected);
	// Placeholder for other projects
	return (
		<div style={{ color: "#fff", textAlign: "center", marginTop: "20vh" }}>
			<h1>Coming Soon</h1>
			<p>This project is not yet implemented.</p>
			<button
				onClick={() => setSelected(null)}
				style={{ marginTop: 32, padding: "1rem 2rem", fontSize: 18 }}
			>
				Back
			</button>
		</div>
	);
};
