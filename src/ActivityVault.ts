import { OneFocusSettings } from './OneFocusSettingsTab';

export interface ActivitiesObserverInterface {
    update(activities: Activity[]): void;
}

export class ActivitesObserver implements ActivitiesObserverInterface {
    activities: Activity[] = [];
  
  
    update(activities: Activity[]): void {
      this.activities = activities;
    }
  
    getActivities(): Activity[] { return this.activities; }
  }

export class Activity {
    id: string;
    displayName: string;

    constructor(displayName: string) {
        this.id = this.generateUUID();
        this.displayName = displayName;
    }

    // test todo
    private generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

interface OneFocusObservable {
    subscribe(observer: ActivitiesObserverInterface): void;
    unsubscribe(observer: ActivitiesObserverInterface): void;
    addActivity(activity: Activity): void;
    removeActivity(activity: Activity): void;
    updateActivity(activity: Activity): void;
    notifyObservers(): void;
}

export class ActivitiesVault implements OneFocusObservable {
    activities: Activity[] = []; 
    observers: ActivitiesObserverInterface[] = [];
    defaultActivity: Activity;

    constructor(settings: OneFocusSettings) {
        this.defaultActivity = settings.getActivities()[0];
        this.activities = settings.getActivities();
    }

    subscribe(observer: ActivitiesObserverInterface): void {
        this.observers.push(observer);
    }

    unsubscribe(observer: ActivitiesObserverInterface): void {
        this.observers = this.observers.filter(o => o !== observer);
    }

    addActivity(activity: Activity): void {
        this.activities.push(activity);
    }

    removeActivity(activity: Activity): void {
        this.activities = this.activities.filter(a => a.id !== activity.id);
    }

    updateActivity(activity: Activity): void {
        this.activities = this.activities.map(a => a.id === activity.id ? activity : a);
    }

    notifyObservers(): void {
        this.observers.forEach(o => o.update(this.activities));
    }
}