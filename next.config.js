const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
/** @typedef { import('webpack/types').Configuration} WebpackConfig */

const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    swcMinify: false,

    experimental: {
        swcMinifyDebugOptions: {
            mangle: {
                keep_classnames: true,
                keep_fnames: true,
            },
            compress: {
                defaults: false,
                side_effects: false
            },
        },
    },

    /**
     * @param {WebpackConfig} config
     * @param isServer
     * @returns WebpackConfig
     */
    webpack: (config, {isServer}) => {
        if (!isServer) {
            config.resolve.fallback = {
                fs: false,
                'graceful-fs': false,
            };
        }

        config.ignoreWarnings = [
            /mongodb/,
            /mssql/,
            /mysql/,
            /mysql2/,
            /oracledb/,
            /pg/,
            /pg-native/,
            /pg-query-stream/,
            /react-native-sqlite-storage/,
            /redis/,
            /sqlite3/,
            /typeorm-aurora-data-api-driver/
        ];

        return config;
    }
};

module.exports = nextConfig;
