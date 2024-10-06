import {
	App,
	MarkdownPostProcessor,
	MarkdownRenderChild,
	Plugin,
	TFile,
	parseYaml,
} from "obsidian";

import * as path from "path";
import { Base64 } from "js-base64";
import * as child_process from "child_process";
import {
	assets,
	FEISHU_LOGOS,
	FILE_CARD_ICON,
	findFilename,
	NotePadPath,
	QQ_LOGOS,
	replaceAbsFilepath,
	replaceall,
	replaceHTMLLinks,
	resolveFileIcon,
	resolveWebImage,
	WECHAT_LOGOS,
} from "src";
import { injectRX } from "src/inject-rx";
import { EnabledBlocks } from "src/blocks";
import { MacroPostProcessor } from "src/blocks/MacroComponent";
import { loadRemoteResource } from "src/helper.ts/loadRemoteResource";


export default class MyPlugin extends Plugin {
	settings: any;

	async onload() {
		injectRX(window.$rx);
		loadRemoteResource();
		injectSiphan();

		this.loadCommand();
		this.registerMarkdownPostProcessor(MacroPostProcessor(this.app));
		// this.registerInterval(
		// 	window.setInterval(() => this.resetBannerWrapperDOM(), 500)
		// );
	}

	async checkSiphan(file: TFile) {
		const div = document.querySelector(
			"body > div.app-container > div.horizontal-main-container > div > div.workspace-split.mod-vertical.mod-root > div > div.workspace-tab-container > div.workspace-leaf.mod-active > div > div.view-content > div.markdown-reading-view > div > div"
		);
		const header = document.querySelector(
			"body > div.app-container > div.horizontal-main-container > div > div.workspace-split.mod-vertical.mod-root > div > div.workspace-tab-container > div.workspace-leaf.mod-active > div > div.view-content > div.markdown-reading-view > div > div > div.mod-header"
		);
		let body = await this.app.vault.cachedRead(file);
		let fmc = this.app.metadataCache.getFileCache(file)?.frontmatter;
		if (fmc && div && header) {
			const lines = body.split("\n");
			let end = lines.indexOf("---", 1);
			body = lines.slice(end + 1).join("\n");
			body = replaceall("<!--", "", body);
			body = replaceall("-->", "", body);

			if (Boolean(fmc?.siphan)) {
				const newDiv = document.createElement("div");
				let content = replaceall(
					"undefined",
					"",
					window.d(body.trim())
				);
				content = replaceall("\n", "<br />", content);
				content = replaceall("file:///", window.$rx.base(), content);
				newDiv.innerHTML = content;
				const children = Array.from(div.childNodes);

				for (const child of children) {
					//@ts-ignore
					if (!child.className) {
						div.removeChild(child);
					}
				}
				header.after(newDiv);
			}
		}
	}

	resetBannerWrapperDOM() {
		const className = "obsidian-banner-wrapper";
		const bannerWrapper = document.querySelector("." + className);

		if (bannerWrapper) {
			const parent = bannerWrapper.parentNode!;
			const firstChild = parent.firstChild as HTMLDivElement;
			if (parent && firstChild && firstChild.className !== className) {
				parent?.removeChild(bannerWrapper);
				parent?.prepend(bannerWrapper);
			}
		}
	}

