const fs = require("fs");
const path = require("path");

const files = ["styles.css", "main.js"];
let LOCAL_PLUGIN_DIRS = [];
LOCAL_PLUGIN_DIRS = [
	"D:/_jane/S2024/_notes/obs2024/.obsidian/plugins/roger-tools2/",
	"D:/_jane/S2025/_notes/lifeos2024/.obsidian/plugins/roger-tools2/",
];

files.forEach((file) => {
	const filePath = path.resolve(__dirname, file);
	LOCAL_PLUGIN_DIRS.forEach((dir) => {
		const targetPath = path.resolve(dir, file);
		fs.copyFileSync(filePath, targetPath);
		console.log(`copy path ${filePath} to ${targetPath}`);
	});
});
