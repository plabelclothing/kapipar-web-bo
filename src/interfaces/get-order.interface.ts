import { ResponseStatusEnum } from '@/enums';

export interface GetOrderByUuid {
	status: ResponseStatusEnum;
	data: GetOrderByUuidData
}

export interface GetOrderByUuidData {
	uuid: string,
	is_can_send: boolean,
	size: {
		l: number,
		h: number,
		w: number,
		weight: number,
	},
	details: GetOrderByUuidDetails[],
}

export interface GetOrderByUuidDetails {
	content: string,
	count: number,
}

export interface GetOrderInterface {
	status: ResponseStatusEnum;
	data: GetOrderInterfaceData;
}

export interface GetOrderInterfaceData {
	countItems: number,
	maxCountItems: number,
	lastUuid?: string,
	orders: {
		[key: string]: {
			account_warehouse__uuid: string;
			account_warehouse__country_code: string;
			order_status: string;
			short_ref: string;
			track_number?: string;
			sendAccountManager?: string;
			account_email: string,
			account_uuid: string,
			print: PrintDto;
			is_paid: boolean;
			is_can_be_prepared_for_send: boolean;
			is_for_consolidation: boolean;
			packages: Package[];
		},
	}
}
export interface Package {
	warehouse_id: number;
	sender_name: string;
	created_at: number;
	uuid: string;
	format_date: string;
	order__uuid: string;
}

export interface PrintDto {
	addressLabel: string,
	customsDeclaration: string,
}
