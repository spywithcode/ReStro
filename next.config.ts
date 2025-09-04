
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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
        port: '',
        pathname: '/**',
      }
    ],
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
    return config;
  },
};

export default nextConfig;
