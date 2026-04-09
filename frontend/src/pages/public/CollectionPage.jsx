import React from 'react';
import Shop from './Shop';

const collectionConfigs = {
  bags: {
    categorySlugs: ['classic', 'mini', 'shoulder', 'evening'],
    seo: {
      en: { title: 'Bags | Melora Moda', description: 'Shop Melora Moda bag collections including classic, mini, shoulder, and evening styles.' },
      ar: { title: 'الحقائب | Melora Moda', description: 'تسوقي قسم الحقائب من Melora Moda واكتشفي الحقائب الكلاسيك والميني والكتف والسهرات.' },
      tr: { title: 'Cantalar | Melora Moda', description: 'Melora Moda canta koleksiyonunda klasik, mini, omuz ve gece modellerini kesfedin.' },
    },
    hero: {
      en: { title: 'Our Bags', intro: 'A focused edit of Melora bags, curated for daily elegance and occasion dressing.' },
      ar: { title: 'قسم الحقائب', intro: 'تشكيلة مركزة من حقائب Melora المختارة للإطلالات اليومية والمناسبات الخاصة.' },
      tr: { title: 'Canta Koleksiyonu', intro: 'Gunluk siklik ve ozel davetler icin secilmis Melora canta koleksiyonu.' },
    },
    canonicalPath: '/bags',
  },
  watches: {
    categorySlugs: ['watches'],
    seo: {
      en: { title: 'Watches | Melora Moda', description: 'Explore Melora Moda watches with refined styles and elegant details.' },
      ar: { title: 'الساعات | Melora Moda', description: 'اكتشفي قسم الساعات في Melora Moda بتفاصيل أنيقة وتصاميم راقية.' },
      tr: { title: 'Saatler | Melora Moda', description: 'Melora Moda saat koleksiyonunu zarif detaylarla kesfedin.' },
    },
    hero: {
      en: { title: 'Our Watches', intro: 'Elegant watches selected to elevate everyday looks with a polished finish.' },
      ar: { title: 'قسم الساعات', intro: 'ساعات أنيقة مختارة لتكمّل إطلالتك اليومية بلمسة راقية.' },
      tr: { title: 'Saat Koleksiyonu', intro: 'Gunluk stili tamamlayan zarif saat seckisi.' },
    },
    canonicalPath: '/watches',
  },
  perfumes: {
    categorySlugs: ['perfumes'],
    seo: {
      en: { title: 'Perfumes | Melora Moda', description: 'Discover Melora Moda perfumes selected for lasting impressions and elegant taste.' },
      ar: { title: 'العطور | Melora Moda', description: 'اكتشفي عطور Melora Moda المختارة لتمنحك حضورًا أنيقًا وأثرًا يدوم.' },
      tr: { title: 'Parfumler | Melora Moda', description: 'Kalici etki ve zarif zevk icin secilen Melora Moda parfumlerini kesfedin.' },
    },
    hero: {
      en: { title: 'Our Perfumes', intro: 'Signature fragrances chosen to leave a refined and memorable impression.' },
      ar: { title: 'قسم العطور', intro: 'عطور مختارة بعناية لتترك أثرًا ناعمًا وراقيًا.' },
      tr: { title: 'Parfum Koleksiyonu', intro: 'Zarif ve akilda kalan bir etki icin secilen imza kokular.' },
    },
    canonicalPath: '/perfumes',
  },
  glasses: {
    categorySlugs: ['glasses', 'sunglasses'],
    seo: {
      en: { title: 'Glasses | Melora Moda', description: 'Shop Melora Moda glasses and sunglasses with curated modern styles.' },
      ar: { title: 'النظارات | Melora Moda', description: 'تسوقي نظارات Melora Moda الشمسية والطبية بتصاميم مختارة وعصرية.' },
      tr: { title: 'Gozlukler | Melora Moda', description: 'Melora Moda gunes gozlukleri ve gozluk seckisini kesfedin.' },
    },
    hero: {
      en: { title: 'Our Glasses', intro: 'Curated eyewear with clean lines, strong silhouettes, and a polished look.' },
      ar: { title: 'قسم النظارات', intro: 'نظارات مختارة بخطوط أنيقة وتصاميم تعطي حضورًا عصريًا ومرتبًا.' },
      tr: { title: 'Gozluk Koleksiyonu', intro: 'Net cizgiler ve guclu siluetlerle secilen gozluk koleksiyonu.' },
    },
    canonicalPath: '/glasses',
  },
};

const CollectionPage = ({ collectionKey }) => {
  const config = collectionConfigs[collectionKey];
  if (!config) return <Shop />;

  return (
    <Shop
      categorySlugs={config.categorySlugs}
      seo={config.seo}
      heroCopy={config.hero}
      canonicalPath={config.canonicalPath}
    />
  );
};

export default CollectionPage;
