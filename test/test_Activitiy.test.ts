import { Activity  } from "../src/Activity";


describe('ActivityVault', () => {


    let activity1: Activity;
    let activity2: Activity;

    beforeEach(() => {

        activity1 = new Activity('Activity One');
        activity2 = new Activity('Activity Two');

        activity1.id = "1";
        activity2.id = "2";
    });

    //test Activity 
    test('Activity', () => {
        expect(activity1.id).toBe("1");
        expect(activity1.displayName).toBe('Activity One');
    });

    test('Activity-constructor', () => {
        const activity = new Activity('Activity One');
        expect(activity.id).toBeDefined();
        expect(activity.displayName).toBe('Activity One');
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