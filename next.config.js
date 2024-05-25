/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: false,
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