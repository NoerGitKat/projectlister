import { ProjectStatus, Project } from '../models/project-model';

type Listener<GenericState> = (items: GenericState[]) => void;

// Base abstract class for state
class BaseState<GenericState> {
	protected listeners: Listener<GenericState>[] = [];

	constructor() {}

	public addListener(listenerFn: Listener<GenericState>) {
		this.listeners.push(listenerFn);
	}
}

// Class to hold application state, singleton class
export class ProjectState extends BaseState<Project> {
	private projects: Project[] = [];
	private static instance: ProjectState;

	private constructor() {
		super();
	}

	static getInstance() {
		// Make it into singleton class
		if (this.instance) {
			return this.instance;
		}
		this.instance = new ProjectState();
		return this.instance;
	}

	// Adds a new project to state
	public addProject(title: string, desc: string, numOfPeople: number) {
		const newProject = new Project(Math.random().toString(), title, desc, numOfPeople, ProjectStatus.Active);
		this.projects.push(newProject);

		this.updateListeners();
	}

	public moveProject(projectId: string, newStatus: ProjectStatus) {
		const projectFound = this.projects.find(prj => prj.id === projectId);
		if (projectFound && projectFound.status !== newStatus) {
			projectFound.status = newStatus;
			this.updateListeners();
		}
	}

	private updateListeners() {
		// Execute correct listener function with projects array
		for (const listenerFn of this.listeners) {
			const projectsCopy = [...this.projects];
			listenerFn(projectsCopy);
		}
	}
}

export const projectState = ProjectState.getInstance();
