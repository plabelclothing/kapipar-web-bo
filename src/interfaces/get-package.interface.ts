import { ResponseStatusEnum } from '@/enums';

export interface GetPackageInterface {
	status: ResponseStatusEnum;
	data: GetPackageDataInterface,
}

interface OrderSizeDto {
	l: number,
	h: number,
	w: number,
	weight: number,
}

export interface GetPackageDataInterface {
	uuid: string,
	order_uuid: string,
	sender_name: string,
	images: string[],
	format_date: string,
	size: OrderSizeDto,
}
