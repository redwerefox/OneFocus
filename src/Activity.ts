
export const DEFAULT_ACTIVITIES_COLORS = [
    // pastel colors starting with red and going through the rainbow
    '#FFB3BA', // red
    '#FFD1A9', // orange
    '#FFFFBA', // Yellow
    '#BAFFC9', // green
    '#BAE1FF', // light Cyan
    '#AECBFA', // blue
    '#C6A2FD', // purple
    '#FFC1E3', // light purple
    '#D7B9F5' // pink
    ];

export const DEFAULT_ACTIVITY_NAMES = [
    'Idling',  // highly suggesting to have idling as default activity, as it is important to choose anything else
    'Study',
    'Exercise',
    'Reading',
    'Meditation',
    'Cooking',
    'Cleaning',
    'Socializing',
    'Sleeping'
    ];

export class Activity {
    id: string;
    displayName: string;
    static ColorIndexCounter = 0;
    color: string = DEFAULT_ACTIVITIES_COLORS[Activity.ColorIndexCounter];

    public constructor() {
        this.id = this.generateUUID();
        this.displayName = this.generateNextDefaultActivityName();
        this.generateNextDefaultColor();
        this.incrementDefaultCounter();
    }

    setColor(color: string): Activity {
        this.color = color;
        return this;
    }

    setName(name: string): Activity {
        this.displayName = name;
        return this;
    }

    private incrementDefaultCounter(): void {
        Activity.ColorIndexCounter++;
        if (Activity.ColorIndexCounter >= DEFAULT_ACTIVITY_NAMES.length) {
            Activity.ColorIndexCounter = 0;
        }
    }

    // generate next default activity Name
    private generateNextDefaultActivityName(): string {

        return DEFAULT_ACTIVITY_NAMES[Activity.ColorIndexCounter];
    }

    private generateNextDefaultColor(): string {
        return DEFAULT_ACTIVITIES_COLORS[Activity.ColorIndexCounter];
    }

    private generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

export class ActivityTimeView {
    activityName: string;
    startTime: Date;

    public static fromMarkdownText = (text: string): ActivityTimeView | undefined => {
        const parts = text.split(" - ");
        if (parts.length < 2) {
            return undefined;
        }
        const time = new Date(parts[0]);
        const activityView = new ActivityTimeView();
        
        activityView.activityName = (parts[1]);
        activityView.startTime = time;
        return activityView;
    }
}



export class ActivityEvent {
    activity: Activity;
    startTime: Date;
   

    constructor(activity: Activity, startTime: Date) {
        this.activity = activity;
        this.startTime = startTime;
    }

    private startTimeFormatted(): string {
        return this.startTime.toDateString() + " " + this.startTime.toLocaleTimeString();
    }

    //end Time? really nessesary
    public makeMarkdownText = (): string => { 
        return ` ${this.startTimeFormatted()} -  ${this.activity.displayName}\n`;
    }

}