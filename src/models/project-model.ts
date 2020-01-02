// Enum because it's a binary type
export enum ProjectStatus {
	Active,
	Finished,
}

// Class to type cast Project
export class Project {
	public constructor(
		public id: string,
		public title: string,
		public desc: string,
		public people: number,
		public status: ProjectStatus
	) {}
}
