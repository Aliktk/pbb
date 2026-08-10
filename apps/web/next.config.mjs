/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Public site pages are Server Components - fast on 3G, indexable (Harness §2).
  // Media may come from Supabase Storage / Cloudinary - allow their hosts here per env.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  transpilePackages: ['@pbb/types'],
};

export default nextConfig;
