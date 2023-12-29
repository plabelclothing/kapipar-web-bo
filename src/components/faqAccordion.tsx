import { useState } from 'react';
import useTranslation from 'next-translate/useTranslation';

export function FaqAccordion(props: {index: number}) {
	const [faqStyleActive, setFaqStyleActive] = useState(false);
	const { t } = useTranslation();

	return (
		<div className='faq-accordion-wrapper' onClick={() => setFaqStyleActive(!faqStyleActive)}>
			<div className={faqStyleActive ? 'faq-accordion active' : 'faq-accordion'}>
				<h5>{t(`faq:question${props.index}`)}</h5>
				<div className='icon'></div>
			</div>
			<div className={faqStyleActive ? 'panel active' : 'panel'}>
				<p>
					{t(`faq:answer${props.index}`)}
				</p>
			</div>
		</div>
	);
}
