import { Plugin, WorkspaceLeaf } from 'obsidian';
import { OneFocusSettingsTab, DEFAULT_ONEFOCUS_SETTINGS, OneFocusSettings, OneFocusActivityManager } from 'src/OneFocusSettingsTab';
import { OneFocusView, OneFocusViewType } from 'src/OneFocusView';
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
			if (leaf) {
				await leaf.setViewState({ type: OneFocusViewType, active: true });
			}
		}

		// "Reveal" the leaf in case it is in a collapsed sidebar
		if (leaf)
			workspace.revealLeaf(leaf);
	}

	private GetCurrentActivityName() : string {
		const existing = this.app.workspace.getLeavesOfType(OneFocusViewType);
		if (existing.length) {
			const view = existing[0].view as OneFocusView;
			return view.getCurrentActivity().displayName;
		}
		else 
			return "Issue with loading OneFocus view";
	}

	
	refreshUi() {
		this.statusBarItemEl.setText(this.GetCurrentActivityName());
		this.activateView();
	}
	
	async onload() {
		await this.loadSettings();
		this.statusBarItemEl = this.addStatusBarItem();
		this.manager = new OneFocusActivityManager(this.settings);
		

		this.registerView(
			OneFocusViewType,
			(leaf) => new OneFocusView(leaf, this.settings, this.manager, this.refreshUi.bind(this)),
		);


		this.addRibbonIcon('dice', 'OneFocus', () => { this.activateView(); });

		this.addCommand({
			id: 'toggle-onefocus-view',
			name: 'Toggle OneFocus View',
			callback: this.activateView.bind(this),
		});

		//todo: consider a ribbon icon

		// This creates an icon in the left ribbon.
		/*const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});*/
		// Perform additional things with the ribbon
		//ribbonIconEl.addClass('my-plugin-ribbon-class');

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

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_ONEFOCUS_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
