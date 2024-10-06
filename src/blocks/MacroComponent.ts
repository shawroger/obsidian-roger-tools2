import { App, MarkdownPostProcessor, MarkdownRenderChild } from "obsidian";
import { replaceall, replaceHTMLLinks } from "src/utils";
import { getCounterStr } from "src/utils/macrostr";



function renderMacro(app: App, text: string, code?: HTMLElement) {
	const newEl: HTMLElement = document.createElement("span");
	const spanEl: HTMLElement = document.createElement("span");
	const $: any = { ...window.$rx };
	$.root = window.$rx;
	const file = app.workspace.getActiveFile();
	$.F = file;
	$.C = () => "filepath is not defined";
	if (file && file.path) {
		const cache = app.metadataCache.getFileCache(file);
		if (cache) {
			$.M = cache.frontmatter;
			$.F = { ...$.F, ...cache };
		}

		$.C = function (id = "", initialValue = 0) {
			let flag = 0;
			let numberType = 0;
			if (id.startsWith("~=") || id.startsWith("=~")) {
				flag = 1;
				id = id.slice(2);
			} else if (id.startsWith("=")) {
				flag = 2;
				id = id.slice(1);
			} else if (id.startsWith("~")) {
				flag = 3;
				id = id.slice(1);
			}

			if (id.startsWith("##")) {
				numberType = 1;
			} else if (id.startsWith("#")) {
				numberType = 2;
			} else if (id.startsWith("@@")) {
				numberType = 31;
			} else if (id.startsWith("@")) {
				numberType = 3;
			} else if (id.startsWith("$$")) {
				numberType = 5;
			} else if (id.startsWith("$")) {
				numberType = 4;
			} else if (id.startsWith("!!")) {
				numberType = 7;
			} else if (id.startsWith("!")) {
				numberType = 6;
			}

			const key = file.path + "?key=" + id;
			if (window.$rx._counter[key] === undefined) {
				window.$rx._counter[key] = initialValue;
			}

			const v = window.$rx._counter[key];

			if (flag === 2) {
				return getCounterStr(v, numberType);
			}

			if (flag === 1 || flag === 3) {
				delete window.$rx._counter[key];

				return getCounterStr(flag === 1 ? v : v + 1, numberType);
			}

			return getCounterStr(++window.$rx._counter[key], numberType);
		};
	}

	const evalRes = eval(text);
	spanEl.addClass("rx-macro-inline-render");
	spanEl.innerHTML = evalRes;
	newEl.appendChild(spanEl);
	if (code) {
		code.replaceWith(newEl);
	}
	//@ts-ignore
	window.$rxmacro = $;

	return newEl;
}

export class MacroComponent extends MarkdownRenderChild {
	private readonly abortController = new AbortController();
	static language = "rx-macro"
	constructor(
		private readonly el: HTMLElement,
		private readonly markdownSource: string,
		private readonly app: App
	) {
		super(el);

		const newEl = renderMacro(this.app, this.markdownSource);

		const div = el.createDiv();
		div.appendChild(newEl);
	}

	onunload() {
		this.abortController.abort();
	}
}

function renderSiphan(text: string, code?: HTMLElement) {
	const newEl: HTMLElement = document.createElement("span");
	const spanEl: HTMLElement = document.createElement("span");
	let cipher = text.trim();
	try {
		let content = replaceall("undefined", "", window.d(cipher));
		content = replaceHTMLLinks(content, true);
		spanEl.innerHTML = content;
	} catch (error) {
		spanEl.innerHTML = "???";
	}

	spanEl.addClass("rx-siphan-inline-render");
	newEl.appendChild(spanEl);
	if (code) {
		code.replaceWith(newEl);
	}
	return newEl;
}


export function MacroPostProcessor(app: App): MarkdownPostProcessor {
	return (el) => {
		el.findAll("code").forEach((code) => {
			const text: string | undefined = code.innerText.trim();

			if (text !== undefined) {
				if (text.startsWith("<%") && text.endsWith("%>")) {
					renderMacro(app, text.slice(2, -2).trim(), code);
				} else if (text.startsWith("?=")) {
					renderSiphan(text.slice(2), code);
				}
			}
		});
	};
}