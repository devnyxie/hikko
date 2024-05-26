/** @type {import('next').NextConfig} */

const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Custom Webpack's watch options
      config.watchOptions = {
        aggregateTimeout: 300, // Debounce delay of 300ms
      };
    }

    return config;
  },
};

export default nextConfig;