	loadCommand() {
		const vaultDir = (this.app.vault.adapter as any).basePath;
		window.$rx.vaultDir = vaultDir;

		EnabledBlocks.forEach((Block) =>
			this.registerMarkdownCodeBlockProcessor(
				Block.language,
				(source, el, ctx) => {
					ctx.addChild(new Block(el, source, this.app));
				}
			)
		);


	



		this.addCommand({
			id: "copy-file-path",
			name: "Copy File Path",
			callback: () => {
				const activeFile = path.join(
					vaultDir,
					this.app.workspace.getActiveFile()!.path
				);
				navigator.clipboard.writeText(activeFile);
			},
		});

		this.addCommand({
			id: "open-in-vscode",
			name: "open in vscode",
			callback: () => {
				const activeFile = path.join(
					vaultDir,
					this.app.workspace.getActiveFile()!.path
				);
				child_process.exec(
					`code "${activeFile}"`,
					(err: any, stdout: any, stderr: any) => {
						if (err) {
							console.log(err);
							return;
						}
						console.log(stdout);
					}
				);
			},
		});

		this.addCommand({
			id: "open-in-notepad++",
			name: "open in notepad++",
			callback: () => {
				const activeFile = path.join(
					vaultDir,
					this.app.workspace.getActiveFile()!.path
				);
				child_process.exec(
					`"${NotePadPath}" "${activeFile}"`,
					(err: any, stdout: any, stderr: any) => {
						if (err) {
							console.log(err);
							return;
						}
						console.log(stdout);
					}
				);
			},
		});

		this.addCommand({
			id: "open-in-vscode-all-folder",
			name: "open in vsCode (from the folder)",
			callback: () => {
				const activeFileDir = path.join(
					vaultDir,
					this.app.workspace.getActiveFile()!.parent!.path
				);
				child_process.exec(
					`code "${activeFileDir}"`,
					(err: any, stdout: any, stderr: any) => {
						if (err) {
							console.log(err);
							return;
						}
						console.log(stdout);
					}
				);
			},
		});

		this.addCommand({
			id: "open-today-worklog",
			name: "open today's worklog",
			callback: async () => {
				const path =
					"PARA/E005-Dailynotes/A002-Worklog/" +
					window.$rx.date() +
					"_工作日志.md";
				let file = this.app.vault.getAbstractFileByPath(path);
				if (!file) {
					file = await this.app.vault.create(path, "");
				}
				const leaf = this.app.workspace.getLeaf(true);
				await leaf.openFile(file as any);
			},
		});

		this.addCommand({
			id: "open-today-record",
			name: "open today's record",
			callback: async () => {
				const path =
					"PARA/E005-Dailynotes/A003-Records/" +
					window.$rx.date() +
					"_Record.md";
				let file = this.app.vault.getAbstractFileByPath(path);
				if (!file) {
					file = await this.app.vault.create(path, "");
				}
				const leaf = this.app.workspace.getLeaf(true);
				await leaf.openFile(file as any);
			},
		});
	}
}





