import { App, MarkdownPostProcessor, MarkdownRenderChild } from "obsidian";
import { replaceall, replaceHTMLLinks } from "src/utils";
import { getCounterStr } from "src/utils/macrostr";
import { jsonHelper } from "./MetaInfoComponent";


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
	static language = "rx-macro";
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
				} else if (text.startsWith("(") && text.endsWith(")") && text.length === 8 && /^[A-Z0-9]+$/.test(text.slice(1, -1))) {
					renderSuperTag(text.slice(1, -1), code);
				}else if (text.length > 4 && text.startsWith("@") && text.includes(":") && text.includes("=") && text.includes("{") && text.includes("}") ) {
					renderMetaInfo(text, code);
				}
			}
		});
	};
}

function renderSuperTag(text: string, code?: HTMLElement) {
	const newEl: HTMLElement = document.createElement("span");
	const link: HTMLLinkElement = document.createElement("a") as any;

	link.textContent = text;
	link.href = "es://" + text;
	link.setAttribute("target", "_blank"); 
	link.setAttribute("aria-label", "在 everything 中检索 " + text); 
	
	newEl.appendChild(link);
	newEl.addClass("rx-supertag-inline-render");
	if (code) {
		code.replaceWith(newEl);
	}
	return newEl;
}





function renderMetaInfo(text: string, code?: HTMLElement) {
	const newEl: HTMLElement = document.createElement("span");
	const titleEl: HTMLElement = document.createElement("span");
	const contentEl: HTMLElement = document.createElement("span");

	const prefix = text.split("=")[0].slice(1);
	const jsonContent = (jsonHelper(text.split("=")[1]));
	const json = JSON.parse(jsonContent);
	titleEl.addClass("rx-meta-info-title");
	contentEl.addClass("rx-meta-info-content");

	for(const key of Object.keys(json)) {
		const groupEl: HTMLElement = document.createElement("span");
		const keyEl: HTMLElement = document.createElement("span");
		const valEl: HTMLElement = document.createElement("span");
		keyEl.innerText = key;
		valEl.innerText = json[key as any];
		groupEl.appendChild(keyEl);
		groupEl.appendChild(valEl);
		groupEl.addClass("rx-meta-info-group");
		contentEl.appendChild(groupEl);
	}
	titleEl.innerText = prefix;
	newEl.appendChild(titleEl);
	newEl.appendChild(contentEl);
	newEl.addClass("rx-meta-info-inline-render");
	if (code) {
		code.replaceWith(newEl);
	}
	return newEl;
}

