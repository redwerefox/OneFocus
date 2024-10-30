import { ActivityVault, Activity, ActivitesObserver } from "../src/ActivityVault";

//mock OneFocusSettings
class OneFocusSettings {
    activities: Activity[] = [];

    getActivities(): Activity[] {
        return this.activities;    
    }
    addActivity(activity: Activity): void {
        this.activities.push(activity);
    }
    removeActivity(activity: Activity): void {
        this.activities = this.activities.filter(a => a !== activity);
    }
    modifyActivity(activity: Activity): void {
        this.activities = this.activities.map(a => a.id === activity.id ? activity : a);
    }
}



describe('ActivityVault', () => {
    let activityVault: ActivityVault;
    let settings: OneFocusSettings;

    let activity1: Activity;
    let activity2: Activity;

    let activityObserver: ActivitesObserver;

    beforeEach(() => {
        settings = new OneFocusSettings();
        activityVault = new ActivityVault(settings);
        activity1 = new Activity('Activity One');
        activity2 = new Activity('Activity Two');

        activity1.id = "1";
        activity2.id = "2";

        activityObserver = new ActivitesObserver();

    });

    //generate complete tests
    test('addActivity', () => {
        activityVault.addActivity(activity1);
        expect(activityVault.activities).toContain(activity1);
        activityVault.addActivity(activity2);
        expect(activityVault.activities).toContain(activity2);
    });

    test('removeActivity', () => {
        activityVault.addActivity(activity1);
        activityVault.removeActivity(activity1);
        expect(activityVault.activities).not.toContain(activity1);
        activityVault.removeActivity(activity2);
        expect(activityVault.activities).not.toContain(activity2);
    });

    test('updateActivity', () => {
        activityVault.addActivity(activity1);
        activity1.displayName = 'Activity One Updated';
        activityVault.updateActivity(activity1);
        expect(activityVault.activities).toContain(activity1);
        expect(activityVault.activities.length).toBe(1); 
    });

    test('subscribe', () => {
        activityVault.subscribe(activityObserver);
        activityVault.addActivity(activity1);
        expect(activityVault.activities).toContain(activity1);
    });

    test('unsubscribe', () => {
        activityVault.subscribe(activityObserver);
        activityVault.unsubscribe(activityObserver);
        expect(activityVault.observers).not.toContain(activity1);
    });


    //test notifyObservers
    test('notifyObservers', () => {
        activityVault.subscribe(activityObserver);
        activityVault.addActivity(activity1);
        activityVault.notifyObservers();
        expect(activityObserver.getActivities()).toContain(activity1);
    });

    //test getActivities
    test('getActivities', () => {
        activityVault.addActivity(activity1);
        activityVault.addActivity(activity2);
        expect(activityVault.activities).toContain(activity1);
        expect(activityVault.activities).toContain(activity2);
    });

    //test generateUUID to generate 1000 unique ids
    test('generateUUID', () => {
        const uuids = new Set<string>();
        for (let i = 0; i < 5000; i++) {
            const uniqueIdActivity = new Activity('Activity ' + i);
            const uuid = uniqueIdActivity.id;
            expect(uuids).not.toContain(uuid);
            uuids.add(uuid);
        }
    });

});