import {  Editor, MarkdownView, Plugin } from 'obsidian';
import { ActivitiesVault, Activity } from 'src/ActivityVault';
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

export class OneFocus extends Plugin {
	settings: OneFocusSettings;

	activitiesVault: ActivitiesVault;

	activityModal: ActivitiesModal;

	currentActivity: Activity

	index: number;

	
	async onload() {
		await this.loadSettings();

		this.index = 1;
		this.activitiesVault = new ActivitiesVault();
		this.currentActivity = this.activitiesVault.defaultActivity;

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
		this.addSettingTab(new OneFocusSettingsTab(this.app, this));

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
