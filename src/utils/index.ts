import {
	assets,
	FEISHU_LOGOS,
	FILE_CARD_ICON,
	QQ_LOGOS,
	WEB_ICONS,
	WEB_IMAGES,
	WECHAT_LOGOS,
} from "../config";

export function safePath(value: string) {
	if (value && !value.startsWith("file:///")) return "file:///" + value;
	return value;
}

export function assetsOld(filename: string) {
	return window.$rx?.settings["OBS_OLD_RESOURCE2"] + filename;
}

export function replaceHTMLLinks(content: string, autoNewLine = false) {
	let res = replaceall(
		window.$rx?.settings["OBS_RESOURCE"],

		"assets://",
		content
	);

	res = replaceall("file:///", window.$rx.base(), res);

	if (autoNewLine) {
		let lines = res.split("\n");

		res = lines
			.filter((e) => e.length > 0)
			.map((line) => (isPureText(line) ? "<p>" + line + "</p>" : line))
			.join("\n");
	}

	return res;
}

export function replaceAbsFilepath(lines: string): string;
export function replaceAbsFilepath(lines: string[]): string[];
export function replaceAbsFilepath(lines: string[] | string) {
	if (typeof lines === "string") {
		return replaceall("file:///", window.$rx.base(), lines);
	}
	return lines.map((e) => {
		if (e.includes("file:///")) {
			return replaceall("file:///", window.$rx.base(), e);
		}
		return e;
	});
}

export function formatJson(text: string) {
	let json = this.replaceall("{", '{"', text);
	json = this.replaceall(": ", '": "', json);
	json = this.replaceall("}", '"}', json);
	json = this.replaceall(", ", '", "', json);
	json = this.replaceall('"}"', '"}', json);
	json = this.replaceall('"{"', '{"', json);
	return json;
}

export function resolveJson(line: string, prefixText: string) {
	if (typeof line !== "string") {
		return null;
	}
	const startIndex = line.indexOf(prefixText);
	const restLine = line.slice(startIndex + prefixText.length);
	const resolvedText = restLine.slice(0, restLine.indexOf("%%"));
	const json = this.formatJson(resolvedText);
	const value = JSON.parse(json);
	return value;
}

export function parseResourcePath(resourcePath: string) {
	const windowDriveLetter = [
		"C",
		"D",
		"E",
		"F",
		"G",
		"H",
		"I",
		"J",
		"K",
		"L",
		"M",
		"N",
		"O",
		"P",
		"Q",
		"R",
		"S",
		"T",
		"U",
		"V",
		"W",
		"X",
		"Y",
		"Z",
	];
	for (const letter of windowDriveLetter) {
		const pathName = "/" + letter + ":/";
		if (resourcePath.includes(pathName)) {
			return resourcePath.split(pathName)[0] + "/";
		}
	}
	return "";
}

