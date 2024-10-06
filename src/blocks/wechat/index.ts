import { App, MarkdownRenderChild, parseYaml } from "obsidian";
import { replaceHTMLLinks } from "src/utils";
import { WechatComponent } from "./WechatComponent";
import { WeChatMomentsComponent } from "./WeChatMomentsComponent";

export class WechatBlock extends MarkdownRenderChild {
	private readonly abortController = new AbortController();
	static language = "wechat";

	constructor(
		private readonly el: HTMLElement,
		private readonly markdownSource: string,
		private readonly plugin: App
	) {
		super(el);
		const returnClass = markdownSource.includes("chat:")
			? WechatComponent
			: WeChatMomentsComponent;
        //@ts-ignore
		return new returnClass(this.el, this.markdownSource, this.plugin);
	}
	onunload() {
		this.abortController.abort();
	}
}
