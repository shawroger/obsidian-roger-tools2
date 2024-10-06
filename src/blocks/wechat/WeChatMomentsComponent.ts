import { App, MarkdownRenderChild, parseYaml } from "obsidian";
import { assets } from "src/config";
import { replaceHTMLLinks, resolveLogo } from "src/utils";

export class WeChatMomentsComponent extends MarkdownRenderChild {
	private readonly abortController = new AbortController();

	constructor(
		private readonly el: HTMLElement,
		private readonly markdownSource: string,
		private readonly plugin: App
	) {
		super(el);
		const data = parseYaml(markdownSource);
		const name = data.name;
		const image = resolveLogo(name, data.image, "wechat");
		const time = data.time || "";
		const content = data.content;
		const likes = data.likes;

		const comments = data.comments || [];
		const resourceLikeLink = window.$rx.base(
			assets("rx-weixin-like-icon-202309280000.png")
		);
		const resourceIconLink = window.$rx.base(
			assets("rx-weixin-icon-202309280000.png")
		);

		const commentHTML = comments
			.map((comment: any) => {
				if (!comment.reply) {
					const commentStyle = comment.style
						? ` style="${comment.style}"`
						: "";
					return `<p${commentStyle}><span>${comment.name}：</span>${comment.content}</p$>`;
				}
				return `<p><span class="data-name">${comment.name}</span>&nbsp;回复&nbsp;<span>${comment.reply}</span><span>：</span>${comment.content}</p>`;
			})
			.join("");

		let html = `<div class="rx-wechat-moments">
		<ul>
		  <li>
			<div class="po-avt-wrap">
			  <img class="po-avt data-avt" alt="${name}" src="${image}" />
			</div>
			<div class="po-cmt">
			  <div class="po-hd">
				<p class="po-name"><span class="data-name">${name}</span></p>
				<div class="post">${content}</div>
				<p class="time">${time}</p>
				<img class="c-icon" alt="评论" src="${resourceIconLink}" />
			  </div>
			  <div class="cmt-wrap">
				${
					likes
						? `
				<div class="cmt-like">
				<div class="like"> <span class="data-likes"><img alt="点赞" src="${resourceLikeLink}" />${likes}</span></div>
				</div>
				`
						: ""
				}
				${
					comments.length
						? `
				  <div class="cmt-list">
					  ${commentHTML}
				  </div>
				  `
						: ""
				} 
			  </div>
			</div>
		  </li>
		</ul>
	  </div>
	  
	  `;
		const div = el.createDiv();
		div.innerHTML = replaceHTMLLinks(html);
	}

	onunload() {
		this.abortController.abort();
	}
}
