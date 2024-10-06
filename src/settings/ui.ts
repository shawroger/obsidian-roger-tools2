import RogerTool2Plugin from "src/main";
import { defaultSettings, SettingPanel } from "./define";
import { App, PluginSettingTab, Setting } from "obsidian";

export class RogerTool2PluginSettingTab extends PluginSettingTab {
	plugin: RogerTool2Plugin;

	constructor(app: App, plugin: RogerTool2Plugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let { containerEl } = this;

		containerEl.empty();

		SettingPanel.forEach((item) => {
			new Setting(containerEl)
				.setName(item.name)
				.setDesc(item.desc)
				.addText((text) =>
					text
						.setPlaceholder(defaultSettings[item.key])
						.setValue(this.plugin.settings[item.key])
						.onChange(async (value) => {
							this.plugin.settings[item.key] = item.mapFunc(
								value || defaultSettings[item.key]
							);
							await this.plugin.saveSettings();
						})
				);
		});
	}
}
