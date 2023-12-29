import { ResponseStatusEnum } from '@/enums';

export interface GetUserInterface {
	status: ResponseStatusEnum;
	data: GetUserSimpleDataInterface;
}

export interface GetUserSimpleDataInterface {
	name: string,
	uuid: string,
	email: string,
	isActive: boolean,
}
