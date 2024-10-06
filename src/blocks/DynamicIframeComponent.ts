import { App, MarkdownRenderChild, parseYaml } from "obsidian";
import { replaceAbsFilepath, replaceall, replaceHTMLLinks } from "src/utils";

function parseLineKey(lines: string[], key: string, defaultValue: string) {
	return (
		lines
			.filter((e) => e.startsWith(key))[0]
			?.slice(key.length)
			.trimStart() || defaultValue
	);
}

type ConfigKeys =
	| "width"
	| "height"
	| "debug"
	| "useVue"
	| "useAxios"
	| "useSwiper"
	| "useAppBody"
	| "useElementUI";

interface ConfigMapItem {
	name: ConfigKeys;
	default: string;
	type: "string" | "number";
}

type ConfigMap = Array<ConfigMapItem>;

const configMap: ConfigMap = [
	{
		name: "width",
		default: "100%",
		type: "string",
	},
	{
		name: "height",
		default: "400px",
		type: "string",
	},
	{
		name: "debug",
		default: "0",
		type: "number",
	},
	{
		name: "useVue",
		default: "1",
		type: "number",
	},
	{
		name: "useAxios",
		default: "1",
		type: "number",
	},
	{
		name: "useSwiper",
		default: "0",
		type: "number",
	},
	{
		name: "useAppBody",
		default: "1",
		type: "number",
	},
	{
		name: "useElementUI",
		default: "0",
		type: "number",
	},
];

type ConfigValueMap = {
    [K in ConfigKeys]: string | number;
}

function genConfigMap(lines: string[], configMap: ConfigMap) {
	const map: ConfigValueMap = {} as any;
	configMap.forEach((e) => {
		let value: string | number = parseLineKey(
			lines,
			e.name + ":",
			e.default
		);
		if (e.type === "number") {
			value = Number(value);
		}
		map[e.name] = value;
	});

	return map;
}

function compareConf(conf: ConfigValueMap, key: ConfigKeys, comparedValue = 0): boolean {
	const value = conf[key];

	if(typeof comparedValue === "number") {
		return Number(value) > comparedValue;
	}
	return value === comparedValue;
}

export class DynamicIframeComponent extends MarkdownRenderChild {
	private readonly abortController = new AbortController();
	private iframe: HTMLIFrameElement;
	static language = "rx-html";

