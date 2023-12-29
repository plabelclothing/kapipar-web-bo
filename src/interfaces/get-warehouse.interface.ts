import { ResponseStatusEnum } from '@/enums';

export interface GetWarehouseInterface {
	status: ResponseStatusEnum,
	data: GetWarehouseInterfaceData[],
}

export interface GetWarehouseInterfaceData {
	uuid: string,
	name: string,
}
