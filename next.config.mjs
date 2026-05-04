/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {    const cspScriptSrcDirectives = ["'self'", "'unsafe-inline'"];
    // Geliştirme ortamında Next.js'in hızlı yenileme gibi özellikleri için 'unsafe-eval' gerekebilir.
    // Üretim ortamında bu kaldırılır.
    if (process.env.NODE_ENV === 'development') {
      cspScriptSrcDirectives.push("'unsafe-eval'");
    }

    // CSP başlığını oluştururken satır sonlarını ve fazla boşlukları temizle
    const cspHeader = `
      default-src 'self';
      script-src ${cspScriptSrcDirectives.join(' ')};
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: *;
      font-src 'self' data:;
      connect-src 'self';
      frame-src 'self' *.youtube.com youtube.com youtu.be *.youtu.be;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      upgrade-insecure-requests;
      block-all-mixed-content;
    `.replace(/\n/g, ' ').replace(/\s{2,}/g, ' ').trim();

    return [
      {
        source: '/:path*', // Tüm yollara uygula
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN', // Sitenizin iframe içinde gömülmesini engeller (kendi siteniz hariç)
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block', // Eski tarayıcılar için XSS koruması (CSP daha moderndir)
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            // Örnek: Kamera, mikrofon gibi hassas API'lere erişimi kısıtla
            value: "camera=(), microphone=(), geolocation=(), payment=()", 
          }
        ],
      },
    ];
  }
};

export default nextConfig;
