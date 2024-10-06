import { App, MarkdownRenderChild, parseYaml } from "obsidian";
import { replaceHTMLLinks } from "src/utils";
import { QQchatComponent } from "./QQchatComponent";
import { QQzoneComponent } from "./QQzoneComponent";

export class QQBlock extends MarkdownRenderChild  {
	private readonly abortController = new AbortController();
	static language = "qq";

	constructor(
		private readonly el: HTMLElement,
		private readonly markdownSource: string,
		private readonly plugin: App
	) {
		super(el);
		const returnClass = markdownSource.includes("chat:")
			? QQchatComponent
			: QQzoneComponent;
        //@ts-ignore
		return new returnClass(this.el, this.markdownSource, this.plugin);
	}
	onunload() {
		this.abortController.abort();
	}
}
