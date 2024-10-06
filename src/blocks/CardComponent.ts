import { App, MarkdownRenderChild, parseYaml } from "obsidian";
import { assets } from "src/config";
import { findFilename, resolveFileIcon, resolveWebImage } from "src/utils";

export class CardComponent extends MarkdownRenderChild {
	private readonly abortController = new AbortController();
	static language = "rx-card";
	constructor(
		private readonly el: HTMLElement,
		private readonly markdownSource: string,
		private readonly plugin: App
	) {
		super(el);

		const data = parseYaml(markdownSource);
		let imageLink = data.image;

		const url = data.url;
		let iconLink = data.icon;
		let title = data.title || "";
		let description = data.des || "";
		let html = "";
		let cardTextStyle = imageLink ? "" : ' style="width: 100%;"';
		let urlHtml = "";
		let isUseFileIcon = false;
		let imageLinkClass = "rx-card-link-image";
		let filetype = data.type;

		if (url.startsWith("file") || filetype) {
			imageLinkClass = "rx-card-link-image rx-card-file-image";
			if (!imageLink) {
				isUseFileIcon = true;
				imageLink = resolveFileIcon(url, filetype);
			}
			if (!iconLink) iconLink = resolveFileIcon(url, filetype);
			if (!title) title = findFilename(url);
		}

		if (url.startsWith("http")) {
			const host = new URL(url).hostname;
			if (!iconLink) iconLink = resolveWebImage(host, true, data.auto);
			if (!imageLink) imageLink = resolveWebImage(host, false, data.auto);
		}

		if (url.startsWith("es://")) {
			imageLink = assets("everything-logo.png");
			iconLink = assets("everything-icon.webp");
		}

		if (url.startsWith("es://") && url.endsWith(".rx.ahk")) {
			imageLink = assets("everything-logo-ahk.png");
			iconLink = assets("fileIcon.open.ahk.png");
		}

		// containerStyle
		let containerStyle = 'style="';
		if (data.boxMove) {
			let move = data.boxMove;
			containerStyle += `transform:translateX(${move});"`;
		}

		if (data.boxWidth) {
			let width = data.boxWidth;
			containerStyle += `width:${width};"`;
		}

		containerStyle += '"';

		// imageStyle
		let imageStyle = `style="`;
		if (imageLink) {
			imageStyle += `background-image: url('${window.$rx.base(
				imageLink
			)}');`;
		}

		if (data.posx) {
			imageStyle += `background-position-x: ${data.posx};`;
		}

		if (data.width) {
			imageStyle += `width: ${data.width};`;
		}

		if (data.height) {
			imageStyle += `height: ${data.height};`;
		}

		if (data.posy) {
			imageStyle += `background-position-y: ${data.posy};`;
		}

		if (data.size) {
			imageStyle += `background-size: ${data.size};`;
		}

		imageStyle += `"`;

		let imageContainerHTML = imageLink
			? `<div class="rx-card-link-image-container"${containerStyle}>
			<div
			  class="${imageLinkClass}"
			  ${imageStyle}
			></div>
		  </div>`
			: "";
		let showURL = data.name || data.showURL || url;
		if (showURL.startsWith("file:///")) showURL = showURL.slice(8);
		if (url && iconLink) {
			urlHtml = `<div class="rx-card-link-href">
				<img class="rx-card-link-icon" alt="${url}" src="${iconLink}" />
				<span>${showURL}</span>
			</div>`;
		}
		if (url && !iconLink) {
			urlHtml = `<div class="rx-card-link-href">
			<span>${showURL}</span>
			</div>`;
		}

		if (!url) {
			urlHtml = `<div class="rx-card-link-href" style="display: none"></div>`;
		}

		let outCssClass = "rx-card-link-card-container";
		if (isUseFileIcon) {
			outCssClass += " use-file-icon";
		}

		html = `<div class="${outCssClass}">
			<a class="${
				url.startsWith("file")
					? "rx-card-link-card external-link"
					: "rx-card-link-card"
			}" href="${url}" target="_blank">
			  <div class="rx-card-link-card-text"${cardTextStyle}>
				<div class="rx-card-link-card-title">${title}</div>
				<div class="rx-card-link-card-description"><span>${description}</span></div>
				${urlHtml}
			</div>
			${imageContainerHTML}
		  </a>
		</div>`;

		const div = el.createDiv();
		div.innerHTML = html;
	}

	onunload() {
		this.abortController.abort();
	}
}
