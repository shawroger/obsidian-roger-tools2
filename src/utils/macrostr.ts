
const letterList = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const romanNumberList = "ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ".split("");
const lowerRomanNumberList = "ⅰⅱⅲⅳⅴⅵⅶⅷⅸⅹ".split("");
const circleNumberList = [
	"⓪",
	"①",
	"②",
	"③",
	"④",
	"⑤",
	"⑥",
	"⑦",
	"⑧",
	"⑨",
	"⑩",
	"⑪",
	"⑫",
	"⑬",
	"⑭",
	"⑮",
	"⑯",
	"⑰",
	"⑱",
	"⑲",
	"⑳",
	"㉑",
	"㉒",
	"㉓",
	"㉔",
	"㉕",
	"㉖",
	"㉗",
	"㉘",
	"㉙",
	"㉚",
	"㉛",
	"㉜",
	"㉝",
	"㉞",
	"㉟",
	"㊱",
	"㊲",
	"㊳",
	"㊴",
	"㊵",
	"㊶",
	"㊷",
	"㊸",
	"㊹",
	"㊺",
	"㊻",
	"㊼",
];

const coloredCircleNumberList = [
	"⓿",
	"❶",
	"❷",
	"❸",
	"❹",
	"❺",
	"❻",
	"❼",
	"❽",
	"❾",
	"❿",
	"⓫",
	"⓬",
	"⓭",
	"⓮",
	"⓯",
	"⓰",
	"⓱",
	"⓲",
	"⓳",
	"⓴",
];

const chineseNumberList = [
	"一",
	"二",
	"三",
	"四",
	"五",
	"六",
	"七",
	"八",
	"九",
	"十",
	"十一",
	"十二",
	"十三",
	"十四",
	"十五",
	"十六",
	"十七",
	"十八",
	"十九",
	"二十",
];

const bigChineseNumberList = "壹贰叁肆伍陆柒捌玖拾".split("");

export function getCounterStr(index: number, numberType: number) {
	if (numberType === 1 && index < romanNumberList.length) {
		return romanNumberList[index];
	}

	if (numberType === 2 && index < lowerRomanNumberList.length) {
		return lowerRomanNumberList[index];
	}

	if (numberType === 3 && index < circleNumberList.length) {
		return circleNumberList[index];
	}

	if (numberType === 31 && index < coloredCircleNumberList.length) {
		return coloredCircleNumberList[index];
	}

	if (numberType === 4 && index < letterList.length) {
		return letterList[index].toLowerCase();
	}

	if (numberType === 5 && index < letterList.length) {
		return letterList[index].toUpperCase();
	}

	if (numberType === 6 && index < chineseNumberList.length) {
		return chineseNumberList[index];
	}

	if (numberType === 7 && index < bigChineseNumberList.length) {
		return bigChineseNumberList[index];
	}

	return index.toString();
}


