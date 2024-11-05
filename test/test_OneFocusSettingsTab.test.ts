

import { Activity } from "../src/Activity";
import { OneFocusSettings, OneFocusSettingsTab, OneFocusActivityManager } from "../src/OneFocusSettingsTab";

// Mock the Obsidian module
jest.mock('obsidian');

class OneFocusSettingsMock implements OneFocusSettings {
    activities: Activity[] = [];

    addActivity(activity: Activity): void {
        this.activities.push(activity);
    }

    removeActivity(activity: Activity): void {
        this.activities = this.activities.filter((a: Activity) => a.id !== activity.id);
    }

    modifyActivity(activity: Activity): void {
        this.activities = this.activities.map((a: Activity) => {
            if (a.id === activity.id) {
                a.displayName = activity.displayName;
            }
            return a;
        });
    }

    getActivities(): Activity[] {
        return this.activities;
    }
}

describe('OneFocusSettingsTab', () => {

    let manager : OneFocusActivityManager;
    let settings : OneFocusSettingsMock;
    let plugin : any;
    let app : any;


    beforeEach(() => {
        settings = new OneFocusSettingsMock();
        manager = new OneFocusActivityManager(settings);

    });

    afterEach(() => {
        settings.activities = [];
    });

    //test manager
    test('addActivity', () => {
        manager.addActivity(new Activity());
        expect(settings.activities.length).toBe(1);
    });

    test('removeActivity', () => {
        manager.addActivity(new Activity());
        manager.removeActivity(settings.activities[0]);
        expect(settings.activities.length).toBe(0);
    });

    test('modifyActivity', () => {
        const activity = new Activity();
        manager.addActivity(activity);
        activity.setName('Test Name');
        manager.modifyActivity(activity);
        expect(settings.activities[0].displayName).toBe('Test Name');
    });

    test('getActivities', () => {
        const activity = new Activity();
        manager.addActivity(activity);
        expect(manager.getActivities().length).toBe(1);
    });

    //test OneFocusSettingsTab

    test('addActivity', () => {
        const tab = new OneFocusSettingsTab(app, plugin, manager);
        tab.addActivity(new Activity());
        expect(settings.activities.length).toBe(1);
    });

    test('removeActivity', () => {
        const tab = new OneFocusSettingsTab(app, plugin, manager);
        tab.removeActivity(settings.activities[0]);
        expect(settings.activities.length).toBe(0);
    });

    test('modifyActivity', () => {
        const tab = new OneFocusSettingsTab(app, plugin, manager);
        const activity = new Activity();
        tab.addActivity(activity);
        activity.setName('Test Name');
        tab.modifyActivity(activity);
        expect(settings.activities[0].displayName).toBe('Test Name');
    });

    test('getActivities', () => {
        const tab = new OneFocusSettingsTab(app, plugin, manager);
        const activity = new Activity();
        tab.addActivity(activity);
        expect(tab.settings.activities.length).toBe(1);
    });

});

