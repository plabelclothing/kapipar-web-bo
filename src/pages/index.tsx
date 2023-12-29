import type { NextPageWithLayout } from './_app';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const Index: NextPageWithLayout = () => {
	const router = useRouter();

	useEffect(() => {
		router.push('/profile');
	});

	return null;
};

export default Index;
