// Base abstract class for Project
export abstract class BaseClass<GenericHost extends HTMLElement, GenericEl extends HTMLElement> {
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

		// 3. Add content to DOM
		this.attachContent(insertAtStart);
	}

	private attachContent(insertAtStart: boolean) {
		this.hostEl.insertAdjacentElement(insertAtStart ? 'afterbegin' : 'beforeend', this.el);
	}

	// abstract methods so other devs know to create in inherited class
	abstract configure?(): void;
	abstract renderContent(): void;
}
