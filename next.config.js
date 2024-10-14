/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: false,
    images: {
      domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
    },
    webpack: (config) => {
        config.module.rules.push(
          {
            test: /\.handlebars$/,
            loader: 'handlebars-loader',
          }
        );
    
        return config;
    },
}

module.exports = nextConfig