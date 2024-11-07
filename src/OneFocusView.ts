import { Activity, ActivityTimeView} from './Activity';
import { OneFocusSettings, ActivityObserver, OneFocusActivityManager } from './OneFocusSettingsTab';
import { OneFocusDailyTimeTrackerViewer } from './OneFocusTimeTracker';

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

class TodaysTimeTrackerViewer implements OneFocusDailyTimeTrackerViewer {

  processActivityTimeView(activityTimeViews : ActivityTimeView[]): void {
    this.calculateActivityPercentages(activityTimeViews);
  }

  seconds ( startDateTime : Date, endDateTime : Date) : number {
    return (endDateTime.getTime() - startDateTime.getTime()) / 1000; }

  // calculate percentages of time spent on each activity
  // return an array of ActivityPercentage
  calculateActivityPercentages(activityTimeViews : ActivityTimeView[] ): ActivityPercentage[] {
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

class GetActivitiesAndReOpen implements ActivityObserver {
  refreshFunctions: ((activities: Activity[]) => void)[];

  constructor() {
    this.refreshFunctions = [];
  }

  appendCallbacks(openFunction: () => void): void {
    this.refreshFunctions.push(openFunction);
  }

  update(activities: Activity[]): void {
    this.refreshFunctions.forEach(f => f(activities));
  }
}

export class OneFocusView extends ItemView {
  private OneFocusSettings: OneFocusSettings;
  private getActivitiesAndReOpen: GetActivitiesAndReOpen;
  private timeTracker: OneFocusDailyTimeTrackerViewer = new TodaysTimeTrackerViewer();

  // None or current activity as Optional
  private currentActivity?: Activity;

  constructor(leaf: WorkspaceLeaf, OneFocusSettings: OneFocusSettings, manager: OneFocusActivityManager, refresh: () => void) {
    super(leaf);
    this.OneFocusSettings = OneFocusSettings;
    this.getActivitiesAndReOpen = new GetActivitiesAndReOpen();
    this.getActivitiesAndReOpen.appendCallbacks(refresh);
    this.getActivitiesAndReOpen.appendCallbacks(() => this.onOpen());
    manager.Subscribe(this.getActivitiesAndReOpen); // Todo This needs to be done different

    //setUp Tick per minute
    setInterval(() => {
      this.tickPeriodic();
    }, 60000);
  }

  // check life performance
  async tickPeriodic() {
    this.onOpen();
  }

  public GetActivityObserver(): ActivityObserver {
    return this.getActivitiesAndReOpen;
  }

  public GetTimeTrackerViewer(): OneFocusDailyTimeTrackerViewer {
    return this.timeTracker;
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
    return 'logo';
  }

  async onOpen() {
    const containerEl = this.containerEl.children[1];
    containerEl.empty();
    containerEl.createEl('h2', { text: 'OneFocus' });
    containerEl.createEl('p', { text: 'Currently tracked activity:' });

    containerEl.createEl('button', { text: this.getCurrentActivityDisplay() });  

    containerEl.createEl('p', { text: 'What are you focusing on?:' });
    // make buttons for each activity in the activitiesObserver, color them in activity color
    const activities = this.OneFocusSettings.activities;
    activities.forEach(activity => {
      const button = containerEl.createEl('button', { text: activity.displayName });
      button.addEventListener('click', () => {
        new Notice(`You clicked on ${activity.displayName}`);
        this.currentActivity = activity;
        this.getActivitiesAndReOpen.update(activities);
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
      button.style.webkitTextStrokeColor = 'black';

      //make a bargraph

    });

    containerEl.createEl('p', { text: 'Today:' });
    // make a bargraph of time spent on each activity
    


  }

  async onClose() {
    // Nothing to do here
  }


}
