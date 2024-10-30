import { App,  PluginSettingTab, Setting } from 'obsidian';
import OneFocus from '../main';
import {Activity} from './Activity';


export interface OneFocusSettings {
    activities: Activity[];
}

export interface ActivityObserver {
    update(activities: Activity[]) : void;
}

export interface ActivitySubject {
    subscribe(observer: ActivityObserver): void;
    detach(observer: ActivityObserver): void;
    notify(activities: Activity[]): void;
}

class ActivitySubjectImpl implements ActivitySubject {
    private observers: ActivityObserver[] = [];

    subscribe(observer: ActivityObserver): void {
        //add observer if not already added
        if (!this.observers.includes(observer))
        {
            this.observers.push(observer);
        }
    }

    detach(observer: ActivityObserver): void {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    notify(activities: Activity[]): void {
        this.observers.forEach(observer => observer.update(activities));
    }
}

export class OneFocusActivityManager {

    settings: OneFocusSettings;
    activitySubject: ActivitySubject;

    constructor(settings: OneFocusSettings) {
        //refer this settings to the settings passed in
        this.settings = settings;
        this.activitySubject = new ActivitySubjectImpl();
    }

    public Subscribe(observer: ActivityObserver): void {
        this.activitySubject.subscribe(observer);
    }

    public Unsubscribe(observer: ActivityObserver): void {
        this.activitySubject.detach(observer);
    }

    GetSettings(): OneFocusSettings {
        return this.settings;
    }

    addActivity(activity: Activity): OneFocusActivityManager { 
        this.settings.activities.push(activity);
        this.activitySubject.notify(this.settings.activities);
        return this;
    }

    removeActivity(activity: Activity): OneFocusActivityManager {
        this.settings.activities = this.settings.activities.filter((a: Activity) => a.id !== activity.id);
        this.activitySubject.notify(this.settings.activities);
        return this;
    }

    modifyActivity(activity: Activity): OneFocusActivityManager {
        this.settings.activities = this.settings.activities.map((a: Activity) => {
            if (a.id === activity.id) {
                a.displayName = activity.displayName;
                this.activitySubject.notify(this.settings.activities);
            }
            return a;
        });
        return this;
    }

    getActivities(): Activity[] {
        return this.settings.activities; 
    }
}

export const DEFAULT_ONEFOCUS_SETTINGS: Partial<OneFocusSettings> = {
    activities: [new Activity('No Activity')],
};

export class OneFocusSettingsTab extends PluginSettingTab {
    plugin: OneFocus;
    settings: OneFocusSettings;
    manager: OneFocusActivityManager;

    constructor(app: App, plugin: OneFocus, manager: OneFocusActivityManager) {
        super(app, plugin);
        this.plugin = plugin;
        this.manager = manager;
        this.settings = manager.GetSettings();
    }

    addActivity(activity: Activity): void {
        this.manager.addActivity(activity);
    }

    removeActivity(activity: Activity): void {
        this.manager.removeActivity(activity);
    }

    modifyActivity(activity: Activity): void {
        this.manager.modifyActivity(activity);
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
                    this.modifyActivity(activity);
                    this.plugin.saveData(this.plugin.settings);
                }));
            });

        new Setting(containerEl)
            .setName('Add Activity')
            .setDesc('Add a new activity')
            .addButton(button => button
                .setButtonText('Add')
                .onClick(() => {
                    this.addActivity(new Activity('New Activity'));
                    this.display();
                    this.plugin.saveData(this.plugin.settings);
                }));
    }
}
