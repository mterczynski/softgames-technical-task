import React, { useState } from "react";
import { ProjectSelectionMenu } from "./ProjectSelectionMenu";

export const App: React.FC = () => {
	const [selected, setSelected] = useState<number | null>(null);

	// Only Ace of Shadows launches the Pixi app
	React.useEffect(() => {
		if (selected === 1) {
			// Remove any previous canvas
			document.querySelectorAll(".main-canvas").forEach((el) => el.remove());
			import("./index").then((mod) => {
				mod.init();
			});
		}
	}, [selected]);

	if (!selected) {
		return <ProjectSelectionMenu onSelect={setSelected} />;
	}

	if (selected === 1) {
		return null; // Pixi app will be rendered on the DOM
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
