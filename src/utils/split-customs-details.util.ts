export const SplitCustomsDetailsUtil = (str: string) => {
	const splitByColon = str.split(';');
	let arrayDetails: {
		content: string,
		count: number,
	}[] = [];

	splitByColon.forEach(value => {
		const splitByEqual = value.split('=');
		arrayDetails.push({
			content: splitByEqual[0],
			count: Number(splitByEqual[1]),
		});
	});

	return arrayDetails;
};
