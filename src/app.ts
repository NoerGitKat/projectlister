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
		isValid = isValid && value > min;
	}
	if (max != null && typeof value === 'number') {
		isValid = isValid && value < max;
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

class ProjectInput {
	// Annotate types
	templateEl: HTMLTemplateElement;
	hostEl: HTMLDivElement;
	formEl: HTMLFormElement;
	titleInputEl: HTMLInputElement;
	descInputEl: HTMLInputElement;
	peopleInputEl: HTMLInputElement;

	constructor() {
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

		this.configure();

		// 4. Attach new content to DOM
		this.attachContent();
	}

	private gatherUserInput(): [string, string, number] | void {
		// 1. Access content input fields
		const enteredTitle = this.titleInputEl.value;
		const enteredDescription = this.descInputEl.value;
		const enteredPeople = this.peopleInputEl.value;

		const titleField: FormField = { value: enteredTitle, required: true, minLength: 5 };
		const descField: FormField = { value: enteredDescription, required: true, minLength: 5 };
		const peopleField: FormField = { value: +enteredPeople, required: true, min: 1, max: 5 };

		// 2. Validate fields
		if (!validateField(titleField) || !validateField(descField) || !validateField(peopleField)) {
			alert('Invalid input. Please try again!');
			return;
		} else {
			return [enteredTitle, enteredDescription, +enteredPeople];
		}
	}

	@autobindThis
	private formSubmitHandler(event: Event) {
		event.preventDefault();
		const userInput = this.gatherUserInput();
		console.log('userinput', userInput);
	}

	private configure() {
		this.formEl.addEventListener('submit', this.formSubmitHandler);
	}

	private attachContent = () => {
		this.hostEl.insertAdjacentElement('afterbegin', this.formEl);
		console.log('this.formEl', this.formEl);
	};
}

const projInput = new ProjectInput();
