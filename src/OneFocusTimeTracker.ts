import { ActivityEvent, Activity, ActivityTimeView } from './Activity';
import { App, TFile } from 'obsidian';


export class OneFocusDailyTimeTracker {

    //access daily notes
    private currentActivityEvent: ActivityEvent | undefined = undefined;
    private FILE_PREFIX = "OneFocus-";
    private  app : App;

    private callback: (events: ActivityTimeView[]) => void;

    constructor(app: App) {
        this.app = app;
    }

    public onCurrentActivityChanged(newActivity: Activity | undefined) : void  {
        if (newActivity && newActivity.id !== ( this.currentActivityEvent?.activity.id ?? "") ) {
           this.currentActivityEvent = this.handleNewActivityEvent(this.currentActivityEvent, newActivity);
        }
        
        // dont block calling parseTodaysActivities
        this.parseTodaysActivities().then((events) => {
            if (this.callback) {
                this.callback(events);
            }
        });
    }

    public SetViewersTodaysActivitiesCallback(callback: (events: ActivityTimeView[]) => void) {
        this.callback = callback;
    }

    async parseTodaysActivities() : Promise<ActivityTimeView[]> {
        const todaysFileName = this.makeFileName(new ActivityEvent(new Activity(), new Date()));
        const file = this.app.vault.getAbstractFileByPath(todaysFileName) as TFile;
        if (!file) {
            return [];
        }
        const activityEvents: ActivityTimeView[] = [];
        const content = await this.app.vault.adapter.read(file.path);
        const lines = content.split("\n");
        for (const line of lines) {
            const event = ActivityTimeView.fromMarkdownText(line);
            if (event) {
                activityEvents.push(event);
            }
        }
        return activityEvents;
    }

    private async AppendNewActivityTimeStamp(event : ActivityEvent) {
		const {vault} = this.app;

        const fileName = this.makeFileName(event);

		if (!vault.getAbstractFileByPath(fileName)) {
			await vault.create(fileName, "# One Focus Time Tracker ${event.startTime.toDateString()} \n");
		}
		//make TFile from path
		const file = vault.getAbstractFileByPath(fileName) as TFile;
        const existingContent = await vault.adapter.read(file.path);
        const newContent = `${existingContent}\n${this.currentActivityEvent?.makeMarkdownText()}`;
        await vault.adapter.write(file.path, newContent);
        
	}

    private makeFileName(Event: ActivityEvent): string {

        return  this.FILE_PREFIX + " " + Event.startTime.toDateString() + ".md";
    }

    private handleNewActivityEvent(oldActivityEvent: ActivityEvent | undefined, activity: Activity) : ActivityEvent {
        if (oldActivityEvent !== undefined) {
            this.AppendNewActivityTimeStamp(oldActivityEvent);
        }
        const endTime = new Date();
        this.currentActivityEvent = new ActivityEvent(activity, endTime);
        return this.currentActivityEvent;
    }

    private getEventMarkdownText(event: ActivityEvent): string {
        return event.makeMarkdownText();
    }
}


