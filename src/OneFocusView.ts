
import OneFocusSettings from "../main"; //these are weird todo
import { Activity } from 'src/ActivitiesVault';
import { ActivitiesObserverInterface } from 'src/ActivitiesObserver';

import {
  Editor,
  ItemView,
  MarkdownView,
  Notice,
  WorkspaceLeaf,
} from 'obsidian';

import  CurrentActivityId  from '../main';


class ActivitesObserver implements ActivitiesObserverInterface {
  activities: Activity[] = [];


  update(activities: Activity[]): void {
    this.activities = activities;
  }

  getActivities(): Activity[] { return this.activities; }
}
  

export default class OneFocusView extends ItemView
{
    
    private readonly settings: OneFocusSettings;
    private activitiesObserver: ActivitesObserver;

    constructor(leaf: WorkspaceLeaf, settings: OneFocusSettings) {
      super(leaf);
      this.settings = settings;
    }

    public getViewType(): string {
      return "current-active-activity";
    }

    public getDisplayText(): string {
      return 'OneFocus';
    }

    //todo Icon
    /*getIcon(): string {
      return 'calendar';
    }*/

    public load(): void {
      super.load();
      this.draw();
    }

    // ? understand this syntax todod
    private readonly draw = (): void => {
      const { containerEl } = this;
      containerEl.empty();
      containerEl.createEl('h2', { text: 'OneFocus' });
      containerEl.createEl('p', { text: 'This is the OneFocus view' });
      // make buttons for each activity in the activitiesObserver
      const activities = this.activitiesObserver.getActivities();
      activities.forEach(activity => {
        const button = containerEl.createEl('button', { text: activity.displayName });
        button.addEventListener('click', () => {
          new Notice(`You clicked on ${activity.displayName}`);
        });
    }

}