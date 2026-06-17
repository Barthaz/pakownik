import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, seo } from './config';

export function webApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    url: SITE_URL,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web, iOS, Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'PLN',
    },
    description: seo.defaultDescription,
    image: DEFAULT_OG_IMAGE,
    inLanguage: 'pl-PL',
    featureList: [
      'Lista pakowania na wyjazd',
      'Profile członków rodziny',
      'Kategorie i ilości rzeczy',
      'Postęp pakowania walizki',
      'Udostępnianie list po e-mailu',
    ],
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: DEFAULT_OG_IMAGE,
    description: seo.defaultDescription,
  };
}
