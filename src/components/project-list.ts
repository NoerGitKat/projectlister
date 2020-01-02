import { BaseClass } from './base-project.js';
import { autobindThis } from '../decorators/autobind.js';
import { ProjectStatus, Project } from '../models/project-model.js';
import { projectState } from '../state/project-state.js';
import { DragTarget } from '../models/dragndrop-interfaces.js';
import { ProjectItem } from './project-item.js';

// Class to store created projects
export class ProjectList extends BaseClass<HTMLDivElement, HTMLElement> implements DragTarget {
	assignedProjects: Project[];

	constructor(private projectType: 'active' | 'finished') {
		super('project-list', 'app', false, `${projectType}-projects`);

		this.assignedProjects = [];

		// 3. Inject content into DOM

		this.configure();
		this.renderContent();
	}

	@autobindThis
	dragOverHandler(event: DragEvent) {
		// 1. Check if dragged item is of correct format
		if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
			event.preventDefault();
			// 2. Access list element in DOM
			const listEl = this.el.querySelector('ul')!;
			listEl.classList.add('droppable');
		}
	}

	@autobindThis
	dropHandler(event: DragEvent) {
		const prjId = event.dataTransfer!.getData('text/plain');
		const newStatus = this.projectType === 'active' ? ProjectStatus.Active : ProjectStatus.Finished;
		projectState.moveProject(prjId, newStatus);
	}

	@autobindThis
	dragLeaveHandler(_: DragEvent) {
		// 1. Access list element in DOM
		const listEl = this.el.querySelector('ul')!;
		listEl.classList.remove('droppable');
	}

	private renderProjects() {
		// 1. Access list in template
		const listEl = document.getElementById(`${this.projectType}-projects-list`)! as HTMLUListElement;
		listEl.innerHTML = '';
		// 2. Add each project to the list in DOM
		for (const project of this.assignedProjects) {
			new ProjectItem(this.el.querySelector('ul')!.id, project);
		}
	}

	configure() {
		// Event listeners
		this.el.addEventListener('dragover', this.dragOverHandler);
		this.el.addEventListener('dragleave', this.dragLeaveHandler);
		this.el.addEventListener('drop', this.dropHandler);

		projectState.addListener((projects: Project[]) => {
			const relevantProjects = projects.filter(prj => {
				if (this.projectType === 'active') {
					return prj.status === ProjectStatus.Active;
				}
				return prj.status === ProjectStatus.Finished;
			});
			this.assignedProjects = relevantProjects;
			this.renderProjects();
		});
	}

	renderContent() {
		const listId = `${this.projectType}-projects-list`;
		// Set element id
		this.el.querySelector('ul')!.id = listId;
		// Inject content for header
		this.el.querySelector('h2')!.textContent = this.projectType.toUpperCase() + ' PROJECTS';
	}
}
