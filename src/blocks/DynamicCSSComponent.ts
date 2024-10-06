import { App, MarkdownRenderChild, parseYaml } from "obsidian";
import { assets } from "src/config";
import { findFilename, resolveFileIcon, resolveWebImage } from "src/utils";
export class DynamicCSSComponent extends MarkdownRenderChild {
	private readonly abortController = new AbortController();
	private style: HTMLStyleElement;
    static language = "rx-css"
	constructor(
		private readonly el: HTMLElement,
		private readonly markdownSource: string,
		private readonly app: App
	) {
		super(el);

		this.style = document.createElement("style");
		this.style.type = "text/css";
		this.style.dataset["type"] = "rx-dynamic-css";
		this.style.innerHTML = markdownSource;
		document.getElementsByTagName("head")[0].appendChild(this.style);
	}

	onunload() {
		document.getElementsByTagName("head")[0].removeChild(this.style);
		this.abortController.abort();
	}
}
