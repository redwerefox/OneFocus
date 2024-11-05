import { OneFocusDailyTimeTracker } from "../src/OneFocusTimeTracker";
//import { Activity, DEFAULT_ACTIVITIES_COLORS, DEFAULT_ACTIVITY_NAMES, ActivityEvent  } from "../src/Activity";

describe('OneFocusDailyTimeTracker Tests', () => {

    test('parseTodaysActivities', async () => {
        const app = {
            vault: {
                getAbstractFileByPath: jest.fn(),
                adapter: {
                    read: jest.fn(),
                },
                create: jest.fn(),
            }
        };

        const timeTracker = new OneFocusDailyTimeTracker(app as any);

        const todaysFileName = "OneFocus-2021-01-01.md";
        const file = { path: todaysFileName };
        app.vault.getAbstractFileByPath.mockReturnValue(file);
        app.vault.adapter.read.mockReturnValue("## One Focus Time Tracker 2021-01-01\n");
        const events = await timeTracker.parseTodaysActivities();
        expect(events.length).toBe(0);
        });

    });