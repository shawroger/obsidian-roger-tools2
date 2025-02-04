import { safePath } from "src/utils";

export interface ISettings {
	OBS_RESOURCE: string;
	NOTEPAD_PATH: string;
	OBS_OLD_RESOURCE2: string;
}

export const defaultSettings: ISettings = {
	OBS_RESOURCE: "D:/_jane/S0/_assets/obsidianResource/",
	NOTEPAD_PATH: "C:\\Program Files\\Notepad++\\notepad++.exe",
	OBS_OLD_RESOURCE2: "D:/_jane/S2024/_assets/S002/",
};

export const SettingPanel: {
	key: keyof ISettings;
	name: string;
	desc: string;
	mapFunc: (value: string) => string;
}[] = [
	{
		key: "OBS_RESOURCE",
		name: "聊天头像图片路径",
		desc: "聊天记录中头像图片的保存路径路径（本地路径需要加上 file:/// 前缀）",
		mapFunc: safePath,
	},
	{
		key: "NOTEPAD_PATH",
		name: "Notepad++ 路径",
		desc: "",
		mapFunc: (e) => e,
	},
];

export function injectSettings(RX: any, newSettings: ISettings) {
	if (!RX.settings) RX.settings = {};
	RX.settings = { ...RX.settings, ...newSettings };
}