function injectSiphan() {
	var key: string[] = [];
	key[0] = "a";
	key[1] = "b";
	key[2] = "c";
	key[3] = "d";
	key[4] = "e";
	key[5] = "f";
	key[6] = "g";
	key[7] = "h";
	key[8] = "i";
	key[9] = "j";
	key[10] = "k";
	key[11] = "l";
	key[12] = "m";
	key[13] = "n";
	key[14] = "o";
	key[15] = "p";
	key[16] = "q";
	key[17] = "r";
	key[18] = "s";
	key[19] = "t";
	key[20] = "u";
	key[21] = "v";
	key[22] = "w";
	key[23] = "x";
	key[24] = "y";
	key[25] = "z";
	key[26] = "A";
	key[27] = "B";
	key[28] = "C";
	key[29] = "D";
	key[30] = "E";
	key[31] = "F";
	key[32] = "G";
	key[33] = "H";
	key[34] = "I";
	key[35] = "J";
	key[36] = "K";
	key[37] = "L";
	key[38] = "M";
	key[39] = "N";
	key[40] = "O";
	key[41] = "P";
	key[42] = "Q";
	key[43] = "R";
	key[44] = "S";
	key[45] = "T";
	key[46] = "U";
	key[47] = "V";
	key[48] = "W";
	key[49] = "X";
	key[50] = "Y";
	key[51] = "Z";
	key[52] = ",";
	key[53] = ".";
	key[54] = "?";
	key[55] = "!";
	key[56] = ":";
	key[57] = ";";
	key[58] = "+";
	key[59] = "-";
	key[60] = "*";
	key[61] = "/";
	key[62] = "^";
	key[63] = "@";
	key[64] = "0";
	key[65] = "1";
	key[66] = "2";
	key[67] = "3";
	key[68] = "4";
	key[69] = "5";
	key[70] = "6";
	key[71] = "7";
	key[72] = "8";
	key[73] = "9";
	key[74] = "%";
	key[75] = "<";
	key[76] = ">";
	key[77] = "#";
	key[78] = "$";
	key[79] = "&";
	key[80] = "=";
	key[81] = "_";
	key[82] = "|";
	key[83] = " ";

	function strToArray(str: string) {
		var _arr = [];

		for (var i = 0; i < str.length; i++) {
			_arr[i] = str[i];
		}

		return _arr;
	}

	function filp(arr: any[]) {
		var _filp = {};

		for (var i = 0; i < Object.keys(arr).length; i++) {
			//@ts-ignore
			_filp[Object.values(arr)[i] + ""] = Object.keys(arr)[i] * 1;
		}

		return _filp;
	}

	function decrypt(str: string, solution = SOLUTION) {
		var plain = "";
		var decrypt_key = strToArray(solution!);
		var filp_decryptKey = filp(decrypt_key);

		for (var i = 0; i < str.length; i++) {
			//@ts-ignore
			var j = filp_decryptKey[str[i]] - i;

			while (j <= -1 || j >= key.length + 1) {
				if (j <= -1) {
					j = j + key.length;
				}

				if (j >= key.length + 1) {
					j = j - key.length;
				}
			}
			//@ts-ignore
			plain += key[j];
		}

		return plain;
	}

	function decryptUTF8(cipher: string, solution = SOLUTION) {
		try {
			return decodeURI(decrypt(cipher, (solution = SOLUTION)));
		} catch (e) {
			var type = "decrypt_decode_url_error";
			var error = new URIError(
				"The cipher can not be decoded as any type of URL code."
			);
			this.catchError(
				{
					cipher: cipher,
					solution: solution,
				},
				{
					type: type,
					error: error,
				}
			);
			throw error;
		} finally {
		}
	}

	function _randSort(a: number, b: number) {
		return Math.random() > 0.5 ? -1 : 1;
	}

	function arrayToString(arr: any[]) {
		var str = "";

		for (var i in arr) {
			str += arr[i];
		}

		return str;
	}

	function randArray(arr: any[]) {
		var _arr: any[] = [];

		for (var i in arr) {
			_arr[i] = arr[i];
		}

		return _arr.sort(_randSort);
	}

	function newKey() {
		//@ts-ignore
		var encrypt_key = randArray(key);
		return arrayToString(encrypt_key);
	}
	let SOLUTION: string | null = null;

	function encrypt(str: string) {
		var cipher = "";
		var random = true;
		//@ts-ignore
		var yek = filp(key);
		//@ts-ignore
		var encrypt_key = randArray(key);
		var solution = arrayToString(encrypt_key);

		for (var i = 0; i < str.length; i++) {
			//@ts-ignore
			var j = (yek[str[i]] + i) % key.length;
			cipher += encrypt_key[j];
		}

		return {
			cipher: cipher,
			solution: solution,
			random: random,
		};
	}

	function encryptAs(str: string, solution = SOLUTION) {
		var cipher = "";
		var random = false;
		//@ts-ignore
		var yek = filp(key);
		var encrypt_key = strToArray(solution!);

		for (var i = 0; i < str.length; i++) {
			//@ts-ignore
			var j = (yek[str[i]] + i) % key.length;
			cipher += encrypt_key[j];
		}

		return {
			cipher: cipher,
			solution: solution,
			random: random,
		};
	}

	function encryptUTF8(str: string) {
		return encrypt(encodeURI(str));
	}

	function encryptUTF8As(str: string, solution = SOLUTION) {
		return encryptAs(encodeURI(str), (solution = SOLUTION));
	}

	function catchError() {}

	var Siphan = function Siphan() {
		this.name = "siphan";
		this.version = "0.0.3";
	};

	Object.assign(Siphan.prototype, {
		catchError: catchError,
		newKey: newKey,
		encrypt: encrypt,
		encryptUTF8: encryptUTF8,
		decrypt: decrypt,
		decryptUTF8: decryptUTF8,
		encryptAs: encryptAs,
		encryptUTF8As: encryptUTF8As,
	});

	//@ts-ignore
	var App = new Siphan();

	App.__proto__["new"] = function () {
		//@ts-ignore
		return new Siphan();
	};

	function randomPrefix() {
		const rand = (min: number, max: number) =>
			Math.floor(Math.random() * (max - min + 1)) + min;
		let res = rand(1, 9);
		for (let i = 1; i < rand(8, 20); i++) {
			const randomDigit = rand(0, 9);
			res = res * 10 + randomDigit;
		}
		return res;
	}

	function d(strings: string[] | string) {
		let text = typeof strings === "string" ? strings : strings.join("");
		if (text.slice(0, 3).includes("h=")) {
			return App.decryptUTF8(text);
		}

		let res = Base64.decode(App.decrypt(text));
		if (
			res.indexOf("+") < 21 &&
			!isNaN(Number(res.slice(0, res.indexOf("+"))))
		) {
			res = res.slice(res.indexOf("+") + 1);
		}
		return res;
	}

	function e(strings: string[] | string) {
		let text = typeof strings === "string" ? strings : strings.join("");
		return App.encryptAs(
			Base64.encode(randomPrefix().toString() + "+" + text),
			SOLUTION
		).cipher;
	}

	function k(solution?: string) {
		const x =
			"T3018?#%=9Q$U!;@RZ^X+c:7S&BsDtJyfdExkrPAbvGINlghKLnjqHmpwCFOi6*/V,|.a >M_YWzoe-5u4<2";
		SOLUTION = solution ? App.decrypt(solution, x) : null;
	}

	window.d = d;
	window.e = e;
	window.k = k;

	//@ts-ignore
	window.D = d;
	//@ts-ignore
	window.E = e;
	//@ts-ignore
	window.K = k;
}
