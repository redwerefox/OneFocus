
export class Activity {
    id: string;
    displayName: string;

    public constructor(displayName: string) {
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

export class ActivityEvent {
    activity: Activity;
    startTime: Date;
    // make Optional endTime
    endTime: Date | null;

    constructor(activity: Activity, startTime: Date) {
        this.activity = activity;
        this.startTime = startTime;
        this.endTime = null;
    }

    //end Time? really nessesary
    makeMarkdownText = (): string => {
        if (this.endTime === null) {
            return " ${this.startTime} : ${this.activity.displayName} ";
        } 
        return " ${this.startTime} : ${this.endTime} : ${this.activity.displayName} ";
    }
}
