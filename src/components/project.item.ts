namespace App {
	// Class to render single Project item in list
	export class ProjectItem extends BaseClass<HTMLUListElement, HTMLLIElement> implements Draggable {
		private projectItem: Project;

		get persons() {
			if (this.projectItem.people === 1) {
				return '1 person';
			} else {
				return `${this.projectItem.people} persons`;
			}
		}

		constructor(hostId: string, project: Project) {
			super('single-project', hostId, false, project.id);
			this.projectItem = project;

			this.configure();
			this.renderContent();
		}

		@autobindThis
		dragStartHandler(event: DragEvent) {
			event.dataTransfer!.setData('text/plain', this.projectItem.id);
		}

		dragEndHandler(_: DragEvent) {}

		configure() {
			this.el.addEventListener('dragstart', this.dragStartHandler);
		}

		renderContent() {
			this.el.querySelector('h2')!.textContent = this.projectItem.title;
			this.el.querySelector('h3')!.textContent = this.persons + ' assigned!';
			this.el.querySelector('p')!.textContent = this.projectItem.desc;
		}
	}
}
