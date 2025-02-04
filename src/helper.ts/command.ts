import { App, Plugin } from "obsidian";

import * as path from "path";
import * as child_process from "child_process";
import { loadRemoteJs } from "src/utils";

export function addCommands(plugin: Plugin) {
	const vaultDir = (plugin.app.vault.adapter as any).basePath;
	plugin.addCommand({
		id: "copy-file-path",
		name: "Copy File Path",
		callback: () => {
			const activeFile = path.join(
				vaultDir,
				plugin.app.workspace.getActiveFile()!.path
			);
			navigator.clipboard.writeText(activeFile);
		},
	});

	plugin.addCommand({
		id: "render-twitter-block",
		name: "Render twitter block",
		callback: () => {
			loadRemoteJs("https://platform.twitter.com/widgets.js");
		},
	});

	plugin.addCommand({
		id: "open-in-vscode",
		name: "open in vscode",
		callback: () => {
			const activeFile = path.join(
				vaultDir,
				plugin.app.workspace.getActiveFile()!.path
			);
			child_process.exec(
				`code "${activeFile}"`,
				(err: any, stdout: any, stderr: any) => {
					if (err) {
						console.log(err);
						return;
					}
					console.log(stdout);
				}
			);
		},
	});

	plugin.addCommand({
		id: "open-in-notepad++",
		name: "open in notepad++",
		callback: () => {
			const activeFile = path.join(
				vaultDir,
				plugin.app.workspace.getActiveFile()!.path
			);
			child_process.exec(
				`"${window.$rx?.settings["NOTEPAD_PATH"]}" "${activeFile}"`,
				(err: any, stdout: any, stderr: any) => {
					if (err) {
						console.log(err);
						return;
					}
					console.log(stdout);
				}
			);
		},
	});

	plugin.addCommand({
		id: "open-in-vscode-all-folder",
		name: "open in vsCode (from the folder)",
		callback: () => {
			const activeFileDir = path.join(
				vaultDir,
				plugin.app.workspace.getActiveFile()!.parent!.path
			);
			child_process.exec(
				`code "${activeFileDir}"`,
				(err: any, stdout: any, stderr: any) => {
					if (err) {
						console.log(err);
						return;
					}
					console.log(stdout);
				}
			);
		},
	});

	// plugin.addCommand({
	// 	id: "open-today-worklog",
	// 	name: "open today's worklog",
	// 	callback: async () => {
	// 		const path =
	// 			"PARA/E005-Dailynotes/A002-Worklog/" +
	// 			window.$rx.date() +
	// 			"_工作日志.md";
	// 		let file = plugin.app.vault.getAbstractFileByPath(path);
	// 		if (!file) {
	// 			file = await plugin.app.vault.create(path, "");
	// 		}
	// 		const leaf = plugin.app.workspace.getLeaf(true);
	// 		await leaf.openFile(file as any);
	// 	},
	// });

	// plugin.addCommand({
	// 	id: "open-today-record",
	// 	name: "open today's record",
	// 	callback: async () => {
	// 		const path =
	// 			"PARA/E005-Dailynotes/A003-Records/" +
	// 			window.$rx.date() +
	// 			"_Record.md";
	// 		let file = this.app.vault.getAbstractFileByPath(path);
	// 		if (!file) {
	// 			file = await this.app.vault.create(path, "");
	// 		}
	// 		const leaf = this.app.workspace.getLeaf(true);
	// 		await leaf.openFile(file as any);
	// 	},
	// });

	window.$rx.vaultDir = vaultDir;
}
