import type { Route } from './+types/home';
import { useParams } from 'react-router';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { useTranslation } from 'react-i18next';
import { defaultLng, supportedLngs } from '@/i18n/config';
import { AboutCta } from '@/components/about/Cta';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'AskAric' },
    { name: 'description', content: 'Welcome to AskAric!' },
  ];
}

export default function Home() {
  const { t } = useTranslation();
  const { lang: paramLang } = useParams();
  const lang =
    typeof paramLang === 'string' &&
    supportedLngs.includes(paramLang as (typeof supportedLngs)[number])
      ? paramLang
      : defaultLng;
  return (
    <>
      <Header />
      <main className="flex-1">
        <AboutCta
          title={t('cta.title')}
          description={t('cta.description')}
          buttonText={t('cta.button')}
          href={`/${lang}/tihc`}
        />
      </main>
      <Footer />
    </>
  );
}
