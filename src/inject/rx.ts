import { App } from "obsidian";
import { assets } from "../config";
import {
	genStyle,
	loadRemoteCss,
	loadRemoteJs,
	localBaseJoin,
	parseResourcePath,
} from "../utils";

declare global {
	interface Window {
		siphan: any;
		$rxmacro: any;
		newSiphan: any;
		d: (strings: string[] | string) => string;
		e: (strings: string[] | string) => string;
		k: (strings?: string) => void;
		D: (strings: string[] | string) => string;
		E: (strings: string[] | string) => string;
		K: (strings?: string) => void;
		$rx: {
			author: string;
			time: (showSeconds: boolean) => string;
			dateTime: () => string;
			vaultDir: string;
			Vue: any;
			elementUI: any;
			base: (path?: string) => string;
			loadRemoteJs: (jsUrl: string) => void;
			loadRemoteCss: (cssUrl: string) => void;
			copyText: (text: string) => void;
			file: (path: string) => any;
			app: App;
			date: () => string;
			notice: (s: string) => void;
			laptop1(filename: string): string;
			genStyle: (style: Record<string, string | undefined>) => string;
			_counter: Record<string, number>;
			settings: Record<string, string>;
		};
		Vue: any;
		ELEMENT: any;
		Swiper: any;
	}
}


export function injectRX(RX: any, app: App) {
	
	RX.app = app;
	RX._counter = {};
	RX.author = "Roger";
	RX.laptop1 = assets;
	RX.genStyle = genStyle;
	RX.loadRemoteJs = loadRemoteJs;
	RX.loadRemoteCss = loadRemoteCss;
	const BASE = parseResourcePath(RX.app.vault.adapter.getResourcePath(""));

	RX.base = function (filepath: string) {
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
	RX.date = function () {
		const date = new Date();
		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		const day = date.getDate();
		return `${year}-${month < 10 ? "0" + month : month}-${
			day < 10 ? "0" + day : day
		}`;
	};

	RX.time = function (showSeconds = false) {
		const date = new Date();
		const hour = date.getHours().toString().padStart(2, "0");
		const minute = date.getMinutes().toString().padStart(2, "0");
		const seconds = date.getSeconds().toString().padStart(2, "0");
		if (showSeconds) {
			return `${hour}:${minute}:${seconds}`;
		}
		return `${hour}:${minute}`;
	};

	RX.dateTime = function (showSeconds = false) {
		return RX.date() + " " + RX.time(showSeconds);
	};
	RX.notice = (s: string) => new (window as any).Notice(s);

	RX.copyText = window.navigator.clipboard.writeText;
	RX.file = (path: string) => RX.app.vault.getAbstractFileByPath(path);
	RX.settings = {};
}
