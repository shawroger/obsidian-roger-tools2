import { safePath } from "src/utils";

export interface ISettings {
	OBS_RESOURCE: string;
	NOTEPAD_PATH: string;
	OBS_OLD_RESOURCE2: string;
	XID_OPEN_ACTION_ID: string;
}

export const defaultSettings: ISettings = {
	OBS_RESOURCE: "D:/_jane/S0/_assets/obsidianResource/",
	NOTEPAD_PATH: "C:\\Program Files\\Notepad++\\notepad++.exe",
	OBS_OLD_RESOURCE2: "D:/_jane/S2024/_assets/S002/",
	XID_OPEN_ACTION_ID: "2402c374-0315-4810-aeb9-d1e77ac39526"
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
		desc: "聊天记录中头像图片的保存路径路径（本地路径需建议加上 file:/// 前缀）",
		mapFunc: safePath,
	},
	{
		key: "NOTEPAD_PATH",
		name: "Notepad++ 路径",
		desc: "",
		mapFunc: (e) => e,
	},
	{
		key: "XID_OPEN_ACTION_ID",
		name: "XID_OPEN 动作 ID",
		desc: "XID_OPEN 动作的 ID，不需要 quicker:runaction 前缀",
		mapFunc: (e) => e,
	},
];

export function injectSettings(RX: any, newSettings: ISettings) {
	if (!RX.settings) RX.settings = {};
	RX.settings = { ...RX.settings, ...newSettings };
}