	constructor(
		private readonly el: HTMLElement,
		private readonly markdownSource: string,
		private readonly app: App
	) {
		super(el);

		const iframeContainer = el.createDiv();
		const lines = replaceAbsFilepath(markdownSource.split("\n"));

		this.iframe = document.createElement("iframe");
		const conf = genConfigMap(lines, configMap);

		this.iframe.frameBorder = parseLineKey(lines, "border:", "none");

		let $injectValue = "";
		eval("$injectValue = " + parseLineKey(lines, "inject:", "{}"));
		const customInjectData = JSON.stringify($injectValue);

		const cssUrl = lines
			.filter((e) => e.startsWith("css:"))
			.map((e) => e.slice(4).trimStart())
			.map((e) => `<link rel="stylesheet" href="${e}">`)
			.join("\n");
		const jsUrl = lines
			.filter((e) => e.startsWith("js:"))
			.map((e) => e.slice(3).trimStart())
			.map((e) => `<script src="${e}"></script>`)
			.join("\n");

		const styleStart = lines.indexOf("<style>");
		const styleEnd = lines.lastIndexOf("</style>");
		let style = "";
		if (styleStart !== -1 && styleEnd !== -1 && styleStart < styleEnd) {
			style = lines
				.slice(styleStart + 1, styleEnd)
				.filter((e) => !e.startsWith("//"))
				.join("\n");
		}

		const bodyStart = lines.indexOf("<body>");
		const bodyEnd = lines.lastIndexOf("</body>");

		let body = "";
		if (bodyStart !== -1 && bodyEnd !== -1 && bodyStart < bodyEnd) {
			body = lines
				.slice(bodyStart + 1, bodyEnd)
				.filter((e) => !e.startsWith("//"))
				.join("\n");
		}

		if (compareConf(conf, "useAppBody")) {
			body = replaceHTMLLinks(body, false);
			body = `<div id="app">${body}</div>`;
		}

		const vueStart = lines.findIndex((e) => e.startsWith("<vue"));
		const vueEnd = lines.lastIndexOf("</vue>");

		let vue = "";
		let vueId = "";

		if (vueStart !== -1 && vueEnd !== -1 && vueStart < vueEnd) {
			const idStart = lines[vueStart].indexOf("id=");
			const idEnd = lines[vueStart].indexOf(">", idStart);
			if (idStart > 0) {
				vueId = lines[vueStart].slice(idStart, idEnd).trim();
				vueId = replaceall("id=", "", vueId);
				vueId = replaceall('"', "", vueId);
				vueId = replaceall("'", "", vueId);
				if (!vueId.startsWith("#")) {
					vueId = "#" + vueId;
				}

				vueId = '"' + vueId + '"';
			} else {
				vueId = '"#app"';
			}

			vue = lines
				.slice(vueStart + 1, vueEnd)
				.filter((e) => !e.startsWith("//"))
				.join("\n");
		}

		const headStart = lines.indexOf("<head>");
		const headEnd = lines.lastIndexOf("</head>");
		let head = "";

		if (headStart !== -1 && headEnd !== -1 && headStart < headEnd) {
			lines
				.slice(headStart + 1, headEnd)
				.filter((e) => !e.startsWith("//"))
				.join("\n");
		}

		const scriptStart = lines.indexOf("<script>");
		const scriptEnd = lines.lastIndexOf("</script>");
		let script = "";

		if (scriptStart !== -1 && scriptEnd !== -1 && scriptStart < scriptEnd) {
			script = lines
				.slice(scriptStart + 1, scriptEnd)
				.filter((e) => !e.startsWith("//"))
				.join("\n");
		}

		const injectData: any = {
			author: window.$rx.author,
			base: window.$rx.base(),
		};

		if (window.$rxmacro) {
			if (window.$rxmacro.M) {
				injectData["M"] = window.$rxmacro.M;
			}
			if (window.$rxmacro.F) {
				injectData["F"] = Object.assign({}, window.$rxmacro.F);
				delete injectData["F"]["vault"];
				delete injectData["F"]["parent"];
			}
		}

		const html = `<!DOCTYPE html><html>
<head>
${
	compareConf(conf, "useSwiper")
		? `<link rel="stylesheet" href="https://cdn.bootcdn.net/ajax/libs/Swiper/3.4.2/css/swiper.min.css">`
		: ""
}

${
	compareConf(conf, "useElementUI")
		? `<link rel="stylesheet" href="https://cdn.bootcdn.net/ajax/libs/element-ui/2.15.13/theme-chalk/index.css">`
		: ""
}
	${cssUrl}
	<style type="text/css" data-type="default-rx-html-css">
		body {
			padding: 1em;
		}
	</style>
	<style type="text/css">
${style}
	</style>
	<script>
	/* load inject data */
		window.$$ = ${customInjectData};
		window.$ = ${JSON.stringify(injectData)};

	/* load functions */
	const BASE = window.$.base;
	function localBaseJoin(filepath) {
		if (filepath.startsWith("file:///")) {
			filepath = filepath.slice(8);
		}
	
		if (filepath.startsWith("file://")) {
			filepath = filepath.slice(7);
		}
	
		if (filepath.startsWith("<file:///") && filepath.endsWith(">")) {
			filepath = filepath.slice(8, -1);
		}
	
		if (filepath.startsWith("<file://") && filepath.endsWith(">")) {
			filepath = filepath.slice(7, -1);
		}
	
		return filepath;
	}
	window.$.base = function (filepath) {
		if (!filepath) return BASE;
		if (
			filepath.startsWith("data:") ||
			filepath.startsWith("app:") ||
			filepath.startsWith("http")
		) {
			return filepath;
		}
		const localPath = localBaseJoin(filepath);
		if (localPath.startsWith("/")) {
			return BASE + localPath.slice(1);
		}
		return BASE + localPath;
	};
	window.$.date = function () {
		const date = new Date();
		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		const day = date.getDate();
		return year + "-" + month.toString().padStart(2, "0") + "-" + day.toString().padStart(2, "0");
	};

	window.$.time = function (showSeconds = false) {
		const date = new Date();
		const hour = date.getHours().toString().padStart(2, "0");
		const minute = date.getMinutes().toString().padStart(2, "0");
		const seconds = date.getSeconds().toString().padStart(2, "0");
		if (showSeconds) {
			return  \`\${hour}:\${minute}:\${seconds}\`;
		}
		return \`\${hour}:\${minute}\`;
	};

	window.$.dateTime = function (showSeconds = false) {
		return window.$.date() + " " + window.$.time(showSeconds);
	};
	
	window.$.copyText = window.navigator.clipboard.writeText;
	</script>
${head}
</head>
	<body>
${body}
	</body>
	${

		compareConf(conf, "useAxios")
			? '<script src="https://cdn.bootcdn.net/ajax/libs/axios/1.5.0/axios.min.js"></script>'
			: ""
	}
	${
		compareConf(conf, "useVue")
			? `<script src="https://cdn.bootcdn.net/ajax/libs/vue/2.6.14/vue.min.js"></script>
	<script src="https://cdn.bootcdn.net/ajax/libs/element-ui/2.15.13/index.min.js"></script>`
			: ""
	}

	${
		
		compareConf(conf, "useSwiper")

			? '<script src="https://cdn.bootcdn.net/ajax/libs/Swiper/3.4.2/js/swiper.min.js"></script>'
			: ""
	}
	${jsUrl}
	${
		vue.length
			? `
<script>
new Vue({
	el: ${vueId},
${vue}
})
</script>
		
		`
			: ""
	}
	<script>
	${script}
	</script>
</html>`;
		/*window.addEventListener("message", (event) => {
			window.$ = event.data;
		}, false);*/
		if (compareConf(conf, "debug")) {
			console.log(style);
			console.log(body);
			console.log(script);
			console.log(html);
		}
		const blob = new Blob([html], { type: "text/html" });

		this.iframe.style.width = conf["width"].toString();
		this.iframe.style.height = conf["height"].toString();;
		this.iframe.src = window.URL.createObjectURL(blob);

		// this.iframe.onload = () => {
		// 	this.iframe.contentWindow?.postMessage(injectData, "*");
		// };
		if (iframeContainer) {
			iframeContainer.innerHTML = "";
			iframeContainer.appendChild(this.iframe);
		}
	}

	onunload() {
		this.abortController.abort();
	}
}
