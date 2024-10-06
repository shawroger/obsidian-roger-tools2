import { App, MarkdownRenderChild } from "obsidian";

// this.registerMarkdownCodeBlockProcessor("vuejs", (source, el, ctx) => {
// 	//@ts-ignore
// 	window.Vue.use(window.ELEMENT);
// 	window.$rx.Vue = window.Vue;
// 	window.$rx.elementUI = window.ELEMENT;
// 	ctx.addChild(
// 		// @ts-ignore
// 		new VueComponent(el, source)
// 	);
// });

export class VueComponent extends MarkdownRenderChild {
	static language = "vuejs";
	private readonly abortController = new AbortController();
	private newVue: any;
	constructor(
		private readonly el: HTMLElement,
		private readonly markdownSource: string,
		private readonly plugin: App
	) {
		super(el);

		let vm: any = {};
		eval("vm = " + this.markdownSource);
		vm.el = el;
		const vmdata = { ...vm.data, $rx: window.$rx, $ob: window.$rx.app };
		vm.data = function () {
			return vmdata;
		};
		this.newVue = new (window as any).Vue(vm);
	}

	onunload() {
		if (this.newVue) {
			this.newVue.$destroy();
		}
		this.abortController.abort();
	}
}
