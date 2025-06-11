import React from "react";

const PROJECTS = [
	{ id: 1, name: "♠️ Ace of Shadows ♠️" },
	{ id: 2, name: "⚛️ Magic Words ⚛️" },
	{ id: 3, name: "🔥 Phoenix Flame 🔥" },
];

export const ProjectSelectionMenu: React.FC<{
	onSelect: (id: number) => void;
}> = ({ onSelect }) => {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				height: "100vh",
				background: "#222",
				color: "#fff",
				fontFamily: "sans-serif",
			}}
		>
			<h1>Choose a Project</h1>
			<ul style={{ listStyle: "none", padding: 0 }}>
				{PROJECTS.map((project) => (
					<li key={project.id} style={{ margin: "1rem 0" }}>
						<button
							style={{
								padding: "1rem 2rem",
								fontSize: "1.2rem",
								borderRadius: "8px",
								border: "none",
								background: "#444",
								color: "#fff",
								cursor: "pointer",
								transition: "background 0.2s",
							}}
							onClick={() => onSelect(project.id)}
						>
							{project.name}
						</button>
					</li>
				))}
			</ul>
		</div>
	);
};