export function localBaseJoin(filepath: string) {
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

export function loadRemoteCss(cssUrl: string) {
	const link = document.createElement("link");
	link.type = "text/css";
	link.rel = "stylesheet";
	link.href = cssUrl;
	const head = document.getElementsByTagName("head")[0];
	head.appendChild(link);
}

export function loadRemoteJs(jsUrl: string) {
	const script = document.createElement("script");
	script.type = "text/javascript";
	script.src = jsUrl;
	const head = document.getElementsByTagName("head")[0];
	head.appendChild(script);
}

export function genStyle(style: Record<string, string | undefined>) {
	let styleText = 'style="';
	for (const key in style) {
		const value = style[key];
		if (value) styleText += `${key}:${style[key]};`;
	}
	return styleText + '"';
}

export function resolveFileIcon(file: string, filetype?: string) {
	if (
		filetype === "folder" ||
		filetype === "dir" ||
		file.endsWith("/") ||
		file.endsWith("\\")
	) {
		return "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNjk1OTk0ODA2NTA1IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjI3ODQiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PHBhdGggZD0iTTUwNi41IDI5NS43TDQxOS44IDE3MEgxOTd2Njg2aDcwOS40VjMwNy4xSDUyOC4yYy04LjcgMC0xNi44LTQuMy0yMS43LTExLjR6IiBmaWxsPSIjOTFCNEZGIiBwLWlkPSIyNzg1Ij48L3BhdGg+PHBhdGggZD0iTTkzMi41IDkwOC45SDkwLjhjLTE0LjYgMC0yNi41LTExLjgtMjYuNS0yNi41di03NmMwLTE0LjYgMTEuOC0yNi41IDI2LjUtMjYuNXMyNi41IDExLjggMjYuNSAyNi41djQ5LjVIOTA2VjMwNy4xSDUyNy45Yy04LjcgMC0xNi44LTQuMy0yMS44LTExLjRMNDE5LjQgMTcwSDExNy4zdjQwMi44YzAgMTQuNi0xMS44IDI2LjUtMjYuNSAyNi41cy0yNi41LTExLjgtMjYuNS0yNi41VjE0My41YzAtMTQuNiAxMS44LTI2LjUgMjYuNS0yNi41aDM0Mi40YzguNyAwIDE2LjggNC4zIDIxLjggMTEuNGw4Ni43IDEyNS43aDM5MC43YzE0LjYgMCAyNi41IDExLjggMjYuNSAyNi41djYwMS44YzAuMSAxNC42LTExLjggMjYuNS0yNi40IDI2LjV6IiBmaWxsPSIjMzc3OEZGIiBwLWlkPSIyNzg2Ij48L3BhdGg+PHBhdGggZD0iTTkxLjIgNzM0LjRjLTE0LjYgMC0yNi41LTExLjgtMjYuNS0yNi41di00OC41YzAtMTQuNiAxMS44LTI2LjUgMjYuNS0yNi41czI2LjUgMTEuOCAyNi41IDI2LjVWNzA4YzAgMTQuNi0xMS45IDI2LjQtMjYuNSAyNi40ek05MjYuMiA0MzEuNmgtODM1Yy0xNC42IDAtMjYuNS0xMS44LTI2LjUtMjYuNSAwLTE0LjYgMTEuOC0yNi41IDI2LjUtMjYuNWg4MzVjMTQuNiAwIDI2LjUgMTEuOCAyNi41IDI2LjVzLTExLjkgMjYuNS0yNi41IDI2LjV6IiBmaWxsPSIjMzc3OEZGIiBwLWlkPSIyNzg3Ij48L3BhdGg+PC9zdmc+";
	}

	if (filetype && FILE_CARD_ICON()[filetype]) {
		return FILE_CARD_ICON()[filetype];
	}
	for (const name of Object.keys(FILE_CARD_ICON)) {
		if (file.toLowerCase().endsWith(name)) {
			return FILE_CARD_ICON()[name];
		}
	}
	return assets(`fileIcon${filetype}.png`);
}

export function findFilename(file: string) {
	const index = file.lastIndexOf("/");
	return file.slice(index + 1);
}
export function replaceall(
	replaceThis: string,
	withThis: string,
	inThis: string
) {
	withThis = withThis.replace(/\$/g, "$$$$");
	return inThis.replace(
		new RegExp(
			replaceThis.replace(
				/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|<>\-\&])/g,
				"\\$&"
			),
			"g"
		),
		withThis
	);
}

export function resolveWebImage(
	url: string,
	isIcon: boolean = false,
	autoFind?: string
) {
	const map = isIcon ? WEB_ICONS() : WEB_IMAGES();
	if (url.startsWith("www.")) url = url.slice(4);

	for (const key in map) {
		if (url.includes(key)) {
			return window.$rx.base(map[key]);
		}
	}

	if (autoFind) {
		if (!autoFind.startsWith(".")) autoFind = "." + autoFind;
		return window.$rx.base(
			assets(isIcon ? "webIcon@" : "webImage@" + url + autoFind)
		);
	}

	return "";
}

export const isPureText = (line: string) =>
	!line.includes("</") && !line.includes("/>");

export function resolveLogo(
	name: string,
	image: string,
	chatType: "qq" | "wechat" | "feishu"
) {
	if (image && image.length > 3) {
		if (image.startsWith("assets://")) {
			return window.$rx.base(assets(image.slice(9)));
		}
		return window.$rx.base(image);
	}

	if (name === "我") name = "me";

	if (chatType === "qq") {
		const logo = QQ_LOGOS()[name];
		if (logo) {
			return window.$rx.base(logo);
		}
	}
	if (chatType === "wechat") {
		const logo = WECHAT_LOGOS()[name];
		if (logo) {
			return window.$rx.base(logo);
		}
	}

	if (chatType === "feishu") {
		const logo = FEISHU_LOGOS()[name];
		if (logo) {
			return window.$rx.base(logo);
		}
	}

	return window.$rx.base(assets(`${chatType}Avatar@${name}.png`));
}
