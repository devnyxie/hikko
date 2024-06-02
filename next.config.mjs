/** @type {import('next').NextConfig} */

const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Custom Webpack's watch options
      config.watchOptions = {
        aggregateTimeout: 400, // Debounce delay of 300ms
        poll: 100, // Enable polling mode
      };
    }
    return config;
  },
  compiler: {
    styledComponents: true,
  },
};

export default nextConfig;
