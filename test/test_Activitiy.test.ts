import { Activity, DEFAULT_ACTIVITIES_COLORS, DEFAULT_ACTIVITY_NAMES, ActivityEvent  } from "../src/Activity";


describe('Activity Tests', () => {

    test('looping default colors', () => {
        for (let i = 0; i < DEFAULT_ACTIVITIES_COLORS.length *2; i++) {
            const newActivity = new Activity();
            expect(newActivity.color).toMatch(DEFAULT_ACTIVITIES_COLORS[i % DEFAULT_ACTIVITIES_COLORS.length]);
        }
    });

    test('looping default activity names', () => {
        for (let i = 0; i < DEFAULT_ACTIVITY_NAMES.length *2 ; i++) {
            const newActivity = new Activity();
            expect(newActivity.displayName).toMatch(DEFAULT_ACTIVITY_NAMES[i % DEFAULT_ACTIVITY_NAMES.length]);
        }
    }   );

    test('generate10000UniqueUUIDs', () => {
        const uuids = new Set<string>();
        for (let i = 0; i < 10000; i++) {
            const newActivity = new Activity();
            expect(uuids.has(newActivity.id)).toBeFalsy();
            uuids.add(newActivity.id);
        }
    });
        
    test('Activity setColor', () => {
        const activity = new Activity();
        activity.setColor('#000000');
        expect(activity.color).toBe('#000000');
    });

    test('Activity setName', () => {
        const activity = new Activity();
        activity.setName('Test Name');
        expect(activity.displayName).toBe('Test Name');
    });
});

describe('ActivityEvent Tests', () => {
    let activity: Activity;
    let activityEvent: ActivityEvent;

    beforeEach(() => {
        activity = new Activity();
        activityEvent = new ActivityEvent(activity, new Date());
    });

    test('ActivityEvent constructor', () => {
        expect(activityEvent.activity).toBe(activity);
        expect(activityEvent.startTime).toBeDefined();
    });


    test('ActivityEvent makeMarkdownText', () => {
        const startTime = new Date();
        startTime.setFullYear(2021, 1, 1);
        startTime.setHours(12);
        startTime.setMinutes(0);

        activityEvent.startTime = startTime;

        const formattedTime = startTime.toDateString()+ " " + startTime.toLocaleTimeString();
        expect(activityEvent.startTime).toBeDefined();
        expect(activityEvent.makeMarkdownText()).toMatch(`${formattedTime} - ${activity.displayName}\n`);

        //print for human test
        console.log("The following is the markdown text for the activity event: \n");
        console.log(activityEvent.makeMarkdownText());
    });

});