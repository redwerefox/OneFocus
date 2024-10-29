import { App,  PluginSettingTab, Setting } from 'obsidian';
import OneFocus from '../main';
import {Activity, ActivitiesVault, ActivitesObserver} from './ActivityVault';


export interface OneFocusSettings {
    getActivities(): Activity[];
    addActivity(activity: Activity): void;
    removeActivity(activity: Activity): void;
    modifyActivity(activity: Activity): void;
}

export const DEFAULT_ONEFOCUS_SETTINGS: OneFocusSettings = {
    getActivities(): Activity[] {
        return [new Activity('No Activities')];
    },
    addActivity(activity: Activity): void {
        return;
    },
    removeActivity(activity: Activity): void {
        return;
    },  
    modifyActivity(activity: Activity): void {
        return;
    }  
}

export class OneFocusSettingsTab extends PluginSettingTab {
    plugin: OneFocus;
    activitiesVault: ActivitiesVault;
    activitiesObserver: ActivitesObserver;

    constructor(app: App, plugin: OneFocus, activitiesVault: ActivitiesVault) {
        super(app, plugin);
        this.plugin = plugin;
        this.activitiesVault = activitiesVault;
        activitiesVault.subscribe(this.activitiesObserver);
    }

    addActivity(activity: Activity): void {
        this.activitiesVault.addActivity(activity);
    }

    removeActivity(activity: Activity): void {
        this.activitiesVault.removeActivity(activity);
    }

    modifyActivity(activity: Activity): void {
        this.activitiesVault.updateActivity(activity);
    }

    display(): void {
        const {containerEl} = this;

        containerEl.empty();

        containerEl.createEl('h2', {text: 'OneFocus Settings'});
        //create a editable text field
        this.plugin.settings.getActivities().forEach((activity: Activity) => {
        new Setting(containerEl)
            .setName('Activity')
            .setDesc('Modify activities to focus on')
            .addText(text => text
                .setValue(activity.displayName)
                .onChange(value => {
                    activity.displayName = value;
                    this.activitiesVault.updateActivity(activity);
                }));
            });

        new Setting(containerEl)
            .setName('Add Activity')
            .setDesc('Add a new activity')
            .addButton(button => button
                .setButtonText('Add')
                .onClick(() => {
                    this.activitiesVault.addActivity(DEFAULT_ONEFOCUS_SETTINGS.getActivities()[0]);
                    this.display();
                }));
    }
}
