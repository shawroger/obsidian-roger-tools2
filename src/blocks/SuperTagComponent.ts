import {
	App,
	MarkdownRenderChild,
	MarkdownRenderer,
	parseYaml,
} from "obsidian";
import { replaceall, replaceHTMLLinks } from "src/utils";

function mdLink(file: any, title: string, isRemovedExt = true) {
	if (!title) {
		title = file.name;
	}
	const path = replaceall(" ", "%20", file.path);
	if (isRemovedExt) {
		title = title.slice(0, title.lastIndexOf("."));
	}
	return `[${title}](${path})`;
}

export function jsonHelper(text: string) {
	let json = text;
	// json = replaceall("{", '{"', json);
	// json = replaceall(": ", '": "', json);
	// json = replaceall(":", '":"', json);
	// json = replaceall("}", '"}', json);
	// json = replaceall(", ", '", "', json);
	return json;
}

function findJson(line: string, key: string) {
	const trueKey = "`@" + key + "=";
	const start = line.indexOf(trueKey);
	line = line.slice(start + trueKey.length);
	const end = line.indexOf("}");
	return line.slice(0, end + 1);
}

function lineHelper(line: string) {
	if (line.startsWith("- ")) {
		line = line.slice(2);
	}

	return line;
}

export class SuperTagComponent extends MarkdownRenderChild {
	static language = "rx-supertag";
	private readonly abortController = new AbortController();
	private div: any;
	constructor(
		private readonly el: HTMLElement,
		private readonly markdownSource: string,
		private readonly app: App
	) {
		super(el);
		//@ts-ignore
		const dv = app.plugins.plugins.dataview.api;
		const data: any = parseYaml(markdownSource);
		let key = data["tag"];
		this.div = el.createDiv();
		const arr = app.vault.getMarkdownFiles().map(async (file) => {
			if(data.exclude && file.path.match(new RegExp(data.exclude))) {
				return null;
			}

			if(data.include && !file.path.match(new RegExp(data.include))) {
				return null;
			}
			const content = await app.vault.cachedRead(file);
			const lines = content
				.split("\n")
				.filter((line) => line.includes("`@" + key + "="))
				.map((e) => [
					mdLink(file, ""),
					lineHelper(e),
					jsonHelper(findJson(e, key)),
				]);

			return lines;
		});

		Promise.all(arr).then((values) => {
			let tableList = values.filter(e => e !== null).flat();
			let tableKeys = ["file", "content"];
			if (data.hideData) {
				tableList = tableList.map((row) => row.slice(0, 2));
			} else {
				for (let i = 0; i < tableList.length; i++) {
					const item = tableList[i];
					try {
						const json = JSON.parse(item[2]);
						for (const key of Object.keys(json)) {
							if (!tableKeys.includes(key)) {
								tableKeys.push(key);
							}
						}
					} catch (e) {}
				}

				for (let i = 0; i < tableList.length; i++) {
					const item = tableList[i];

					try {
						const json = JSON.parse(item[2]);
						for (let j = 2; j < tableKeys.length; j++) {
							const key = tableKeys[j];
							tableList[i][j] = json[key] ?? "";
						}
					} catch (e) {}
				}

				if (data.hideContent) {
					tableKeys = tableKeys.filter((_, index) => index !== 1);
					tableList = tableList.map(row => row.filter((_, index) => index !== 1));
				}
			}

		

			MarkdownRenderer.render(
				this.app,
				dv.markdownTable(tableKeys, tableList),
				this.div,
				"",
				//@ts-ignore
				null
			);
		});
	}

	onunload() {
		this.abortController.abort();
		this.el.removeChild(this.div);
	}
}
