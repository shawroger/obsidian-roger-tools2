import { App, MarkdownPostProcessor, MarkdownRenderChild } from "obsidian";
import { replaceall, replaceHTMLLinks } from "src/utils";
import { getCounterStr } from "src/utils/macrostr";
import { jsonHelper } from "./SuperTagComponent";
import { Console } from "console";

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
				} else if (
					text.startsWith("#") &&
					text.length >= 7 &&
					/^[A-Z0-9]+$/.test(text.slice(1, 7))
				) {
					renderXIDLabel(app, text, code);
				} else if (
					text.length > 4 &&
					text.startsWith("@") &&
					":={}".split("").every((e) => text.includes(e))
				) {
					renderSuperTag(text, code);
				}
			}
		});
	};
}

function processString(s: string, list: string[]) {
	const n = list.length;
	const result = new Array(n + 1).fill("");
	result[0] = s;
	let a = 0,
		b = n,
		prev = 0;
	for (let i = 0; i < n; ++i) {
		const next = result[prev].indexOf(list[i]);
		if (next > 0) {
			result[i + 1] = result[prev].slice(next + list[i].length);
			result[prev] = result[prev].slice(0, next);
			prev = i + 1;
		}
	}

	return result;
}

function renderXIDLabel(app: App, text: string, code?: HTMLElement) {
	const newEl: HTMLElement = document.createElement("span");
	const linkEl: HTMLLinkElement = document.createElement("a") as any;
	const XID_OPEN_ACTION_ID = window.$rx?.settings["XID_OPEN_ACTION_ID"];
	const links = processString("es://" + text.slice(1), [
		"#xtt=",
		"#xtg=",
		"#xdd=",
		"#x0=",
		"#x1=",
		"#x2=",
		"#x3=",
	]);
	const key = links[0].slice(5, 11);
	linkEl.textContent = links[0].slice(5, 11);

	// 后缀 ! 取消运行 quicker xid_open
	if (!links[0].endsWith("!") && XID_OPEN_ACTION_ID) {
		links.push(
			"quicker:runaction:" +
				XID_OPEN_ACTION_ID +
				"?write_to_vars=true&xid=" +
				key
		);
	}
	// 取消 everything link 除非加上后缀 .
	if (!links[0].endsWith(".") && !links[0].endsWith(".!")) links[0] = "";

	if (links[0].length > 0) {
		if (links[0].endsWith(".!")) links[0] = links[0].slice(0, -2);
		if (links[0].endsWith(".")) links[0] = links[0].slice(0, -1);
	}

	newEl.appendChild(linkEl);
	newEl.addClass("rx-xidlabel-inline-render");
	newEl.onclick = function (event) {
		event.preventDefault();
		console.log(
			`#${key} will open ${links.filter((e) => e.length).join(" + ")}`
		);

		links.forEach((link) => window.open(link, "_blank"));
	};
	let xidlabelContent = ["📂", "🕊️", "✈️", "🤖"].filter(
		(_, index) => links[index] && links[index].length > 0
	);
	if (links.some((e) => e.startsWith("quicker:"))) {
		xidlabelContent = ["🕶️", ...xidlabelContent];
	}

	newEl.style.setProperty(
		"--xidlabel-content",
		`"${xidlabelContent.join("+")}"`
	);
	if (code) code.replaceWith(newEl);
	return newEl;
}

function renderSuperTag(text: string, code?: HTMLElement) {
	const newEl: HTMLElement = document.createElement("span");
	const titleEl: HTMLElement = document.createElement("span");
	const contentEl: HTMLElement = document.createElement("span");

	const prefix = text.split("=")[0].slice(1);
	const jsonContent = jsonHelper(text.split("=")[1]);
	const json = JSON.parse(jsonContent);
	titleEl.addClass("rx-supertag-title");
	contentEl.addClass("rx-supertag-content");

	for (const key of Object.keys(json)) {
		const groupEl: HTMLElement = document.createElement("span");
		const keyEl: HTMLElement = document.createElement("span");
		const valEl: HTMLElement = document.createElement("span");
		keyEl.innerText = key;
		valEl.innerText = json[key as any];
		groupEl.appendChild(keyEl);
		groupEl.appendChild(valEl);
		groupEl.addClass("rx-supertag-group");
		contentEl.appendChild(groupEl);
	}
	titleEl.innerText = prefix;
	newEl.appendChild(titleEl);
	newEl.appendChild(contentEl);
	newEl.addClass("rx-supertag-inline-render");
	if (code) {
		code.replaceWith(newEl);
	}
	return newEl;
}
