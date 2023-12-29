import { ChangeEvent } from 'react';

export const handleInput = (
	e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
	pattern: RegExp | null,
	setFunc: (value: string, id?: number) => void,
	length?: number,
	id?: number,
	limits?: {
		min: number,
		max: number
	}) => {
	if (pattern) {
		e.target.value = e.target.value.replace(pattern, '');
	}

	if (length) {
		e.target.value = e.target.value.substring(0, length);
	}

	if (limits) {
		if (e.target.value && Number(e.target.value) < limits.min) {
			e.target.value = String(limits.min);
		}

		if (e.target.value && Number(e.target.value) > limits.max) {
			e.target.value = String(limits.max);
		}
	}

	if (id) {
		return setFunc(e.target.value, id);
	}

	setFunc(e.target.value);
};

export const handleInputObject = <T extends { [key: string]: any }>(
	e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	pattern: RegExp | null,
	setFunc: (obj: T) => void,
	obj: T,
	objKey: keyof T,
) => {
	if (pattern) {
		e.target.value = e.target.value.replace(pattern, '');
	}
	setFunc({
		...obj,
		[objKey]: e.target.value,
	});
};
