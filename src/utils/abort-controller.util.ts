export class AbortControllerUtil {
	time: number;

	constructor(time: number = Number(process.env.NEXT_PUBLIC_TIME_OUT)) {
		 this.time = time;
	}

	init() {
		const controllerTimeOut = new AbortController();
		const timeoutId = setTimeout(() => controllerTimeOut.abort(), Number(this.time));

		return {
			controllerTimeOut,
			timeoutId,
		};
	}
}
