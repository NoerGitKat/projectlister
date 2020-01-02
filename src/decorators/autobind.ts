// Decorator to bind "this" to any class method
export function autobindThis(_: any, _2: string, descriptor: PropertyDescriptor) {
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
