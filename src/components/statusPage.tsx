import Link from 'next/link';
import { useRouter } from 'next/router';

export default function StatusPage({ text }: { text: string }) {
	const router = useRouter();

	return (
		<>
			<div className='wrapper_register-main'>
				<div className='logo-image'>
					<Link href={`${router.basePath}/`} locale={router.locale}>
						<img className='logo' src='/icons/kapipar-logo.svg' alt='kapipar-logo' />
					</Link>
				</div>
				<div className='contact-information_wrapper'>
					<div className='contact-information_data'>
						<p className='register-description'>
							{text}
						</p>
					</div>
				</div>
			</div>
		</>
	);
}
