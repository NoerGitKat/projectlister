// Validation interface
export interface FormField {
	value: string | number;
	required?: boolean;
	minLength?: number;
	maxLength?: number;
	min?: number;
	max?: number;
}

export function validateField(formInput: FormField) {
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
