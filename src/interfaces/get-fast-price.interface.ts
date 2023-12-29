import { ResponseStatusEnum } from '@/enums';

export interface CountryData {
	amount: number | null,
	countryName: string | null,
	dictCurrencySymbol: string | null,
}

export interface GetFastPrice {
	status: ResponseStatusEnum,
	data: CountryData,
}
