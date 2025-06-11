import React, { useState } from "react";
import { ProjectSelectionMenu } from "./ProjectSelectionMenu";

export const App: React.FC = () => {
	const [selected, setSelected] = useState<number | null>(null);

	// Only Ace of Shadows launches the Pixi app
	React.useEffect(() => {
		if (selected === 1) {
			// Remove any previous canvas
			document.querySelectorAll(".main-canvas").forEach((el) => el.remove());
			import("./pixi-projects/1-ace-of-shadows/index").then((mod) => {
				mod.init();
			});
		}
		if (selected === 2) {
			// Remove any previous canvas
			document.querySelectorAll(".main-canvas").forEach((el) => el.remove());
			import("./pixi-projects/2-magic-words/index").then((mod) => {
				mod.init();
			});
		}
		if (selected === null) {
			// Clean up when no project is selected
			document.querySelectorAll(".main-canvas").forEach((el) => el.remove());
		}
	}, [selected]);

	if (!selected) {
		return <ProjectSelectionMenu onSelect={setSelected} />;
	}

	if (selected === 1 || selected === 2) {
		// return null; // Pixi app will be rendered on the DOM
		return (
			<div
				style={{
					fontSize: 40,
					cursor: "pointer",
				}}
				onClick={() => setSelected(null)}
			>
				🔙
			</div>
		);
	}

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
