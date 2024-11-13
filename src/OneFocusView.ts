

import { EventEmitter } from 'events';
import { Activity } from './Activity';
import { ActivityObserver } from './OneFocusSettingsTab';
import { TodaysAcitivitiesObserver } from './TodaysActivitiesObserver';
import { ActivitiesObserver } from './ActivitiesObserver';
import { OneFocusDailyTimeTrackerViewer as OneFocusDailyTimeTrackerObserver } from './OneFocusTimeTracker';

import {
  //Editor,
  ItemView,
  //MarkdownView,
  Notice,
  WorkspaceLeaf,
} from 'obsidian';

export const OneFocusViewType = 'OneFocus-active-activity';

export class OneFocusView extends ItemView {
  private currentActivity: Activity;
  
  private currentActivityChangedEmitter = new EventEmitter();
  
  private todaysTimeTrackerViewer: TodaysAcitivitiesObserver;
  public activitiesObserver: ActivitiesObserver;

  constructor(leaf: WorkspaceLeaf, acitivityObserver: ActivitiesObserver, timeTrackerObserver: TodaysAcitivitiesObserver,
     currentActivityChangedCallback: (activity: Activity) => void) {
    super(leaf);

    this.activitiesObserver = acitivityObserver;
    this.todaysTimeTrackerViewer = timeTrackerObserver;


    // TODO: Split view rendering between percentage graph and activity buttons

    this.activitiesObserver.activitiesEventEmitter.on('activities-changed', () => {
      this.onOpen();
    });
    
    this.activitiesObserver.activitiesEventEmitter.once('activities-changed', () => {
      this.currentActivity = this.activitiesObserver.GetActivities()[0] ?? new Activity();
      this.emitCurrentActivityChangedSignal();
      currentActivityChangedCallback(this.currentActivity);
    });

    this.todaysTimeTrackerViewer.onActivityPercentagesReady( () => {
      this.onOpen();
    });

    this.currentActivityChangedEmitter.on('current-activity-changed', currentActivityChangedCallback);

  }

  public GetActivityObserver(): ActivityObserver {
    return this.activitiesObserver;
  }

  public GetTimeTrackerObserver(): OneFocusDailyTimeTrackerObserver {
    return this.todaysTimeTrackerViewer;
  }

  public getViewType(): string {
    return OneFocusViewType;
  }

  public getDisplayText(): string {
    return 'OneFocus';
  }

  public getCurrentActivityDisplay(): string {
    //return No activity if no current activity
    return this.currentActivity?.displayName ?? 'No Activities loaded';
  }

  public getCurrentActivity(): Activity {
    return this.currentActivity;
  }

  getIcon(): string {
    return 'calendar-clock';
  }

  public RefreshUI () : void {
    this.onOpen();
  }

  private injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .stacked-progress-bar {
          display: flex;
          width: 100%;
          height: 30px;
          border: 1px solid #ccc;
          border-radius: 5px;
          overflow: hidden;
          margin-bottom: 15px;
        }
    
        .progress-segment {
          height: 100%;
        }
    
        .progress-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
    
        .legend-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }
    
        .color-box {
          width: 15px;
          height: 15px;
          border: 1px solid #ccc;
        }
      `;
    document.head.appendChild(style);
  }

  async onClose() {

  }

  private emitCurrentActivityChangedSignal() {
    this.currentActivityChangedEmitter.emit('current-activity-changed', this.currentActivity);
  }

  async onOpen() {

    this.injectStyles();

    const containerEl = this.containerEl.children[1];
    containerEl.empty();
    containerEl.createEl('h2', { text: 'OneFocus' });
    containerEl.createEl('p', { text: 'Currently tracked activity:' });

    const currentActivityButton = containerEl.createEl('button', { text: this.getCurrentActivityDisplay() });
    currentActivityButton.style.width = '99%';           // Make the button take up most of the view width
    currentActivityButton.style.padding = '15px 0';      // Increase padding for a larger button
    currentActivityButton.style.fontSize = '1.2em';      // Increase font size for readability
    currentActivityButton.style.borderRadius = '8px';    // Rounded corners
    

    //make buttons big and fill the view space
    currentActivityButton.style.flex = '1';
    currentActivityButton.style.columnFill = 'balance';
    if (this.currentActivity) {
      currentActivityButton.style.backgroundColor = this.currentActivity.color;
      currentActivityButton.style.color =  'black';
    }
    else {
      currentActivityButton.style.backgroundColor = 'grey';
      currentActivityButton.style.color = 'white';
    }

    containerEl.createEl('p', { text: 'What are you focusing on?:' });
    // make buttons for each activity in the activitiesObserver, color them in activity color
    const activities = this.activitiesObserver.GetActivities();
    activities.forEach(activity => {
      const button = containerEl.createEl('button', { text: activity.displayName });
      button.addEventListener('click', () => {
        this.currentActivity = activity;
        this.emitCurrentActivityChangedSignal();
        this.onOpen();
      })

      button.style.width = '99%';           // Make the button take up most of the view width
      button.style.padding = '15px 0';      // Increase padding for a larger button
      button.style.fontSize = '1.2em';      // Increase font size for readability
      button.style.borderRadius = '8px';    // Rounded corners

      //make buttons big and fill the view space
      button.style.flex = '1';
      button.style.columnFill = 'balance';
      button.style.backgroundColor = activity.color;
      //make button text dark grey
      button.style.color = 'black';

      //make a bargraph

    });

    const activityPercentages = this.todaysTimeTrackerViewer.GetActivityPercentages();
    new Notice(`Activity Percentages size: ${activityPercentages.length}`);

    containerEl.createEl('p', { text: 'Today:' });
    // Create the progress bar container
    const progressBarContainer = containerEl.createDiv({ cls: 'stacked-progress-bar' });

    // Iterate over activity percentages and create segments
    activityPercentages.forEach(activityPercentage => {
      const activity = activityPercentage.activity;
      const percentage = activityPercentage.percentage;

      // Create segment
      const segment = progressBarContainer.createDiv({ cls: 'progress-segment' });
      segment.style.width = `${percentage}%`;
      segment.style.backgroundColor = activity.color;
      segment.setAttr('title', `${activity.displayName}: ${percentage.toFixed(1)}%`);
    });

    // Add labels or legend if necessary
    const legendContainer = containerEl.createDiv({ cls: 'progress-legend' });
    activityPercentages.forEach(activityPercentage => {
      const activity = activityPercentage.activity;
      const legendItem = legendContainer.createDiv({ cls: 'legend-item' });
      const colorBox = legendItem.createDiv({ cls: 'color-box' });
      colorBox.style.backgroundColor = activity.color ?? '#cccccc';
      legendItem.createSpan({ text: `${activity.displayName} (${activityPercentage.percentage.toFixed(1)}%)` });
    });
  }

}
