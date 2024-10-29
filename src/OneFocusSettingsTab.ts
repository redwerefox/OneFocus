import { App,  PluginSettingTab, Setting } from 'obsidian';
import  {OneFocus} from '../main';
import {Activity} from './ActivityVault';


export interface OneFocusSettings {
    activities: Activity[];
}

export const DEFAULT_ONEFOCUS_SETTINGS: OneFocusSettings = {
	activities : [new Activity('No Activities')]
}

export class OneFocusSettingsTab extends PluginSettingTab {
    plugin: OneFocus;
    
    constructor(app: App, plugin: OneFocus) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;

        containerEl.empty();

        containerEl.createEl('h2', {text: 'OneFocus Settings'});
        //create a editable text field
        this.plugin.settings.activities.forEach((activity: Activity) => {
        new Setting(containerEl)
            .setName('Activity')
            .setDesc('Modify activities to focus on')
            .addText(text => text
                .setValue(activity.displayName)
                .onChange(value => {
                    activity.displayName = value;
                }));
            });

        new Setting(containerEl)
            .setName('Add Activity')
            .setDesc('Add a new activity')
            .addButton(button => button
                .setButtonText('Add')
                .onClick(() => {
                    this.plugin.activitiesVault.addActivity(DEFAULT_ONEFOCUS_SETTINGS.activities[0]);
                    this.display();
                }));
    }
}
