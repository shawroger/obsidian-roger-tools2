import { Base64 } from "js-base64";

export function injectSiphan() {
	var key: string[] =
		"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ,.?!:;+-*/^@0123456789%<>#$&=_| ".split(
			""
		);

	function strToArray(str: string) {
		var _arr = [];

		for (var i = 0; i < str.length; i++) {
			_arr[i] = str[i];
		}

		return _arr;
	}

	function filp(arr: any[]) {
		var _filp = {} as any;

		for (var i = 0; i < Object.keys(arr).length; i++) {
			_filp[Object.values(arr)[i] + ""] =
				(Object.keys(arr) as any)[i] * 1;
		}

		return _filp;
	}

	function decrypt(str: string, solution = SOLUTION) {
		var plain = "";
		var decrypt_key = strToArray(solution!);
		var filp_decryptKey = filp(decrypt_key) as any;

		for (var i = 0; i < str.length; i++) {
			var j = filp_decryptKey[str[i]] - i;

			while (j <= -1 || j >= key.length + 1) {
				if (j <= -1) {
					j = j + key.length;
				}

				if (j >= key.length + 1) {
					j = j - key.length;
				}
			}
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
		var encrypt_key = randArray(key);
		return arrayToString(encrypt_key);
	}
	let SOLUTION: string | null = null;

	function encrypt(str: string) {
		var cipher = "";
		var random = true;
		var yek = filp(key);
		var encrypt_key = randArray(key);
		var solution = arrayToString(encrypt_key);

		for (var i = 0; i < str.length; i++) {
			var j = ((yek as any)[str[i]] + i) % key.length;
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
		var yek = filp(key);
		var encrypt_key = strToArray(solution!);

		for (var i = 0; i < str.length; i++) {
			var j = ((yek as any)[str[i]] + i) % key.length;
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

	var USE_BASE64 = true;
	var App: any = new (Siphan as any)();

	App.__proto__["new"] = function () {
		return new (Siphan as any)();
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

	function isBase64Text(text?: string) {
		if (!text) return true;
		return false === "!%@#:<*&-_>.?|;".split("").some((e) => text.includes(e));
	}

	function safeAtob(text?: string) {
		if (!text) return "";
		if (isBase64Text(text)) return atob(text);
		return text;
	}

	function d(strings: string[] | string) {
		let text = typeof strings === "string" ? strings : strings.join("");

		text = safeAtob(text);

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

	function e(strings: string[] | string, useBase64 = USE_BASE64) {
		let text = typeof strings === "string" ? strings : strings.join("");
		let cipher = App.encryptAs(
			Base64.encode(randomPrefix().toString() + "+" + text),
			SOLUTION
		).cipher;

		return USE_BASE64 ? btoa(cipher) : cipher;
	}

	function k(solution?: string) {
		const x =
			"T3018?#%=9Q$U!;@RZ^X+c:7S&BsDtJyfdExkrPAbvGINlghKLnjqHmpwCFOi6*/V,|.a >M_YWzoe-5u4<2";
		solution = safeAtob(solution);
		SOLUTION = solution ? App.decrypt(solution, x) : null;
		// console.log(solution);
	}

	window.d = d;
	window.e = e;
	window.k = k;
	window.D = d;
	window.E = e;
	window.K = k;
}
