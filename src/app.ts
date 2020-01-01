// Validation interface
interface FormField {
	value: string | number;
	required?: boolean;
	minLength?: number;
	maxLength?: number;
	min?: number;
	max?: number;
}

function validateField(formInput: FormField) {
	const { required, minLength, maxLength, min, max, value } = formInput;
	let isValid = true;
	if (required) {
		// Check if not empty
		isValid = isValid && value.toString().trim().length !== 0;
	}
	if (minLength != null && typeof value === 'string') {
		isValid = isValid && value.length > minLength;
	}
	if (maxLength != null && typeof value === 'string') {
		isValid = isValid && value.length < maxLength;
	}
	if (min != null && typeof value === 'number') {
		isValid = isValid && value >= min;
	}
	if (max != null && typeof value === 'number') {
		isValid = isValid && value <= max;
	}
	return isValid;
}

// Decorator to bind "this" to any class method
function autobindThis(_: any, _2: string, descriptor: PropertyDescriptor) {
	const methodToBeBound = descriptor.value;
	const changedDescriptor: PropertyDescriptor = {
		configurable: true,
		get() {
			const boundedMethod = methodToBeBound.bind(this);
			return boundedMethod;
		},
	};
	return changedDescriptor;
}

// Enum because it's a binary type
enum ProjectStatus {
	Active,
	Finished,
}

type Listener<GenericState> = (items: GenericState[]) => void;

// Base abstract class for Project
abstract class BaseClass<GenericHost extends HTMLElement, GenericEl extends HTMLElement> {
	templateEl: HTMLTemplateElement;
	hostEl: GenericHost;
	el: GenericEl;

	constructor(templateId: string, hostElementId: string, insertAtStart: boolean, newElementId?: string) {
		// 1. Get access to DOM elements
		this.templateEl = document.getElementById(templateId)! as HTMLTemplateElement; // Type cast
		this.hostEl = document.getElementById(hostElementId)! as GenericHost;

		// 2. Set content to "el"
		const importedTemplateContent = document.importNode(this.templateEl.content, true);
		this.el = importedTemplateContent.firstElementChild as GenericEl;
		if (newElementId) {
			this.el.id = newElementId;
		}

		this.attachContent(insertAtStart);
	}

	private attachContent(insertAtStart: boolean) {
		this.hostEl.insertAdjacentElement(insertAtStart ? 'afterbegin' : 'beforeend', this.el);
	}

	// abstract methods so other devs know to create in inherited class
	abstract configure?(): void;
	abstract renderContent(): void;
}

// Base abstract class for state
class BaseState<GenericState> {
	protected listeners: Listener<GenericState>[] = [];

	constructor() {}

	public addListener(listenerFn: Listener) {
		this.listeners.push(listenerFn);
	}
}

// Class to type cast Project
class Project {
	public constructor(
		public id: string,
		public title: string,
		public desc: string,
		public people: number,
		public status: ProjectStatus
	) {}
}

// Class to hold application state, singleton class
class ProjectState extends BaseState<Project> {
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

		// Execute correct listener function with projects array
		for (const listenerFn of this.listeners) {
			const projectsCopy = [...this.projects];
			listenerFn(projectsCopy);
		}
	}
}

const projectState = ProjectState.getInstance();

// Class to store created projects
class ProjectList extends BaseClass<HTMLDivElement, HTMLElement> {
	assignedProjects: Project[];

	constructor(private projectType: 'active' | 'finished') {
		super('project-list', 'app', false, `${projectType}-projects`);

		this.assignedProjects = [];

		// 3. Inject content into DOM

		this.configure();
		this.renderContent();
	}

	private renderProjects() {
		// 1. Access list in template
		const listEl = document.getElementById(`${this.projectType}-projects-list`)! as HTMLUListElement;
		listEl.innerHTML = '';
		// 2. Add each project to the list in DOM
		for (const project of this.assignedProjects) {
			const listItem = document.createElement('li');
			listItem.textContent = project.title;
			listEl.appendChild(listItem);
		}
	}

	configure() {
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

// Class for form to create new projects
class ProjectForm extends BaseClass<HTMLDivElement, HTMLFormElement> {
	// Annotate types
	titleInputEl: HTMLInputElement;
	descInputEl: HTMLInputElement;
	peopleInputEl: HTMLInputElement;

	public constructor() {
		super('project-input', 'app', true, 'user-input');

		this.titleInputEl = this.el.querySelector('#title') as HTMLInputElement;
		this.descInputEl = this.el.querySelector('#description') as HTMLInputElement;
		this.peopleInputEl = this.el.querySelector('#people') as HTMLInputElement;

		this.configure();
	}

	private gatherUserInput(): [string, string, number] | void {
		// 1. Access content input fields
		const enteredTitle = this.titleInputEl.value;
		const enteredDesc = this.descInputEl.value;
		const enteredPeople = this.peopleInputEl.value;

		// 2. Put values inside interface
		const titleField: FormField = { value: enteredTitle, required: true, minLength: 5 };
		const descField: FormField = { value: enteredDesc, required: true, minLength: 5 };
		const peopleField: FormField = { value: +enteredPeople, required: true, min: 1, max: 5 };

		// 3. Validate fields
		if (!validateField(titleField) || !validateField(descField) || !validateField(peopleField)) {
			alert('Invalid input. Please try again!');
			return;
		} else {
			return [enteredTitle, enteredDesc, +enteredPeople];
		}
	}

	private clearInputs() {
		// Clear fields by setting to empty string
		this.titleInputEl.value = '';
		this.descInputEl.value = '';
		this.peopleInputEl.value = '';
	}

	@autobindThis
	private formSubmitHandler(event: Event) {
		event.preventDefault();
		const userInput = this.gatherUserInput();
		// Check if input is Tuple
		if (Array.isArray(userInput)) {
			// Destructure array
			const [title, desc, people] = userInput;
			projectState.addProject(title, desc, people);
			this.clearInputs();
		}
	}

	renderContent() {}

	public configure() {
		this.el.addEventListener('submit', this.formSubmitHandler);
	}
}

const projForm = new ProjectForm();
const activeProjList = new ProjectList('active');
const finishedProjList = new ProjectList('finished');
