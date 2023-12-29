import { ResponseStatusEnum } from '@/enums';

export interface GetActiveCountry {
	status: ResponseStatusEnum,
	data: ActiveCountryData,
}

export interface ActiveCountryData {
	detailedCodes: {
		[key: string]: {
			iso_code_2: string,
			name: string,
			uuid: string,
		},
	},
	onlyCodes: string[],
}
