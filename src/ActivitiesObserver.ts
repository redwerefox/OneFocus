
import { EventEmitter } from 'events';
import { Activity } from './Activity';
import { ActivityObserver } from './OneFocusSettingsTab';

export class ActivitiesObserver implements ActivityObserver {
  private activities: Activity[] = [];
  activitiesEventEmitter = new EventEmitter();
  
  update(activities: Activity[]): void {
    this.activities = activities;
    this.activitiesEventEmitter.emit('activities-changed', activities);
  }

  GetActivities(): Activity[] {
    return this.activities;
  }
}