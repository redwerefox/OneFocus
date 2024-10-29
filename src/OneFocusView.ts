
import { ActivitesObserver } from 'src/ActivityVault';

import {
  //Editor,
  ItemView,
  //MarkdownView,
  Notice,
  WorkspaceLeaf,
} from 'obsidian';

export default class OneFocusView extends ItemView
{
    
    private activitiesObserver: ActivitesObserver;

    constructor(leaf: WorkspaceLeaf, settings: ActivitesObserver) {
      super(leaf);
      this.activitiesObserver = settings;
    }

    public getViewType(): string {
      return "current-active-activity";
    }

    public getDisplayText(): string {
      return 'OneFocus';
    }

    
    getIcon(): string {
      return 'logo';
    }

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
    });}
  }
