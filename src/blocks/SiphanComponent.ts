import { App, MarkdownRenderChild, MarkdownRenderer } from "obsidian";
import { replaceall, replaceHTMLLinks } from "src/utils";

export class SiphanComponent extends MarkdownRenderChild {
	static language = "siphan";
	private readonly abortController = new AbortController();
	private newVue: any;
	constructor(
		private readonly el: HTMLElement,
		private readonly markdownSource: string,
		private readonly app: App
	) {
		super(el);

		const div = el.createDiv();
		div.style.display = "flex";
		div.style.flexDirection = "column";
		const textDiv = document.createElement("div");
		const button = document.createElement("button");
		let tip = "";
		let cipher = markdownSource.trim();
		if (cipher.includes("\n")) {
			tip = cipher.split("\n")[0];
			cipher = cipher.split("\n").slice(1).join("\n").trim();
		}
		button.onclick = function () {
			try {
				if (
					(cipher.startsWith("'") && cipher.endsWith("'")) ||
					(cipher.startsWith('"') && cipher.endsWith('"'))
				) {
					cipher = cipher.slice(1, -1);
				}
				let content = replaceall("undefined", "", window.d(cipher));
				content = replaceHTMLLinks(content, true);

				textDiv.innerHTML = content;
				textDiv.style.color = "initial";
				div.removeChild(button);
			} catch (error) {
				textDiv.innerHTML = "❌&nbsp;Invalid key";
				textDiv.style.color = "red";
			}
		};

		button.innerHTML = "view the original text";
		button.style.margin = "0.75em 0";
		textDiv.innerHTML = "❓&nbsp;This is encrypted text";
		if (tip) {
			textDiv.innerHTML = "❓&nbsp;Encrypted text about「" + tip + "」";
		}

		div.appendChild(textDiv);
		// MarkdownRenderer.render(
		// 				this.app,
		// 				textDiv.innerHTML,
		// 				div,
		// 				"",
		// 				//@ts-ignore
		// 				null
		// 			);
		div.appendChild(button);
	}

	onunload() {
		this.abortController.abort();
	}
}
