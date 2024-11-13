
import { EventEmitter } from 'events';
import { Activity, ActivityTimeView } from './Activity';
import { OneFocusDailyTimeTrackerViewer as OneFocusDailyTimeTrackerObserver } from './OneFocusTimeTracker';
import { OneFocusActivityManager } from './OneFocusSettingsTab';

export class ActivityPercentage {
    activity: Activity;
    percentage: number;
}

export class TodaysAcitivitiesObserver implements OneFocusDailyTimeTrackerObserver {

  private activityPercentages: ActivityPercentage[] = [];
  private activityPercentagesReady = new EventEmitter();
  private manager: OneFocusActivityManager;

  constructor(manager: OneFocusActivityManager) {
    this.manager = manager;
  }

  public onActivityPercentagesReady(callback: () => void) {
    this.activityPercentagesReady.on('activity-percentages-ready', callback);
  }

  processActivityTimeView(activityTimeViews: ActivityTimeView[]): void {
    this.activityPercentages = this.calculateActivityPercentages(activityTimeViews);
    this.activityPercentagesReady.emit('activity-percentages-ready');
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
    const activityTimeMap = new Map< string, number>();

    activityTimeViews.forEach((activityTimeView) => {
      const activityId = activityTimeView.activityId;

      const thisStartDate = activityTimeView.startTime;
      const nextStartDate = activityTimeView.endTime ?? new Date();

      const duration = this.seconds(thisStartDate, nextStartDate);
      if (activityTimeMap.has(activityId)) {
        activityTimeMap.set(activityId, activityTimeMap.get(activityId) ?? 0 + duration);
      } else {
        activityTimeMap.set(activityId, duration);
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
      activityPercentage.activity.displayName = this.manager.GetActivityNameById(key);
      activityPercentage.activity.color = this.manager.GetColorFromActivityId(key);
      activityPercentage.activity.id = key;
      activityPercentage.percentage = value;
      activityPercentages.push(activityPercentage);
    });

    return activityPercentages;
  }
}