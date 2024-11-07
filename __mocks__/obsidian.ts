
// __mocks__/obsidian.ts
export const Workspace = {
    getLeavesOfType: jest.fn(),
    revealLeaf: jest.fn(),
};

export const Plugin = {
    settings: {
        getActivities: jest.fn(),
    },
};

export const Vault = {
    addActivity: jest.fn(),
};

export class PluginSettingTab {

    app: any;
    plugin: any;

    constructor(app: any, plugin: any) {
        this.app = app;
        this.plugin = plugin;
    }
}

export class PluginMock {
    settings: any;

    constructor() {
        this.settings = {
            activities: [],
        };
    }

    getSettings() {
        return this.settings;
    }

    getActivities() {
        return this.settings.activities;
    }

}   
