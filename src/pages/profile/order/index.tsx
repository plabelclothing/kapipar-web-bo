import type { ReactElement } from 'react';
import RootLayout from '@/components/rootLayout';
import type { NextPageWithLayout } from '../../_app';
import { AsideProfile } from '@/components/asideProfile';
import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import { GetOrderInterface, GetOrderInterfaceData } from '@/interfaces/get-order.interface';
import { AbortControllerUtil } from '@/utils';
import Loader from '@/components/loader';
import Link from 'next/link';
import { useRouter } from 'next/router';
const Order: NextPageWithLayout = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const [userData, setUserData] = useState<GetOrderInterfaceData | null>(null);
	const [isReady, setIsReady] = useState(false);
	const [isShowLoaderMoreBtn, setIsShowLoaderMoreBtn] = useState(false);
	const [uuidForConsolidation, setUuidForConsolidation] = useState<string[]>([]);

	useEffect(() => {
		const fetchData = async () => {
			const abortControllerUtil = new AbortControllerUtil();

			const abortControllerUtilRootLayout = abortControllerUtil.init();

			try {
				const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/v1/order`, {
					signal: abortControllerUtilRootLayout.controllerTimeOut.signal,
				});

				if (!response.ok) {
					throw response;
				}

				const resJson: GetOrderInterface = await response.json();

				setUserData(resJson.data);
			} catch (e) {
				setUserData(null);
			} finally {
				clearTimeout(abortControllerUtilRootLayout.timeoutId);
				setIsReady(true);
			}
		};

		fetchData().catch((e) => {
		});
	}, []);

	const moreOrders = async () => {
		if (!userData?.lastUuid) {
			return;
		}

		setIsShowLoaderMoreBtn(true);

		const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/v1/order?uuid=${userData.lastUuid}`);

		if (!response.ok) {
			throw response;
		}

		try {
			const resJson: GetOrderInterface = await response.json();

			if (!resJson?.data?.orders) {
				return;
			}

			setUserData({
				lastUuid: resJson.data.lastUuid,
				maxCountItems: resJson.data.maxCountItems,
				countItems: resJson.data.countItems,
				orders: {
					...userData.orders,
					...resJson.data.orders,
				},
			});
		} catch (e) {
		} finally {
			setIsShowLoaderMoreBtn(false);
		}
	};

	const consolidateBtn = async () => {
		if (!uuidForConsolidation.length || uuidForConsolidation.length === 1) {
			return;
		}

		try {
			setIsReady(false);

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/v1/order/consolidate`, {
				method: 'POST',
				credentials: 'same-origin',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					uuid: uuidForConsolidation,
				}),
			});

			if (!response.ok) {
				throw response;
			}

			return router.reload();
		} catch (e) {
		} finally {
			setIsReady(true);
		}
	};

	const selectOrdersForConsolidation = (isConsolidate: boolean, uuid: string) => {
		if (!isConsolidate && uuidForConsolidation.includes(uuid)) {
			setUuidForConsolidation(uuidForConsolidation.filter(element => element !== uuid));
			return;
		}

		if (uuidForConsolidation.includes(uuid)) {
			return;
		}

		setUuidForConsolidation([...uuidForConsolidation, uuid]);
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
		<div className='main_tracker_profile'>
			<AsideProfile />
			<div className='right-side_order'>
				<h2 className='my-order_title'>{t('order:myOrders')}</h2>
				{userData?.orders && Object.keys(userData?.orders).length ?
					<button className='get-btn consolidate-btn' onClick={consolidateBtn}>{t('order:consolidate')}</button> : ''}

				{userData?.orders && Object.keys(userData?.orders).length && (Object.keys(userData.orders)).map(key => (
					<div className='orders-wrapper' key={key}>
						<div className='order-title_wrapper'>
							<div>
								<div className='wrapper-title'>
									<img className='orders-cart' src='/icons/new-cart.svg' alt='cart icon' />
									<p className='process-title'>{t(`order-status:${userData.orders[key].order_status}`)}</p>
								</div>
								<p className='wrapper-title_description'>{`ID: ${userData.orders[key].short_ref}`}</p>
								{userData.orders[key].track_number &&
									<p className='wrapper-title_description'>{`${t('order:trackNumber')}: ${userData.orders[key].track_number}`}</p>}
							</div>
							{userData.orders[key].is_can_consolidate ? <div className='parcel-combine'>
								<p className='consolidate-title'>{t('order:select')}</p>
								<input
									className='combine-btn'
									id='consolidate'
									type='checkbox'
									onChange={(event) => {
										selectOrdersForConsolidation(event.currentTarget.checked, key);
									}}
								/>
							</div> : ''}
						</div>
						<div className='order-card_wrapper'>
							{userData.orders[key].packages.map(value => (
								<div className='order-card' key={value.uuid}>
									<img className='order-image' src='/images/package-image.svg' alt='package-image' />
									<div className='order-description_wrapper'>
										<p className='order-description'>{t('order:sender')}: {value.sender_name}</p>
										<p className='order-description_subtitle'>{t('order:date')}: {value.format_date} UTC+0</p>
										<div className='description-btn_wrapper'>
											<Link href={`${router.basePath}/profile/package?uuid=${value.uuid}`} locale={router.locale}>
												<button className='description-btn_line_card'>{t('order:details')}</button>
											</Link>
										</div>
									</div>
								</div>
							))}
						</div>
						{userData.orders[key].is_can_send ? <div className='send-btn_wrapper'>
							<Link href={`${router.basePath}/profile/order-confirm?uuid=${key}`} locale={router.locale}>
								<button className='get-btn send-btn'>{t('order:sendPackage')}</button>
							</Link>
						</div> : ''}
					</div>
				))}
				{userData?.maxCountItems ? <div>
					<br></br>
					{isShowLoaderMoreBtn ? <Loader /> : <div className='lds-ellipsis_wrapper'>
						<button className='get-btn more-order-btn' onClick={moreOrders}>{t('order:moreOrders')}</button>
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
