const fs = require("fs");
const path = require("path");

const files = ["styles.css", "main.js"];
const LOCAL_PLUGIN_DIRS = [
	
];

files.forEach((file) => {
	const filePath = path.resolve(__dirname, file);
	LOCAL_PLUGIN_DIRS.forEach((dir) => {
		const targetPath = path.resolve(dir, file);
		fs.copyFileSync(filePath, targetPath);
		console.log(`copy path ${filePath} to ${targetPath}`);
	});
});
