import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  // Temel URL'nizi buraya ekleyin
  const baseUrl = 'https://zamanyonetimi.com';

  // Şimdilik sadece ana sayfayı ekliyoruz.
  // Dinamik sayfalarınız veya diğer statik sayfalarınız varsa, bunları da buraya ekleyebilirsiniz.
  const staticRoutes = [
    '/', // Ana sayfa
    // Örnek: '/hakkimizda',
    // Örnek: '/iletisim',
  ];

  const sitemapEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: lastModified,
    changeFrequency: 'weekly', // Sayfanın ne sıklıkta değiştiğini belirtebilirsiniz
    priority: route === '/' ? 1.0 : 0.8, // Sayfanın önemini belirtebilirsiniz
  }));
 
  return sitemapEntries;
}
