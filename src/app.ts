/// <reference path="utils/validation.ts" />
/// <reference path="state/project-state.ts" />
/// <reference path="models/project-model.ts" />
/// <reference path="models/dragndrop-interfaces.ts" />
/// <reference path="decorators/autobind.ts" />
/// <reference path="components/base-project.ts" />
/// <reference path="components/project-list.ts" />
/// <reference path="components/project-form.ts" />

namespace App {
	new ProjectForm();
	new ProjectList('active');
	new ProjectList('finished');
}
