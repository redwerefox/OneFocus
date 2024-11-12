import { Plugin, WorkspaceLeaf } from 'obsidian';
import { OneFocusSettingsTab, DEFAULT_ONEFOCUS_SETTINGS, OneFocusSettings, OneFocusActivityManager } from 'src/OneFocusSettingsTab';
import { OneFocusView, OneFocusViewType } from 'src/OneFocusView';
import { OneFocusDailyTimeTracker } from 'src/OneFocusTimeTracker';
import { Activity } from 'src/Activity';
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
	manager: OneFocusActivityManager;
	timeTracker: OneFocusDailyTimeTracker;
	view : OneFocusView | undefined;
	statusBarItemEl: HTMLElement;

	async activateView() {

		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(OneFocusViewType);

		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0];
		} else {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar for it
			leaf = workspace.getRightLeaf(false);
			await leaf?.setViewState({ type: OneFocusViewType, active: true });
		}

		// "Reveal" the leaf in case it is in a collapsed sidebar
		if (leaf)
		{
			workspace.revealLeaf(leaf);
		}
	}

	private GetCurrentActivity(): Activity | undefined {
		const existing = this.app.workspace.getLeavesOfType(OneFocusViewType);
		if (existing.length) {
			const view = existing[0].view as OneFocusView;
			return view.getCurrentActivity();
		}
		else
			return undefined;
	}


	OnActivityChange() {
		this.statusBarItemEl.setText(this.GetCurrentActivity()?.displayName ?? 'Issue loading activity');//this.activateView();
		this.timeTracker.onCurrentActivityChanged(this.GetCurrentActivity());
		this.view?.RefreshUI();
	}

	async onload() {
		await this.loadSettings();
		this.statusBarItemEl = this.addStatusBarItem();
		this.manager = new OneFocusActivityManager(this.settings);
		this.timeTracker = new OneFocusDailyTimeTracker(this.app);

		// make event on activity change to update the current activity in Time tracker

		this.registerView(
			OneFocusViewType,
			(leaf) => this.view = new OneFocusView(leaf, this.settings, this.manager)
		);

		// get OneFocusView
		if(this.view) {
			this.timeTracker.Subscribe(this.view.GetTimeTrackerObserver());
			this.manager.Subscribe(this.view.GetActivityObserver());
			this.view.onSignalCurrentActivityChanged(this.OnActivityChange.bind(this));
		}	


		this.addRibbonIcon('calendar-clock', 'OneFocus', () => { this.activateView(); });

		this.addCommand({
			id: 'toggle-onefocus-view',
			name: 'Toggle OneFocus View',
			callback: this.activateView.bind(this),
		});

		// This adds a settings tab so the user can configure various aspects of the plugin

		this.addSettingTab(new OneFocusSettingsTab(this.app, this, this.manager));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
		
	}


	onunload() {

		//Remove view
		const leaves = this.app.workspace.getLeavesOfType(OneFocusViewType);
		for (const leaf of leaves) {
			leaf.detach();
		}
		this.manager.ClearActivities();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_ONEFOCUS_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

}