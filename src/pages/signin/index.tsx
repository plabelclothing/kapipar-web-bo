import type {ReactElement} from 'react';
import type {NextPageWithLayout} from '../_app';
import Link from 'next/link';
import {useRouter} from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import {useState} from 'react';
import AuthLayout from '@/components/authLayout';
import Head from 'next/head';

const Signin: NextPageWithLayout = () => {
    const router = useRouter();
    const {t} = useTranslation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [translates, setTranslates] = useState({
        email: t('signin:email'),
        password: t('signin:password'),
    });
    const [isDisableInputs, setIsDisableInputs] = useState(false);

    const checkEmail = (value: string) => {
        const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const validateRes = pattern.test(value);

        if (!validateRes) {
            setTranslates({
                ...translates,
                email: t('signin:checkEmail'),
            });
            setEmail('');
            return;
        }

        setTranslates({
            ...translates,
            email: t('signin:email'),
        });
        setEmail(value);
    };

    const checkPass = (value: string) => {
        if (!value.trim()) {
            setTranslates({
                ...translates,
                password: t('signin:checkPassword'),
            });
            setPassword('');
            return;
        }

        setTranslates({
            ...translates,
            password: t('signin:password'),
        });
        setPassword(value);
    };

    const loginButton = async () => {
        if (!email || !password) {
            return;
        }

        setIsDisableInputs(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/v1/account-manager/signin`, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            if (!response.ok) {
                throw response;
            }

            return router.push('/profile');
        } catch (e) {
            setIsDisableInputs(false);
            setTranslates({
                ...translates,
                password: t('signin:checkPassword'),
                email: t('signin:checkEmail'),
            });
        }
    };

    return <>
        <Head>
            <title>{t('common:signIn')}</title>
        </Head>
        <div className='wrapper_login-main'>
            <div className='logo-image'>
                <Link href={`${router.basePath}/`} locale={router.locale}>
                    <img className='logo' src='/icons/kapipar-logo.svg' alt='kapipar-logo'/>
                </Link>
            </div>
            <div className='login-wrapper'>
                <div className='login'>
                    <h4 className='login-title'>{t('signin:loginTitle')}</h4>
                    <div className='login-window'>
                        <p className='login-window_title'>{translates.email}</p>
                        <input
                            className='login-input'
                            type='email'
                            disabled={isDisableInputs}
                            onBlur={(event) => {
                                checkEmail(event.currentTarget.value);
                            }}
                        />
                        <p className='login-window_title'>{translates.password}</p>
                        <input
                            className='login-input'
                            type='password'
                            disabled={isDisableInputs}
                            onBlur={(event) => {
                                checkPass(event.currentTarget.value);
                            }}
                        />
                        <button className='get-btn login-btn' onClick={loginButton}>{t('common:login')}</button>
                    </div>
                </div>
            </div>
        </div>
    </>;
};

Signin.getLayout = function getLayout(page: ReactElement) {
    return (
        <AuthLayout>
            {page}
        </AuthLayout>
    );
};

export default Signin;
