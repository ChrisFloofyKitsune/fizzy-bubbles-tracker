const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
/** @typedef { import('webpack/types').Configuration} WebpackConfig */

const isProd = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,

  experimental: {
    swcMinifyDebugOptions: {
      mangle: {
        keep_classnames: true,
        keep_fnames: true,
      },
      compress: {
        defaults: false,
        side_effects: false,
      },
    },
  },

  /**
   * @param {WebpackConfig} config
   * @param isServer
   * @returns WebpackConfig
   */
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        // path: false,
        // "graceful-fs": false,
      };
    }

    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: path.join(
              __dirname,
              `node_modules/sql.js/dist/sql-wasm${!isProd ? "-debug" : ""}.wasm`
            ),
            to: path.join(__dirname, "/public/dist/sql-wasm.wasm"),
          },
          {
            from: path.join(
              __dirname,
              `node_modules/sql.js/dist/sql-wasm${!isProd ? "-debug" : ""}.js`
            ),
            to: path.join(__dirname, "/public/dist/sql-wasm.js"),
          },
        ],
      })
    );

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
      /typeorm-aurora-data-api-driver/,
    ];

    return config;
  },
};

module.exports = nextConfig;
