import { ResponseStatusEnum } from '@/enums';

export interface ReqOrderAddInterface {
	accountWarehouseShortRef: string,
	warehouseUuid: string,
	senderName: string,
	images: string[],
	size: ReqOrderAddSizeInterface,
	customsDetails: ReqOrderAddCustomsDetailsInterface,
}

export interface ReqOrderAddSizeInterface {
	l: number,
	h: number,
	w: number,
	weight: number,
}

export interface ReqOrderAddCustomsDetailsInterface {
	content: string,
	count: number,
}

export interface ResOrderAddInterface {
	status: ResponseStatusEnum;
	data: ResOrderAddDataInterface;
}

export interface ResOrderAddDataInterface {
	warehouseId: number;
}
