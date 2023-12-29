import React, {useEffect, useState} from 'react';
import styles from '@/styles/RootLayout.module.css';
import Header from '@/components/header';
import {GetUserInterface, GetUserSimpleDataInterface} from '@/interfaces';
import {AbortControllerUtil} from '@/utils';
import {useRouter} from 'next/router';

export default function RootLayout({children}: { children: React.ReactNode }) {
    const router = useRouter();
    const [userData, setUserData] = useState<GetUserSimpleDataInterface | {}>({});
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const abortControllerUtil = new AbortControllerUtil();

            const abortControllerUtilRootLayout = abortControllerUtil.init();

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/v1/account-manager/`, {
                    signal: abortControllerUtilRootLayout.controllerTimeOut.signal,
                });

                if (!response.ok) {
                    throw response;
                }

                const resJson: GetUserInterface = await response.json();

                setUserData(resJson.data);
            } catch (e) {
                setUserData({});
                return router.push('/signin');
            } finally {
                clearTimeout(abortControllerUtilRootLayout.timeoutId);
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
            <div className={styles.wrapper}>
                <Header/>
                {children}
            </div>
        </>
    );
}

