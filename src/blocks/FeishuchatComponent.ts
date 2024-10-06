import { App, MarkdownRenderChild, parseYaml } from "obsidian";
import { replaceHTMLLinks, resolveLogo } from "src/utils";

export class FeishuChatComponent extends MarkdownRenderChild {
	private readonly abortController = new AbortController();

	static language = "feishu";
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
			let content = "",
				time = "";

			if (item[name].includes("@")) {
				time = item[name].split("@")[0];
				content = item[name].split("@")[1];
			} else {
				content = item[name];
			}

			if (name === "time") {
				const timeHTML = `<div class="show"><div class="time">${content}</div></div>`;
				chatHTML += timeHTML;
			} else if (name === "me") {
				const imageLink = resolveLogo(myName, data.myImage, "feishu");
				const meHTML = `<div class="show">
				<div class="msg">
				  <img src="${imageLink}" alt="${myName}" />
				  <span style="position: absolute; right: 55px">${myName}
				  ${time ? `<span class="msg-time">${time}</span>` : ""}</span>
				  <p>${content}</p>
				</div>
			  </div>`;

				chatHTML += meHTML;
			} else {
				const imageLink = resolveLogo(name, data[name], "feishu");
				const yourHTML = `<div class="send">
				<div class="msg">
				  <img src="${imageLink}" alt="${name}" />
				  <span style="position: absolute; left: 55px">${name}${
					time ? `<span class="msg-time">${time}</span>` : ""
				}</span>
				  <p>${content}</p>
				</div>
			  </div>`;

				chatHTML += yourHTML;
			}
		}
		let html = `<div class="rx-feishu">${chatHTML}</div>`;
		const div = el.createDiv();
		div.innerHTML = replaceHTMLLinks(html);
	}

	onunload() {
		this.abortController.abort();
	}
}
