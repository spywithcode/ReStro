
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["localhost", "re-stro.vercel.app", "api.qrserver.com"],
  },
  allowedDevOrigins: ["*.cloudworkstations.dev"],
  // Turbopack configuration
  turbopack: {
    // Explicitly set the root directory to resolve workspace detection issues
    root: process.cwd(),
  },
  webpack: (config) => {
    // camel-case versions of the packages need to be ignored by webpack so they
    // don't throw errors in dev mode.
    config.externals.push('p-limit');
    config.externals.push('p-throttle');
    // Ignore handlebars require.extensions
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    return config;
  },
};

export default nextConfig;