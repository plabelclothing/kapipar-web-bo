import Link from 'next/link';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

export default function ProfileHeaderLinks({ isAuthorized, setNavbar }: {
	isAuthorized: boolean,
	setNavbar: (isActive: boolean) => void
}) {
	const router = useRouter();
	const { t } = useTranslation();

	if (isAuthorized) {
		return (
			<>
				<Link href={`${router.basePath}/profile`} locale={router.locale}>
					<button onClick={() => setNavbar(false)} className='get-btn menu-btn'>{t('common:profile')}</button>
				</Link>
				<Link href={`${router.basePath}/profile/order`} locale={router.locale}>
					<button onClick={() => setNavbar(false)} className='get-btn menu-btn'>{t('common:myOrders')}</button>
				</Link>
			</>
		);
	}

	return (
		<>
			<Link href={`${router.basePath}/signin`} locale={router.locale}>
				<button onClick={() => setNavbar(false)} className='get-btn menu-btn'>{t('common:signIn')}</button>
			</Link>
			<Link href={`${router.basePath}/signup`} locale={router.locale}>
				<button onClick={() => setNavbar(false)} className='get-btn menu-btn'>{t('common:signUp')}</button>
			</Link>
		</>
	);
}
