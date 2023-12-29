import {useState} from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';

export default function Header() {
    const router = useRouter();
    const [navbarActive, setNavbarActive] = useState(false);
    const {t} = useTranslation();

    const persistLocaleCookie = (locale: string) => {
        const date = new Date();
        const expireMs = 100 * 24 * 60 * 60 * 1000; // 100 days
        date.setTime(date.getTime() + expireMs);
        document.cookie = `NEXT_LOCALE=${locale};expires=${date.toUTCString()};path=/`;
    };

    return <header className='header'>
        <div className='header-wrapper'>
            <Link href={`${router.basePath}/profile`} locale={router.locale}>
                <img className='header-logo' src='/icons/kapipar-logo.svg' alt='kapipar-logo'/>
            </Link>
            <div>
                <div onClick={() => setNavbarActive(!navbarActive)}
                     className={navbarActive ? 'menu-icon active' : 'menu-icon'}>
                    <span/>
                </div>
                <div className={navbarActive ? 'menu-body_wrapper active' : 'menu-body_wrapper'}>
                    <nav className='menu-body'>
                        <ul className='menu-list'>
                            <li>
								<span
                                    className='menu-link menu-arrow_icon clickable-touch'>{router.locale?.toUpperCase()}
                                    <span className='burger-arrow'/>
								</span>
                                <ul className='menu-sub_list menu-sub_small'>
                                    {router.locales?.map((locale) => (
                                        locale === 'default' ? '' :
                                            <li onClick={() => persistLocaleCookie(locale)} key={locale}><Link
                                                className='menu-sub_link'
                                                href={router.asPath}
                                                locale={locale}>{locale.toUpperCase()}</Link>
                                            </li>
                                    ))}
                                </ul>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    </header>;
}
