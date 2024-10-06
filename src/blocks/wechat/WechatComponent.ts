import { App, MarkdownRenderChild, parseYaml } from "obsidian";
import { replaceHTMLLinks, resolveLogo } from "src/utils";

export class WechatComponent extends MarkdownRenderChild {
	private readonly abortController = new AbortController();

	constructor(
		private readonly el: HTMLElement,
		private readonly markdownSource: string,
		private readonly plugin: App
	) {
		super(el);
		const data = parseYaml(markdownSource);
		const chat = data.chat;
		const myName = data.myName || "我";
		let chatHTML = "";
		for (const item of chat) {
			const name = Object.keys(item)[0];
			const content = item[name];
			if (name === "time") {
				const timeHTML = `<div class="brce_time">${content}</div>`;
				chatHTML += timeHTML;
			} else if (name === "me") {
				const imageLink = resolveLogo(myName, data.myImage, "wechat");
				const meHTML = `<div class="brce_right">
				<div class="brce_left_face fr">
				  <img
					src="${imageLink}"
					alt="me"
					style="width: 100%; margin-top: 0px"
				  />
				</div>
				<div class="brce_left_talk fr">
					<div class="brce_rt_name">${myName}</div>
				  <div class="brce_rt_jiao fr"></div>
				  <div class="brce_rt_block fr">
					<div>${content}</div>
				  </div>
				</div>
				<div class="clear"></div>
			  </div>`;

				chatHTML += meHTML;
			} else {
				const imageLink = resolveLogo(name, data[name], "wechat");
				const yourHTML = `<div class="brce_left">
				<div class="brce_left_face fl">
				  <img
					src="${imageLink}"
					alt="${name}"
					style="width: 100%; margin-top: 0px"
				  />
				</div>
				<div class="brce_left_talk fl">
				  <div class="brce_lt_name">${name}</div>
				  <div class="brce_lt_jiao fl"></div>
				  <div class="brce_lt_block fl">
					<div>${content}</div>
				  </div>
				</div>
				<div class="clear"></div>
			  </div>`;

				chatHTML += yourHTML;
			}
		}
		let html = `<div class="rx-wechat">${chatHTML}</div>`;
		const div = el.createDiv();
		div.innerHTML = replaceHTMLLinks(html);
	}

	onunload() {
		this.abortController.abort();
	}
}