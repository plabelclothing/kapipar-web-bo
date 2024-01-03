import type { ReactElement } from 'react';
import RootLayout from '@/components/rootLayout';
import type { NextPageWithLayout } from '../../_app';
import { AsideProfile } from '@/components/asideProfile';
import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import { GetOrderInterface, GetOrderInterfaceData } from '@/interfaces/get-order.interface';
import { AbortControllerUtil, handleInput } from '@/utils';
import Loader from '@/components/loader';
import { useRouter } from 'next/router';
import { OrderStatusEnum } from '@/enums';
import { SetOrderStatusInterface } from '@/interfaces';
const Order: NextPageWithLayout = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const [orderData, setOrderData] = useState<GetOrderInterfaceData | null>(null);
	const [isReady, setIsReady] = useState(false);
	const [isShowLoaderMoreBtn, setIsShowLoaderMoreBtn] = useState(false);
	const [accountUuidFilter, setAccountUuidFilter] = useState<string | null>(null);
	const [externalIdFilter, setExternalIdFilter] = useState<string | null>(null);
	const [orderUuidFilter, setOrderUuidFilter] = useState<string | null>(null);
	const [orderShortIdFilter, setOrderShortIdFilter] = useState<string | null>(null);
	const [dateFromFilter, setDateFromFilter] = useState<string | null>(null);
	const [dateToFilter, setDateToFilter] = useState<string | null>(null);
	const [isReadyFilter, setIsReadyFilter] = useState<boolean>(false);
	const [statusFilter, setStatusFilter] = useState<OrderStatusEnum | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			const abortControllerUtil = new AbortControllerUtil();

			const abortControllerUtilRootLayout = abortControllerUtil.init();

			const queryString = Object.entries(router.query)
				.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`)
				.join('&');

			for (const key in router.query) {
				switch (key) {
					case 'accountUuid':
						setAccountUuidFilter(router.query[key] as string);
						break;
					case 'externalId':
						setExternalIdFilter(router.query[key] as string);
						break;
					case 'orderUuid':
						setOrderUuidFilter(router.query[key] as string);
						break;
					case 'orderShortId':
						setOrderShortIdFilter(router.query[key] as string);
						break;
					case 'dateFrom':
						setDateFromFilter(router.query[key] as string);
						break;
					case 'dateTo':
						setDateToFilter(router.query[key] as string);
						break;
					case 'isNotPreparedForSend':
						setIsReadyFilter(Boolean(router.query[key]));
						break;
					case 'status':
						setStatusFilter(router.query[key] as OrderStatusEnum);
						break;
					default:
						break;
				}
			}

			try {
				const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/v1/order/manager/all${queryString ? `?${queryString}` : ''}`, {
					signal: abortControllerUtilRootLayout.controllerTimeOut.signal,
				});

				if (!response.ok) {
					throw response;
				}

				const resJson: GetOrderInterface = await response.json();

				setOrderData(resJson.data);
			} catch (e) {
				setOrderData(null);
			} finally {
				clearTimeout(abortControllerUtilRootLayout.timeoutId);
				setIsReady(true);
			}
		};

		fetchData().catch((e) => {
		});
	}, []);

	const filterButton = async () => {
		let filters: string[] = [];
		let query = '';

		if (accountUuidFilter) {
			filters.push(`accountUuid=${encodeURIComponent(accountUuidFilter)}`);
		}

		if (externalIdFilter) {
			filters.push(`externalId=${encodeURIComponent(externalIdFilter)}`);
		}

		if (orderUuidFilter) {
			filters.push(`orderUuid=${encodeURIComponent(orderUuidFilter)}`);
		}

		if (orderShortIdFilter) {
			filters.push(`orderShortId=${encodeURIComponent(orderShortIdFilter)}`);
		}

		if (dateFromFilter) {
			filters.push(`dateFrom=${encodeURIComponent(Number(dateFromFilter))}`);
		}

		if (dateToFilter) {
			filters.push(`dateTo=${encodeURIComponent(Number(dateToFilter))}`);
		}

		if (isReadyFilter) {
			filters.push(`isNotPreparedForSend=${encodeURIComponent(isReadyFilter)}`);
		}

		if (statusFilter) {
			filters.push(`status=${encodeURIComponent(statusFilter)}`);
		}

		if (filters.length) {
			query = `?${filters.join('&')}`;
		}

		await router.push(`${router.basePath}/profile/order${query}`);
		return router.reload();
	};

	const moreOrders = async () => {
		if (!orderData?.lastUuid) {
			return;
		}

		setIsShowLoaderMoreBtn(true);

		const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/v1/order/manager/all?uuid=${orderData.lastUuid}`);

		if (!response.ok) {
			throw response;
		}

		try {
			const resJson: GetOrderInterface = await response.json();

			if (!resJson?.data?.orders) {
				return;
			}

			setOrderData({
				lastUuid: resJson.data.lastUuid,
				maxCountItems: resJson.data.maxCountItems,
				countItems: resJson.data.countItems,
				orders: {
					...orderData.orders,
					...resJson.data.orders,
				},
			});
		} catch (e) {
		} finally {
			setIsShowLoaderMoreBtn(false);
		}
	};

	const isReadyButton = async (uuid: string) => {
		const areYouSure = confirm(`${t('order:areYouSure')}`);

		if (!areYouSure) {
			return;
		}

		window.scrollTo({
			top: 0,
			behavior: 'smooth',
		});

		setIsReady(false);

		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/v1/order/status/${uuid}`, {
				method: 'PUT',
				credentials: 'same-origin',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					status: OrderStatusEnum.SENT,
				}),
			});

			if (!response.ok) {
				throw response;
			}

			router.reload();
		} catch (e: any) {
			alert(`Is Ready action error - ${e.message || e.statusText}`);
		} finally {
			setIsReady(true);
		}
	};

	const consolidateButton = async (uuid: string, isReject: boolean = false) => {
		const areYouSure = confirm(`${t('order:areYouSure')}`);

		if (!areYouSure) {
			return;
		}

		let status = isReject ? OrderStatusEnum.REJECTED : OrderStatusEnum.NEW;

		const body: SetOrderStatusInterface = {
			status,
		};

		let rejectReason = '';
		let l: string;
		let w: string;
		let h: string;
		let weight: string;

		if (isReject) {
			rejectReason = prompt(`${t('order:reason')}`) as string;
			const isContinue = confirm(`${t('order:continue')} Reason - ${rejectReason}`);

			if (!isContinue) {
				return;
			}

			body.rejectReason = rejectReason;
		}

		if (!isReject) {
			l = prompt(`${t('order:l')}`) as string;
			h = prompt(`${t('order:h')}`) as string;
			w = prompt(`${t('order:w')}`) as string;
			weight = prompt(`${t('order:weight')}`) as string;

			const isContinue = confirm(`${t('order:continue')}`);

			if (!isContinue) {
				return;
			}

			body.size = {
				l: Number(l),
				h: Number(h),
				w: Number(w),
				weight: Number(weight),
			};
		}

		window.scrollTo({
			top: 0,
			behavior: 'smooth',
		});

		setIsReady(false);

		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/v1/order/status/${uuid}`, {
				method: 'PUT',
				credentials: 'same-origin',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			});

			if (!response.ok) {
				throw response;
			}

			router.reload();
		} catch (e: any) {
			alert(`Is Ready action error - ${e.message || e.statusText}`);
		} finally {
			setIsReady(true);
		}
	};

	const redirectButton = (url: string) => {
		return window.open(url, '_blank');
	};

	if (!isReady) {
		return (
			<>
				<Loader />
				<br></br>
				<br></br>
			</>
		);
	}

	return <>
		<Head>
			<title>{t('common:myOrders')}</title>
		</Head>
		<div className="main_tracker_profile">
			<AsideProfile />
			<div className="right-side_order">
				<h2 className="my-order_title">{t('order:myOrders')}</h2>
				<div className="orders-wrapper">
					<div className="order-title_wrapper">
					</div>
					<div className="order-card_wrapper">
						<div className="order-card_filter">
							<div className="order-description_wrapper">
								<p className="order-description">{t('order:accountUuid')}</p>
								<input
									className="order-description"
									type="text"
									name="accountUuid"
									defaultValue={accountUuidFilter || ''}
									onChange={(event) => {
										handleInput(event, /[^a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\/\-=' ]*$/g, setAccountUuidFilter);
									}}
								/>
							</div>
						</div>
						<div className="order-card_filter">
							<div className="order-description_wrapper">
								<p className="order-description">{t('order:externalId')}</p>
								<input
									className="order-description"
									type="text"
									name="externalId"
									defaultValue={externalIdFilter || ''}
									onChange={(event) => {
										handleInput(event, /[^a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\/\-=' ]*$/g, setExternalIdFilter);
									}}
								/>
							</div>
						</div>
						<div className="order-card_filter">
							<div className="order-description_wrapper">
								<p className="order-description">{t('order:orderUuid')}</p>
								<input
									className="order-description"
									type="text"
									name="orderUuid"
									defaultValue={orderUuidFilter || ''}
									onChange={(event) => {
										handleInput(event, /[^a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\/\-=' ]*$/g, setOrderUuidFilter);
									}}
								/>
							</div>
						</div>
						<div className="order-card_filter">
							<div className="order-description_wrapper">
								<p className="order-description">{t('order:orderShortId')}</p>
								<input
									className="order-description"
									type="text"
									name="orderShortId"
									defaultValue={orderShortIdFilter || ''}
									onChange={(event) => {
										handleInput(event, /[^a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\/\-=' ]*$/g, setOrderShortIdFilter);
									}}
								/>
							</div>
						</div>
						<div className="order-card_filter">
							<div className="order-description_wrapper">
								<p className="order-description">{t('order:dateFrom')}</p>
								<input
									className="order-description"
									type="text"
									name="dateFrom"
									defaultValue={dateFromFilter || ''}
									onChange={(event) => {
										handleInput(event, /\D/g, setDateFromFilter);
									}}
								/>
							</div>
						</div>
						<div className="order-card_filter">
							<div className="order-description_wrapper">
								<p className="order-description">{t('order:dateTo')}</p>
								<input
									className="order-description"
									type="text"
									name="dateTo"
									defaultValue={dateToFilter || ''}
									onChange={(event) => {
										handleInput(event, /\D/g, setDateToFilter);
									}}
								/>
							</div>
						</div>
						<div className="order-card_filter">
							<div className="order-description_wrapper">
								<p className="order-description">{t('order:isNotReadyForSend')}</p>
								<input
									className="order-description"
									type="checkbox"
									name="isNotReadyForSend"
									defaultChecked={isReadyFilter}
									onChange={(event) => setIsReadyFilter(event.currentTarget.checked)}
								/>
							</div>
						</div>
						<div className="order-card_filter">
							<div className="order-description_wrapper">
								<p className="order-description">{t('order:status')}</p>
								<select
									className="order-description"
									defaultValue={statusFilter || undefined}
									onChange={(event) => setStatusFilter(event.target.value as OrderStatusEnum)}
								>
									{Object.values(OrderStatusEnum).map(value => (
										<option
											selected={!value}
											value={value}
											key={value}
										>{value}</option>
									))}
								</select>
							</div>
						</div>
					</div>
					<div className="send-btn_wrapper">
						<button onClick={filterButton} className="get-btn send-btn">{t('order:filter')}</button>
					</div>
				</div>
				{orderData?.orders && Object.keys(orderData?.orders).length && (Object.keys(orderData.orders)).map(key => (
					<div className="orders-wrapper" key={key}>
						<div className="order-title_wrapper">
							<div>
								<div className="wrapper-title">
									<img className="orders-cart" src="/icons/new-cart.svg" alt="cart icon" />
									<p className="process-title">{t(`order-status:${orderData.orders[key].order_status}`)}</p>
								</div>
								<p className="wrapper-title_description">{`ID: ${orderData.orders[key].short_ref}`}</p>
								<p
									className="wrapper-title_description">{`${t('order:accountEmail')}: ${orderData.orders[key].account_email}`}</p>
								<p
									className="wrapper-title_description">{`${t('order:accountUuid')}: ${orderData.orders[key].account_uuid}`}</p>
								{orderData.orders[key].sendAccountManager ? <p
									className="wrapper-title_description">{`${t('order:sendAccountManager')}: ${orderData.orders[key].sendAccountManager}`}</p> : ''}
								<p
									className="wrapper-title_description">{`${t('order:isPaid')}: ${t(`order:${orderData.orders[key].is_paid ? 'yes' : 'no'}`)}`}</p>
								{orderData.orders[key].track_number &&
									<p
										className="wrapper-title_description">{`${t('order:trackNumber')}: ${orderData.orders[key].track_number}`}</p>
								}
							</div>
						</div>
						<div className="order-card_wrapper">
							{orderData.orders[key].packages.map(value => (
								<div className="order-card" key={value.uuid}>
									<img className="order-image" src="/images/package-image.svg" alt="package-image" />
									<div className="order-description_wrapper">
										<p className="order-description">{t('order:warehouseId')}: {value.warehouse_id}</p>
										<p className="order-description_subtitle">{t('order:sender')}: {value.sender_name}</p>
										<p className="order-description_subtitle">{t('order:date')}: {value.format_date} UTC+0</p>
									</div>
								</div>
							))}
						</div>
						{orderData.orders[key].is_can_be_prepared_for_send ? <div className="send-btn_wrapper">
							<button onClick={() => isReadyButton(key)}
											className="get-btn send-btn">{t('order:canPreparedForSend')}</button>
						</div> : ''}
						{orderData.orders[key].is_for_consolidation ? <div>
							<div className="send-btn_wrapper">
								<button onClick={() => consolidateButton(key)}
												className="get-btn send-btn">{t('order:consolidate')}</button>
							</div>
							<div className="send-btn_wrapper">
								<button onClick={() => consolidateButton(key, true)}
												className="get-btn send-btn">{t('order:rejectConsolidation')}</button>
							</div>
						</div> : ''}
						{orderData.orders[key].print?.addressLabel ? <div className="send-btn_wrapper">
							<button
								onClick={() => redirectButton(`${process.env.NEXT_PUBLIC_CDN_HOST}/${orderData.orders[key].print.addressLabel}`)}
								className="get-btn send-btn">
								{t('order:addressLabel')}
							</button>
						</div> : ''}
						{orderData.orders[key].print?.customsDeclaration ? <div className="send-btn_wrapper">

							<button
								onClick={() => redirectButton(`${process.env.NEXT_PUBLIC_CDN_HOST}/${orderData.orders[key].print.customsDeclaration}`)}
								className="get-btn send-btn">
								{t('order:cn23')}
							</button>
						</div> : ''}
					</div>
				))}
				{orderData?.maxCountItems ? <div>
					<br></br>
					{isShowLoaderMoreBtn ? <Loader /> : <div className="lds-ellipsis_wrapper">
						<button className="get-btn more-order-btn" onClick={moreOrders}>{t('order:moreOrders')}</button>
					</div>}

				</div> : ''}
			</div>
		</div>
	</>;
};

Order.getLayout = function getLayout(page: ReactElement) {
	return (
		<RootLayout>
			{page}
		</RootLayout>
	);
};

export default Order;
