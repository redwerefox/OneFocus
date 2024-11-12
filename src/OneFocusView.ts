

import { EventEmitter } from 'events';
import { Activity, ActivityTimeView } from './Activity';
import { ActivityObserver } from './OneFocusSettingsTab';
import { OneFocusDailyTimeTrackerViewer as OneFocusDailyTimeTrackerObserver } from './OneFocusTimeTracker';

import {
  //Editor,
  ItemView,
  //MarkdownView,
  Notice,
  WorkspaceLeaf,
} from 'obsidian';

export const OneFocusViewType = 'OneFocus-active-activity';

class ActivityPercentage {
  activity: Activity;
  percentage: number;
}

class TodaysAcitivitiesObserver implements OneFocusDailyTimeTrackerObserver {

  activityPercentages: ActivityPercentage[] = [];

  processActivityTimeView(activityTimeViews: ActivityTimeView[]): void {
    this.activityPercentages = this.calculateActivityPercentages(activityTimeViews);
  }

  public GetActivityPercentages(): ActivityPercentage[] {
    return this.activityPercentages;
  }

  seconds(startDateTime: Date, endDateTime: Date): number {
    return (endDateTime.getTime() - startDateTime.getTime()) / 1000;
  }

  // calculate percentages of time spent on each activity
  // return an array of ActivityPercentage
  calculateActivityPercentages(activityTimeViews: ActivityTimeView[]): ActivityPercentage[] {
    const activityPercentages: ActivityPercentage[] = [];
    const activityTimeMap = new Map<string, number>();

    activityTimeViews.forEach((activityTimeView) => {
      const activityName = activityTimeView.activityName;

      const thisStartDate = activityTimeView.startTime;
      const nextStartDate = activityTimeView.endTime ?? new Date();

      const duration = this.seconds(thisStartDate, nextStartDate);
      if (activityTimeMap.has(activityName)) {
        activityTimeMap.set(activityName, activityTimeMap.get(activityName) ?? 0 + duration);
      } else {
        activityTimeMap.set(activityName, duration);
      }

    });

    //sum all durations and make percentages
    const totalDuration = Array.from(activityTimeMap.values()).reduce((a, b) => a + b, 0);
    Array.from(activityTimeMap.keys()).forEach((key) => {
      const value = activityTimeMap.get(key) ?? 0;
      activityTimeMap.set(key, value / totalDuration * 100);
    });

    activityTimeMap.forEach((value, key) => {
      const activityPercentage = new ActivityPercentage();
      activityPercentage.activity = new Activity();
      activityPercentage.activity.displayName = key;
      activityPercentage.percentage = value;
      activityPercentages.push(activityPercentage);
    });

    return activityPercentages;
  }
}

class ActivitiesViewObserver implements ActivityObserver {

  activities: Activity[] = [];
  activitiesEventEmitter = new EventEmitter();
  
  onSignalActivitiesChanged(callback: () => void) {
    this.activitiesEventEmitter.on('activities-changed', callback);
  }

  update(activities: Activity[]): void {
    this.activities = activities;
    this.activitiesEventEmitter.emit('activities-changed', this.activities);
  }
}

export class OneFocusView extends ItemView {
  private currentActivity?: Activity;
  private currentActivityChangedEmitter = new EventEmitter();
  
  private todaysTimeTrackerViewer: TodaysAcitivitiesObserver = new TodaysAcitivitiesObserver();
  public activitiesObserver: ActivitiesViewObserver = new ActivitiesViewObserver();

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    
    this.activitiesObserver.onSignalActivitiesChanged(() => {
      this.onOpen();
    });

    this.currentActivity = this.activitiesObserver.activities[0];
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

  public getCurrentActivity(): Activity | undefined {
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

  onSignalCurrentActivityChanged(callback: (activity: Activity) => void) {
    this.currentActivityChangedEmitter.on('current-activity-changed', callback);
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
    const activities = this.activitiesObserver.activities;
    activities.forEach(activity => {
      const button = containerEl.createEl('button', { text: activity.displayName });
      button.addEventListener('click', () => {
        this.currentActivity = activity;
        this.emitCurrentActivityChangedSignal();
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
      segment.style.backgroundColor = activity.color ?? '#cccccc';
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
