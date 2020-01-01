// import uuidv4 from 'uuid/v4';

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

// Class to hold application state, singleton class
class ProjectState {
	private listeners: any[] = [];
	private projects: any[] = [];
	private static instance: ProjectState;

	private constructor() {}

	static getInstance() {
		// Make it into singleton class
		if (this.instance) {
			return this.instance;
		}
		this.instance = new ProjectState();
		return this.instance;
	}

	public addListener(listenerFn: Function) {
		this.listeners.push(listenerFn);
	}

	// Adds a new project to state
	public addProject(title: string, desc: string, numOfPeople: number) {
		const newProject = {
			// id: uuidv4(),
			id: Math.random().toString(),
			title,
			desc,
			people: numOfPeople,
		};
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
class ProjectList {
	templateEl: HTMLTemplateElement;
	hostEl: HTMLDivElement;
	projectEl: HTMLElement;
	assignedProjects: any[];

	constructor(private projectType: 'active' | 'finished') {
		this.assignedProjects = [];

		// 1. Get access to DOM elements
		this.templateEl = document.getElementById('project-list')! as HTMLTemplateElement; // Type cast
		this.hostEl = document.getElementById('app') as HTMLDivElement;

		// 2. Set content to "el"
		const importedTemplateContent = document.importNode(this.templateEl.content, true);
		this.projectEl = importedTemplateContent.firstElementChild as HTMLElement;
		this.projectEl.id = `${this.projectType}-projects`;

		projectState.addListener((projects: any[]) => {
			this.assignedProjects = projects;
			this.renderProjects();
		});

		// 3. Inject content into DOM
		this.attachContent();
		this.renderContent();
	}

	private renderProjects() {
		// 1. Access list in template
		const listEl = document.getElementById(`${this.projectType}-projects-list`)! as HTMLUListElement;

		// 2. Add each project to the list in DOM
		for (const project of this.assignedProjects) {
			const listItem = document.createElement('li');
			listItem.textContent = project.title;
			listEl.appendChild(listItem);
		}
	}

	private renderContent() {
		const listId = `${this.projectType}-projects-list`;
		// Set element id
		this.projectEl.querySelector('ul')!.id = listId;
		// Inject content for header
		this.projectEl.querySelector('h2')!.textContent = this.projectType.toUpperCase() + ' PROJECTS';
	}

	private attachContent() {
		this.hostEl.insertAdjacentElement('beforeend', this.projectEl);
	}
}

// Class for form to create new projects
class ProjectForm {
	// Annotate types
	templateEl: HTMLTemplateElement;
	hostEl: HTMLDivElement;
	formEl: HTMLFormElement;
	titleInputEl: HTMLInputElement;
	descInputEl: HTMLInputElement;
	peopleInputEl: HTMLInputElement;

	public constructor() {
		// 1. Get access to DOM elements
		this.templateEl = document.getElementById('project-input')! as HTMLTemplateElement; // Type cast
		this.hostEl = document.getElementById('app') as HTMLDivElement;

		// 2. Set content to "el"
		const importedTemplateContent = document.importNode(this.templateEl.content, true);
		this.formEl = importedTemplateContent.firstElementChild as HTMLFormElement;
		this.formEl.id = 'user-input';

		// 3. Get and set to form input fields
		this.titleInputEl = this.formEl.querySelector('#title') as HTMLInputElement;
		this.descInputEl = this.formEl.querySelector('#description') as HTMLInputElement;
		this.peopleInputEl = this.formEl.querySelector('#people') as HTMLInputElement;

		this.submitForm();

		// 4. Attach new content to DOM
		this.attachContent();
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

	private submitForm() {
		this.formEl.addEventListener('submit', this.formSubmitHandler);
	}

	private attachContent = () => {
		this.hostEl.insertAdjacentElement('afterbegin', this.formEl);
	};
}

const projForm = new ProjectForm();
const activeProjList = new ProjectList('active');
const finishedProjList = new ProjectList('finished');
