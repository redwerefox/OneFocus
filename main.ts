import { App, Editor, MarkdownView, Modal, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { ActivitiesVault, Activity } from 'src/ActivitiesVault';
import { ActivitiesObserverInterface } from 'src/ActivitiesObserver';

// Remember to rename these classes and interfaces! TODO

interface OneFocusSettings {
	mySetting: string;
}

const ONEFOCUS_SETTINGS: OneFocusSettings = {
	mySetting: 'default'
}

class OneFocusActivityLogUpdater implements ActivitiesObserverInterface {
	update(activities: Activity[]): void {
		console.log(activities);
	}
}

class ActivitiesModal extends Modal {
	
	activities: Activity[];


	constructor(app: App, activities: Activity[]) {
		super(app);
		this.activities = activities;
	}

	makeActivityList(): HTMLElement {
		const listEl = document.createElement('ul');
		listEl.addClass('activity-list');

		this.activities.forEach(activity => {
			const itemEl = document.createElement('li');
			itemEl.addClass('activity-item');
			itemEl.setText(activity.displayName);
			listEl.appendChild(itemEl);
		});

		return listEl;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.appendChild(this.makeActivityList());
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

export class CurrentActivityId {
	activityId: string;
	
	constructor(activityId: string) {
		this.activityId = activityId;
	}

	getActivity(): string {
		return this.activityId;
	}

	setActivity(activityId: string): void {
		this.activityId = activityId;
	}
}

class OneFocusSettingTab extends PluginSettingTab {
	plugin: OneFocus;

	constructor(app: App, plugin: OneFocus) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}

export default class OneFocus extends Plugin {
	settings: OneFocusSettings;

	activitiesVault: ActivitiesVault;
	oneFocusActivityLogUpdater: OneFocusActivityLogUpdater;

	activityModal: ActivitiesModal;

	currentActivity: Activity

	index: number;

	
	async onload() {
		await this.loadSettings();

		this.index = 1;
		this.activitiesVault = new ActivitiesVault();
		this.currentActivity = this.activitiesVault.defaultActivity;
		this.oneFocusActivityLogUpdater = new OneFocusActivityLogUpdater();
		this.activitiesVault.subscribe(this.oneFocusActivityLogUpdater);

		//Commands

		this.addCommand({
			id: 'add-activity',
			name: 'OneFocus: Add Activity',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const activity = new Activity('New Activity'+ this.index);
				this.index += 1;
				this.activitiesVault.addActivity(activity);
				this.activitiesVault.notifyObservers();
			}

		});

		this.addCommand({
			id: 'remove-activity',
			name: 'OneFocus: Remove Activity',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const activity = new Activity('New Activity' + (this.index - 1));
				this.index -= 1;
				this.activitiesVault.removeActivity(activity);
				this.activitiesVault.notifyObservers();
			}
		});

		this.addCommand({
			id: 'see-activities',
			name: 'OneFocus: See Activities',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				new ActivitiesModal(this.app, this.activitiesVault.activities).open();
				//this.currentActivity = activity;
			}
		});

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText(this.currentActivity.displayName); 

		//todo: consider a ribbon icon

		// This creates an icon in the left ribbon.
		/*const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});*/
		// Perform additional things with the ribbon
		//ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new OneFocusSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, ONEFOCUS_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
