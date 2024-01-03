import { ChangeEvent, ReactElement, useEffect, useState } from 'react';
import RootLayout from '@/components/rootLayout';
import type { NextPageWithLayout } from '../../_app';
import useTranslation from 'next-translate/useTranslation';
import Loader from '@/components/loader';
import { AbortControllerUtil, handleInput, SplitCustomsDetailsUtil } from '@/utils';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
	ReqOrderAddInterface, ResOrderAddInterface,
} from '@/interfaces/order-add.interface';
import { GetWarehouseInterface, GetWarehouseInterfaceData } from '@/interfaces';
import imageCompression from 'browser-image-compression';
import process from 'process';

const OrderConfirm: NextPageWithLayout = () => {
	const { t } = useTranslation();
	const router = useRouter();
	const [arrWarehouse, setArrWarehouse] = useState<GetWarehouseInterfaceData[]>([]);
	const [accountWarehouseShortRef, setAccountWarehouseShortRef] = useState<string>('');
	const [isReady, setIsReady] = useState(false);
	const [isAccountWarehouseShortRefExist, setIsAccountWarehouseShortRefExist] = useState(false);
	const [warehouseUuid, setWarehouseUuid] = useState('');
	const [senderName, setSenderName] = useState('');
	const [l, setL] = useState<string | null>(null);
	const [w, setW] = useState<string | null>(null);
	const [h, setH] = useState<string | null>(null);
	const [packageWeight, setPackageWeight] = useState<string | null>(null);
	const [customDetails, setCustomDetails] = useState('');
	const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

	useEffect(() => {
		const abortControllerUtil = new AbortControllerUtil();
		const abortControllerUtilWarehouse = abortControllerUtil.init();

		const fetchData = async () => {
			try {
				const responseActiveCountry = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/v1/common/warehouse`, {
					signal: abortControllerUtilWarehouse.controllerTimeOut.signal,
				});

				if (!responseActiveCountry.ok) {
					throw responseActiveCountry;
				}

				const responseWarehouseJson: GetWarehouseInterface = await responseActiveCountry.json();

				setArrWarehouse(responseWarehouseJson.data);
				setWarehouseUuid(responseWarehouseJson.data[0].uuid);
			} catch (e) {
			} finally {
				clearTimeout(abortControllerUtilWarehouse.timeoutId);
				setIsReady(true);
			}
		};

		fetchData().catch((e) => {
		});
	}, []);

	const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (files) {
			const newFiles: string[] = [];

			for (let i = 0; i < Math.min(files.length, 3); i++) {
				const file = files[i];
				try {
					const compressedFile = await compressImage(file);
					newFiles.push(compressedFile);
				} catch (e: any) {
					alert(e.message);
					setSelectedFiles([]);
					return;
				}
			}
			//BHJQCDVEA0
			setSelectedFiles(newFiles);
		}
	};

	const compressImage = async (file: File) => {
		const options = {
			maxSizeMB: 0.7,
			maxWidthOrHeight: 800,
		};

		try {
			const compressedFile = await imageCompression(file, options);
			return await convertBlobToBase64(compressedFile);
		} catch (error) {
			throw new Error(`Compression image error`);
		}
	};

	const convertBlobToBase64 = (blob: Blob) => {
		return new Promise<string>((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => {
				if (typeof reader.result === 'string') {
					const base64String = reader.result.split(',')[1];
					resolve(base64String);
				} else {
					reject(new Error('Compression image error to base64'));
				}
			};
			reader.readAsDataURL(blob);
		});
	};

	const addButton = async () => {
		try {
			window.scrollTo({
				top: 0,
				behavior: 'smooth',
			});
			// check required data
			if (!accountWarehouseShortRef ||
				!warehouseUuid ||
				!senderName ||
				!l ||
				!h ||
				!w ||
				!packageWeight ||
				!customDetails ||
				!selectedFiles.length
			) {
				alert(`Complete all form fields`);
				return;
			}

			setIsReady(false);

			const customsDetailsParsed = SplitCustomsDetailsUtil(customDetails);

			if (!customsDetailsParsed.length) {
				throw new Error(`Customs details array is empty`);
			}

			if (!customsDetailsParsed[0].content || !customsDetailsParsed[0].count) {
				throw new Error(`Customs details content or count is empty`);
			}

			const body: ReqOrderAddInterface = {
				accountWarehouseShortRef,
				warehouseUuid,
				senderName,
				images: selectedFiles,
				size: {
					l: Number(l),
					h: Number(h),
					w: Number(w),
					weight: Number(packageWeight),
				},
				customsDetails: {
					content: customsDetailsParsed[0].content,
					count: customsDetailsParsed[0].count,
				},
			};

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/v1/order/`, {
				method: 'POST',
				credentials: 'same-origin',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			});

			if (!response.ok) {
				throw response;
			}

			const responseJson: ResOrderAddInterface = await response.json();

			alert(`Warehouse ID: ${responseJson.data.warehouseId}`);

			return router.reload();
		} catch (e: any) {
			alert(`Add a new order error - ${JSON.stringify(e.message)}`);
		} finally {
			setIsReady(true);
		}
	};

	const checkExistAccountWarehouseShortRef = async (value: string) => {
		if (!value) {
			return;
		}

		setIsReady(false);

		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/v1/account/warehouse-manager/${value}`, {
				method: 'GET',
				credentials: 'same-origin',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				throw response;
			}

			const resJson: GetWarehouseInterface = await response.json();

			if (!resJson.data.length) {
				throw new Error(`accountWarehouseShortRef ${value} isn't exist!`);
			}

			setAccountWarehouseShortRef(value);
			setIsAccountWarehouseShortRefExist(true);
		} catch (e: any) {
			setIsAccountWarehouseShortRefExist(false);
			setIsReady(true);
			setAccountWarehouseShortRef('');
			alert(`Check exist accountWarehouseShortRef error - ${JSON.stringify(e.statusText || e.message)}`);
		} finally {
			setIsReady(true);
		}
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
			<title>{t('common:orderAdd')}</title>
		</Head>
		<section className="main_calculator">
			<div className="title-wrapper_calculator">
				<h1 className="calculator-title_main">{t('common:orderAdd')}</h1>
			</div>
			<div className="calculator-payment-wrapper">
				<div className="owner-information">
					<div className="block-1_wrapper">
						<div className="owner-country_wrapper">
							<h4 className="owner-title">{t('order-add:accountWarehouseShortRef')}*</h4>
							<input
								className="add-order-input"
								type="text"
								name="warehouseShosrRef"
								defaultValue={accountWarehouseShortRef}
								onBlur={(event) => {
									handleInput(event, /[^a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\/\-=' ]*$/g, checkExistAccountWarehouseShortRef);
								}}
							/>
						</div>
					</div>
					{!isAccountWarehouseShortRefExist ? '' :
						<>
							<div className="block-1_wrapper">
								<div className="owner-country_wrapper">
									<h4 className="owner-title">{t('order-add:accountWarehouseUuid')}*</h4>
									<select
										className="owner-input"
										defaultValue={warehouseUuid}
										onChange={(event) => {
											setWarehouseUuid(event.target.value);
										}}
									>
										{arrWarehouse.map(value => (
											<option
												value={value.uuid}
												key={value.uuid}
											>{value.name}</option>
										))}
									</select>
								</div>
							</div>
							<div className="block-1_wrapper">
								<div className="owner-country_wrapper">
									<h4 className="owner-title">{t('order-add:senderName')}*</h4>
									<input
										className="add-order-input"
										type="text"
										name="senderName"
										defaultValue={senderName}
										onChange={(event) => {
											handleInput(event, /[^a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\/\-=' ]*$/g, setSenderName);
										}}
									/>
								</div>
							</div>
							<h4 className="package-title">{t('order-add:enterSizes')}*</h4>
							<div className="package-insure_accardion">
								<div className="shipping-size_wrapper">
									<div className="panel show">
										<div className="size-table_wrapper">
											<p className="size-table_title">L</p>
											<input
												className="size-table_input"
												type="text"
												defaultValue={l || ''}
												onChange={(event) => {
													handleInput(event, /\D/g, setL);
												}}
											/>
											<p className="size-table_title">W</p>
											<input
												className="size-table_input"
												type="text"
												defaultValue={w || ''}
												onChange={(event) => {
													handleInput(event, /\D/g, setW);
												}}
											/>
											<p className="size-table_title">H</p>
											<input
												className="size-table_input"
												type="text"
												defaultValue={h || ''}
												onChange={(event) => {
													handleInput(event, /\D/g, setH);
												}}
											/>
											<p className="size-table_title">Weight</p>
											<input
												className="size-table_input"
												type="text"
												defaultValue={packageWeight || ''}
												onChange={(event) => {
													handleInput(event, /\D/g, setPackageWeight);
												}}
											/>
										</div>
									</div>
								</div>
							</div>
							<br />
							<div className="block-1_wrapper">
								<div className="owner-country_wrapper">
									<h4 className="owner-title">{t('order-add:customDetails')}*</h4>
									<input
										className="add-order-input"
										type="text"
										name="customDetails"
										defaultValue={customDetails}
										onChange={(event) => {
											handleInput(event, /[^a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\/\-=' ]*$/g, setCustomDetails);
										}}
									/>
								</div>
							</div>
							<div className="block-1_wrapper">
								<div className="owner-country_wrapper">
									<input type="file" accept="image/jpeg" multiple onChange={handleFileChange} />
								</div>
							</div>
							<br />
							<button
								className="get-btn calculator-btn"
								onClick={addButton}
							>
								{t('order-add:addOrder')}
							</button>
						</>
					}
				</div>
			</div>
		</section>
	</>;
};

OrderConfirm.getLayout = function getLayout(page: ReactElement) {
	return (
		<RootLayout>
			{page}
		</RootLayout>
	);
};

export default OrderConfirm;
