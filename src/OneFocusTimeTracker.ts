import { ActivityEvent, Activity } from './Activity';
import { App, TFile } from 'obsidian';

export class OneFocusDailyTimeTracker {

    //access daily notes
    private currentActivityEvent: ActivityEvent | null = null;
    private FILE_PREFIX = "OneFocus-";
    private  app : App;

    constructor(app: App) {
        this.app = app;
    }

    public onCurrentActivityChanged(newActivity: Activity) {
        if (newActivity.id !== this.currentActivityEvent?.activity.id) {
           this.currentActivityEvent = this.handleNewActivityEvent(this.currentActivityEvent, newActivity);
        }
    }

    private async AppendNewActivityTimeStamp(event : ActivityEvent) {
		const {vault} = this.app;

        //todo fix
        if (this.currentActivityEvent === null) {
            return
        }
        const fileName = this.makeFileName(this.currentActivityEvent);

		if (!vault.getAbstractFileByPath(fileName)) {
			await vault.create(fileName, "# One Focus Time Tracker ${event.startTime.toDateString()}");
		}
		//make TFile from path
		const file = vault.getAbstractFileByPath(fileName) as TFile;

		const content = await vault.read(file);
        content.concat(this.getEventMarkdownText(event));

        await vault.modify(file, content);
	}

    private makeFileName(Event: ActivityEvent): string {

        return  this.FILE_PREFIX + " " + Event.startTime.toDateString() + ".md";
    }

    private handleNewActivityEvent(oldActivityEvent: ActivityEvent, activity: Activity) : ActivityEvent {
        const endTime = new Date();
        if (oldActivityEvent !== null) {
            oldActivityEvent.endTime = endTime;
            this.AppendNewActivityTimeStamp(oldActivityEvent);
        }
        this.currentActivityEvent = new ActivityEvent(activity, endTime);
        return this.currentActivityEvent;
    }

    private getEventMarkdownText(event: ActivityEvent): string {
        return event.makeMarkdownText();
    }
}
