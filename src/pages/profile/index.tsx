import {ReactElement, useEffect, useState} from 'react';
import RootLayout from '@/components/rootLayout';
import type {NextPageWithLayout} from '../_app';
import useTranslation from 'next-translate/useTranslation';
import Loader from '@/components/loader';
import {GetUserInterface, GetUserSimpleDataInterface} from '@/interfaces';
import {AbortControllerUtil} from '@/utils';
import {AsideProfile} from '@/components/asideProfile';
import Head from 'next/head';

const Profile: NextPageWithLayout = () => {
    const {t} = useTranslation();
    const [isReady, setIsReady] = useState(false);
    const [userData, setUserData] = useState<GetUserSimpleDataInterface | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const abortControllerUtil = new AbortControllerUtil();

            const abortControllerUtilRootLayout = abortControllerUtil.init();

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/v1/account-manager`, {
                    signal: abortControllerUtilRootLayout.controllerTimeOut.signal,
                });

                if (!response.ok) {
                    throw response;
                }

                const resJson: GetUserInterface = await response.json();

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

    if (!isReady) {
        return (
            <>
                <Loader/>
                <br></br>
                <br></br>
            </>
        );
    }

    return <>
        <Head>
            <title>{t('common:profile')}</title>
        </Head>
        <div className='main_tracker_profile'>
            <AsideProfile/>
            <div className='right-side_profile'>
                <h2 className='profile-title'>{t('profile:profile')}</h2>
                <div className='profile-information'>
                    <div className='profile-photo'>
                        <div className='photo-circle'>
                            <img className='user-photo' src='/icons/profile-icon.svg' alt=''/>
                        </div>
                        <p className='profile-name'>{userData?.name}</p>
                    </div>
                    <div className="profile-email">
                        <p className="email-title"><span className="highlight">{t('profile:email')}</span>{userData?.email}</p>
                    </div>
                    <div className="profile-email">
                        <p className="email-title"><span className="highlight">{t('profile:id')}</span>{userData?.uuid}</p>
                    </div>
                </div>
            </div>
        </div>
    </>;
};

Profile.getLayout = function getLayout(page: ReactElement) {
    return (
        <RootLayout>
            {page}
        </RootLayout>
    );
};

export default Profile;
