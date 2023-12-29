import { CustomsContentsTypeEnum, ParcelTypeEnum, ResponseStatusEnum, ShippingTypeEnum } from '@/enums';

export interface ReqGetPriceInterface {
	countryCode: string;
	currencyCode: string;
	city: string;
	postalCode: string;
	packageWeight: number;
	weightMeasure: string;
	parcelType: ParcelTypeEnum;
	shippingType: ShippingTypeEnum;
	packageValue: number;
	isInsured: boolean;
	size: Size;
	contentsType?: CustomsContentsTypeEnum | null;
	customsDetails?: CustomsDetail[];
	orderUuid?: string,
}

interface Size {
	length: number;
	height: number;
	width: number;
	measure: string;
}

export interface CustomsDetail {
	content: string;
	count: number;
	amount: number;
}

export interface ResGetPriceInterface {
	status: ResponseStatusEnum;
	data: Data;
}

interface Data {
	provider_channel_country_price__amount: number;
	provider_channel_country_price__uuid: string;
	dict_currency__iso_4217: string;
	dict_currency__symbol: string;
	dict_currency__code: number;
	provider__code: string;
	provider__name: string;
	provider_channel__parcel_type: string;
	provider_channel__shipping_type: string;
	formatPrice: string;
	deliveryTime?: number;
}
