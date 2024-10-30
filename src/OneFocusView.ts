import { Activity } from './Activity';
import { OneFocusSettings, ActivityObserver, OneFocusActivityManager } from './OneFocusSettingsTab';

import {
  //Editor,
  ItemView,
  //MarkdownView,
  Notice,
  WorkspaceLeaf,
} from 'obsidian';

export const OneFocusViewType = 'OneFocus-active-activity';

class GetActivitiesAndReOpen implements ActivityObserver {
  activities: Activity[];
  openFunction: () => void;

  constructor( openFunction: () => void) {
    this.activities = [];
    this.openFunction = openFunction;
  }

  update(activities: Activity[]): void {
    this.activities = activities;
    this.openFunction();
  }
}

export class OneFocusView extends ItemView
{
    private OneFocusSettings: OneFocusSettings;
    private getActivitiesAndReOpen: GetActivitiesAndReOpen;

    // None or current activity as Optional
    private currentActivity?: Activity;

    constructor(leaf: WorkspaceLeaf, OneFocusSettings: OneFocusSettings, manager: OneFocusActivityManager, refresh: () => void) {
      super(leaf);
      this.OneFocusSettings = OneFocusSettings;
      this.getActivitiesAndReOpen = new GetActivitiesAndReOpen(refresh);
      manager.Subscribe(this.getActivitiesAndReOpen); // Todo This needs to be done different
    }

    public GetActivityObserver(): ActivityObserver {
      return this.getActivitiesAndReOpen;
    }

    public getViewType(): string {
      return "current-active-activity";
    }

    public getDisplayText(): string {
      return 'OneFocus';
    }

    public getCurrentActivity(): Activity {
      //return No activity if no current activity
      return this.currentActivity || new Activity('No Activity');
    }

    getIcon(): string {
      return 'logo';
    }

    async onOpen() {
      const containerEl = this.containerEl.children[1];
      containerEl.empty();
      containerEl.createEl('h2', { text: 'OneFocus' });
      containerEl.createEl('p', { text: 'This is the OneFocus view' });
      // make buttons for each activity in the activitiesObserver
      const activities = this.OneFocusSettings.activities;
      activities.forEach(activity => {
        const button = containerEl.createEl('button', { text: activity.displayName });
        button.addEventListener('click', () => {
          new Notice(`You clicked on ${activity.displayName}`);
          this.currentActivity = activity;
        });
    });}

    async onClose() {
      // Nothing to do here
    }

    
  }
