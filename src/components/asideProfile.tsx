import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';
import { useRouter } from 'next/router';

export function AsideProfile() {
	const { t } = useTranslation();
	const router = useRouter();

	const logoutButton = async () => {
		try {
			await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/v1/account-manager/signout`, {
				method: 'GET',
				credentials: 'same-origin',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			return router.reload();
		} catch (e) {
		}
	};

	return (
		<aside className='left-side_profile'>
			<Link href={`${router.basePath}/profile`} locale={router.locale}
						className='profile-link'>
				<img className='profile-link_icon' src='/icons/profile-icon.svg'
						 alt='profile-icon' />
				{t('profile:profile')}
			</Link>
			<Link href={`${router.basePath}/profile/order-add`} locale={router.locale}
				  className='profile-link'>
				<img className='profile-link_icon' src='/icons/order-icon.svg'
					 alt='order-icon' />
				{t('profile:addOrder')}
			</Link>
			<Link href={`${router.basePath}/profile/order`} locale={router.locale}
						className='profile-link'>
				<img className='profile-link_icon' src='/icons/order-icon.svg'
						 alt='order-icon' />
				{t('profile:myOrders')}
			</Link>
			<Link href={`${router.basePath}`} locale={router.locale} onClick={logoutButton}
						className='profile-link'>
				<img className='profile-link_icon' src='/icons/logout-icon.svg'
						 alt='logout-icon' />
				{t('profile:logOut')}
			</Link>
		</aside>
	);
}
