import { App, MarkdownRenderChild, parseYaml } from "obsidian";
import { replaceHTMLLinks, resolveLogo } from "src/utils";

export class QQchatComponent extends MarkdownRenderChild {
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
				const timeHTML = `<div class="show"><div class="time">${content}</div></div>`;
				chatHTML += timeHTML;
			} else if (name === "me") {
				const imageLink = resolveLogo(myName, data.myImage, "qq");
				const meHTML = `<div class="show">
				<div class="msg">
				  <img src="${imageLink}" alt="${myName}" />
				  <span style="position: absolute; right: 55px">${myName}</span>
				  <p>${content}</p>
				</div>
			  </div>`;

				chatHTML += meHTML;
			} else {
				const imageLink = resolveLogo(name, data[name], "qq");
				const yourHTML = `<div class="send">
				<div class="msg">
				  <img src="${imageLink}" alt="${name}" />
				  <span style="position: absolute; left: 55px">${name}</span>
				  <p>${content}</p>
				</div>
			  </div>`;

				chatHTML += yourHTML;
			}
		}
		let html = `<div class="rx-qqchat">${chatHTML}</div>`;
		const div = el.createDiv();
		div.innerHTML = replaceHTMLLinks(html);
	}

	onunload() {
		this.abortController.abort();
	}
}
