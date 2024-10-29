import {  Editor, MarkdownView, Plugin } from 'obsidian';
import { Activity, ActivitiesVault } from 'src/ActivityVault';
import { OneFocusSettingsTab, OneFocusSettings, DEFAULT_ONEFOCUS_SETTINGS } from 'src/OneFocusSettingsTab';
import { ActivitiesModal } from 'src/ActivitiesModal';
// Remember to rename these classes and interfaces! TODO


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

export default class OneFocus extends Plugin {
	settings: OneFocusSettings;

	currentActivity: Activity
	activitiesVault: ActivitiesVault
	index : 0;

	
	async onload() {
		await this.loadSettings();
		this.activitiesVault = new ActivitiesVault(this.settings);
		this.currentActivity = this.settings.getActivities()[0];

		this.addCommand({
			id: 'add-activity',
			name: 'OneFocus: Add Activity',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const activity = new Activity('New Activity'+ this.index);
				this.settings.addActivity(activity);
			}

		});

		this.addCommand({
			id: 'remove-activity',
			name: 'OneFocus: Remove Activity',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const activity = new Activity('New Activity' + (this.index - 1));
				this.settings.removeActivity(activity);
			}
		});

		this.addCommand({
			id: 'see-activities',
			name: 'OneFocus: See Activities',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				new ActivitiesModal(this.app, this.settings.getActivities()).open();
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
		
		this.addSettingTab(new OneFocusSettingsTab(this.app, this, this.activitiesVault));

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
		this.settings = Object.assign({}, DEFAULT_ONEFOCUS_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
