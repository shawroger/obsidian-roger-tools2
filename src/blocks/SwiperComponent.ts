import { App, MarkdownRenderChild, parseYaml } from "obsidian";
import { replaceHTMLLinks } from "src/utils";

export class SwiperComponent extends MarkdownRenderChild {
	private readonly abortController = new AbortController();
	static language = "swiper";
	constructor(
		private readonly el: HTMLElement,
		private readonly markdownSource: string,
		private readonly plugin: App
	) {
		super(el);
		const data = parseYaml(markdownSource);
		let cssClass = "rx-swiper-container";
		let selector = cssClass;
		if (data.uid) {
			cssClass = `rx-swiper-container uid-${data.uid}`;
			selector = `.rx-swiper-container.uid-${data.uid}`;
		}
		const config = Object.assign(data.config || {}, {});
		config.width = data.width || 640;
		config.height = data.height || 480;
		if (data.arrow) {
			config.prevButton = ".swiper-button-prev";
			config.nextButton = ".swiper-button-next";
		}

		if (data.page) {
			config.paginationClickable = true;
			config.pagination = ".swiper-pagination";
		}

		const arrowStyle = `style="top: initial !important;transform: translateY(-${
			0.5 * parseInt(data.arrowPos || config.height)
		}px) !important;"`;

		const listHTML = data.list
			.map((e: string) => `<div class="swiper-slide">${e}</div>`)
			.join("");
		let html = `<div class="${cssClass}" style="width:${parseInt(
			config.width
		)}px;height:${parseInt(config.height)}px">
			<div class="swiper-wrapper">${listHTML}</div>
        	${data.page ? `<div class="swiper-pagination"></div>` : ""}
			${
				data.arrow
					? `<div class="swiper-button-prev" ${arrowStyle}></div><div class="swiper-button-next" ${arrowStyle}></div>`
					: ""
			}
		</div>`;
		const div = el.createDiv();
		div.innerHTML = html;

		if (window.Swiper) {
			new window.Swiper(selector, Object.assign(config, {}));
		}
		setTimeout(() => {
			if (window.Swiper) {
				new window.Swiper(selector, Object.assign(config, {}));
			}
		}, 1000);
	}

	onunload() {
		this.abortController.abort();
	}
}
