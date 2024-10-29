// Code language: TypeScript

import { App,  Modal } from 'obsidian';
import {Activity} from './ActivityVault';

export class ActivitiesModal extends Modal {
	
	activities: Activity[];


	constructor(app: App, activities: Activity[]) {
		super(app);
		this.activities = activities;
	}

	makeActivityList(): HTMLElement {
		const listEl = document.createElement('ul');
		listEl.addClass('activity-list');

		this.activities.forEach(activity => {
			const itemEl = document.createElement('li');
			itemEl.addClass('activity-item');
			itemEl.setText(activity.displayName);
			listEl.appendChild(itemEl);
		});

		return listEl;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.appendChild(this.makeActivityList());
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}