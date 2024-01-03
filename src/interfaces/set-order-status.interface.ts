import { OrderStatusEnum } from '@/enums';

export interface SetOrderStatusInterface {
	status: OrderStatusEnum,
	rejectReason?: string,
	size?: SetOrderStatusSizeInterface,
}

export interface SetOrderStatusSizeInterface {
	l: number,
	h: number,
	w: number,
	weight: number,
}
