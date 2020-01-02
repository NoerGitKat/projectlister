import { BaseClass } from './base-project.js';
import { projectState } from '../state/project-state.js';
import { autobindThis } from '../decorators/autobind.js';
import { validateField, FormField } from '../utils/validation.js';

// Class for form to create new projects
export class ProjectForm extends BaseClass<HTMLDivElement, HTMLFormElement> {
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
