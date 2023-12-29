import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

export default function ReadMoreButton() {
	const router = useRouter();
	const { t } = useTranslation();

	const readMoreButton = () => {
		return router.push('/how-it-works');
	};

	return (
		<>
			<button onClick={readMoreButton} className='read-more'>
				{t('index:readMore')}
				<img src='/images/arrow-right.png' alt='' className='arrows' />
			</button>
		</>
	);
}
