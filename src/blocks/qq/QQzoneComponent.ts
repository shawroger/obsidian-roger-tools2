import { App, MarkdownRenderChild, parseYaml } from "obsidian";
import { assets } from "src/config";
import { replaceHTMLLinks, resolveLogo } from "src/utils";

function splitLikes(likes: string) {
	let sp = "";
	if (likes.includes("、")) {
		sp = "、";
	} else if (likes.includes("，")) {
		sp = "，";
	} else if (likes.includes(",")) {
		sp = ",";
	} else if (likes.includes(" ")) {
		sp = " ";
	}

	const likeArr = sp === "" ? [likes] : likes.split(sp);
	return likeArr.map(
		(like) => `<a href="javascript:void(0)" class="item">${like.trim()}</a>`
	);
}

function genCommentHTML(
	commentList: any,
	name: string,
	ownerLink: string,
	ownerImage: string
) {
	let commentHTML = "";
	if (!commentList || !Array.isArray(commentList) || commentList.length === 0)
		return "";

	for (let i = 0; i < commentList.length; i++) {
		let replyHTML = "";
		const comment = commentList[i];
		const reply = comment.reply;
		const link = comment.link || "javascript:void(0)";
		const image = resolveLogo(comment.name, comment.image, "qq");

		if (reply) {
			replyHTML = reply
				.map((e: any) => {
					const rlink = e.link || ownerLink;
					const rname = e.name || name;
					const imageLink = resolveLogo(rname, e.image, "qq");
					const ownerImageLink = window.$rx.base(ownerImage);
					return `<div class="comments-list mod-comments-sub"><div class="comments-item-bd"><div class="single-reply"><div class="ui-avatar">	<a href="${rlink}" target="_blank"><img		 class="q_namecard"	alt="${rname}" src="${
						imageLink || ownerImageLink
					}" /></a></div><div class="comments-content"><a class="nickname name c_tx q_namecard" target="_blank" href="${rlink}">${rname}</a>&nbsp;回复<a class="nickname name c_tx q_namecard" target="_blank" href="${link}">${
						comment.name
					}</a>: ${
						e.content
					}<div class="comments-op">	<span class="ui-mr10 state"> ${
						e.time || ""
					}</span></div></div></div></div></div>`;
				})
				.join("");
		}

		const newHTML = `<div class="comments-list"><div class="comments-item"><div class="single-reply"><div class="ui-avatar"><a href="${link}" target="_blank"><img class="q_namecard" alt="${comment.name}" src="${image}" /></a></div><div class="comments-content"><a class="nickname name c_tx q_namecard" target="_blank" href="${link}">${comment.name}</a>: ${comment.content}<div class="comments-op"><span class="ui-mr10 state"> ${comment.time}</span></div></div></div>${replyHTML}</div></div>`;
		commentHTML += newHTML;
	}

	return '<div class="comment-groups">' + commentHTML + "</div>";
}

export class QQzoneComponent extends MarkdownRenderChild {
	private readonly abortController = new AbortController();

	constructor(
		private readonly el: HTMLElement,
		private readonly markdownSource: string,
		private readonly plugin: App
	) {
		super(el);

		const data = parseYaml(markdownSource);

		const url = data.url || "javascript:void(0)";
		const name = data.name;
		const image = resolveLogo(name, data.image, "qq");
		const time = data.time || "";
		const content = data.content;
		const likes = data.likes;
		let likeHTML = "";

		if (likes) {
			const likeArr = splitLikes(likes);

			const qqzoneLikeIcon = window.$rx.base(
				assets("qqzone-like-icon-20230928000.png")
			);

			likeHTML = likes
				? `<div class="like-list">
		<div class="icon-btn">
		  <img
			src="${qqzoneLikeIcon}"
			alt="likes"
		  />
		</div>
		<div class="user-list">
		  ${likeArr.join("、")}共<span class="f-like-cnt">&nbsp;${
						likeArr.length
				  }&nbsp;</span>人觉得很赞
		</div>
	  </div>`
				: "";
		}

		const comments = data.comments || [];
		const commentHTML = genCommentHTML(comments, name, url, image);

		let html = `<div class="rx-qqzone">
		<div class="rx-qqzone-single-head">
		  <div class="user-pto">
			<a href="${url}" target="_blank" class="user-avatar"
			  ><img src="${image}" alt="${name}"
			/></a>
		  </div>
		  <div class="user-info">
			<div class="rx-qqzone-nick">
			  <a target="_blank" href="${url}" class="rx-qqzone-name">${name}</a>
			</div>
			<div class="info-detail">
			  <span class="ui-mr8 state">${time}</span>
			</div>
		  </div>
		</div>
		<div class="rx-qqzone-single-content">
		  <div class="rx-qqzone-item">
			<div class="rx-qqzone-info">${content}</div>
		  </div>
		</div>
		${likeHTML}
		${commentHTML}
	  </div>
	  `;
		const div = el.createDiv();
		div.innerHTML = replaceHTMLLinks(html);
	}

	onunload() {
		this.abortController.abort();
	}
}
