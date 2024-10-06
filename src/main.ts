import { Plugin } from "obsidian";
import { injectRX } from "src/inject/rx";
import { EnabledBlocks } from "src/blocks";
import { MacroPostProcessor } from "src/blocks/MacroComponent";
import { loadRemoteResource } from "src/helper.ts/loadRemoteResource";
import { injectSiphan } from "./inject/siphan";
import { addCommands } from "./helper.ts/command";
import { defaultSettings, ISettings, injectSettings } from "./settings/define";
import { RogerTool2PluginSettingTab } from "./settings/ui";

export default class RogerTool2Plugin extends Plugin {
	settings: ISettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new RogerTool2PluginSettingTab(this.app, this));

		if (!window.$rx) (window.$rx as any) = {};
		injectRX(window.$rx, this.app);
		injectSettings(window.$rx, this.settings);
		injectSiphan();
		loadRemoteResource();
		this.provideImplements();
		this.registerMarkdownPostProcessor(MacroPostProcessor(this.app));
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			defaultSettings,
			await this.loadData()
		);
	}

	async saveSettings() {
		this.saveData(this.settings).then(() => {
			injectSettings(window.$rx, this.settings);
		});
	}

	provideImplements() {
		addCommands(this);
		EnabledBlocks.forEach((Block) =>
			this.registerMarkdownCodeBlockProcessor(
				Block.language,
				(source, el, ctx) => {
					ctx.addChild(new Block(el, source, this.app));
				}
			)
		);
	}
}
