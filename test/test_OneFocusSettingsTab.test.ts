

//import { Activity } from "../src/Activity";
//import { OneFocusSettings, OneFocusSettingsTab } from "../src/OneFocusSettingsTab";

// Mock the Obsidian module
//jest.mock('obsidian');
/*
describe('OneFocusSettingsTab', () => {

    let settings: OneFocusSettings;

    let oneFocusSettingsTab: OneFocusSettingsTab;
    let app: any;
    let plugin: any;
    

    beforeEach(() => {
        app = {
            workspace: {
                getLeavesOfType: jest.fn(),
                revealLeaf: jest.fn(),
            }
        };
 
        settings = new OneFocusSettings();

        plugin = {
            settings: settings
        };

        oneFocusSettingsTab = new OneFocusSettingsTab(app, plugin);
    });

    //generate complete tests
    test('addActivity', () => {
        const activity1 = new Activity('Activity One');
        oneFocusSettingsTab.addActivity(activity1);
        expect(oneFocusSettingsTab.settings.getActivities()).toContain(activity1);
    });

    test('removeActivity', () => {
        const activity1 = new Activity('Activity One');
        oneFocusSettingsTab.addActivity(activity1);
        oneFocusSettingsTab.removeActivity(activity1);
        expect(oneFocusSettingsTab.settings.getActivities()).not.toContain(activity1);
    });

    test('modifyActivity', () => {
        const activity1 = new Activity('Activity One');
        oneFocusSettingsTab.addActivity(activity1);
        activity1.displayName = 'Activity One Modified';
        oneFocusSettingsTab.modifyActivity(activity1);
        expect(oneFocusSettingsTab.settings.getActivities()).toContain(activity1);
    });

    test('constructor', () => {
        expect(oneFocusSettingsTab.plugin).toBe(plugin);
        expect(oneFocusSettingsTab.settings).toBe(settings);
    });

});

*/