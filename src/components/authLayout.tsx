import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AbortControllerUtil } from '@/utils';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			const abortControllerUtil = new AbortControllerUtil();

			const abortControllerUtilAuthLayout = abortControllerUtil.init();

			try {
				const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/v1/account-manager/`, {
					signal: abortControllerUtilAuthLayout.controllerTimeOut.signal,
				});

				if (!response.ok) {
					throw response;
				}

				await router.push('/profile');
			} catch (e) {
				clearTimeout(abortControllerUtilAuthLayout.timeoutId);
				setIsReady(true);
			}
		};

		fetchData().catch((e) => {
		});
	}, []);

	if (!isReady) {
		return (
			<>
			</>
		);
	}

	return (
		<>
			{children}
		</>
	);
}

