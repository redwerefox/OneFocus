import { Activity } from "./ActivitiesVault";

export interface ActivitiesObserverInterface {
    update(activties: Activity[]): void;
}