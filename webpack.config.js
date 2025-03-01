const path = require('node:path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const dotenv = require('dotenv');
const TerserPlugin = require('terser-webpack-plugin');

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

const htmlPlugin = new HtmlWebpackPlugin({
  template: './index.html',
  title: 'Synthetix Node Dashboard',
  favicon: './public/favicon.ico',
  scriptLoading: 'defer',
  minify: false,
  hash: false,
  xhtml: true,
});

const babelRule = {
  test: /\.(js|jsx)$/,
  include: [
    // Only include code in the src to ensure that library functions do not need compilation
    /src/,
  ],
  resolve: {
    fullySpecified: false,
  },
  use: {
    loader: require.resolve('babel-loader'),
    options: {
      configFile: path.resolve(__dirname, 'babel.config.js'),
    },
  },
};

const svgUrlRule = {
  test: /\.svg$/,
  exclude: [
    //
    /\/lib\/Icons\//,
    /\/@material-design-icons\/svg\//,
    /\/icons\//,
  ],
  type: 'asset/resource',
};

const svgSourceRule = {
  test: /\.svg$/,
  include: [
    //
    /\/lib\/Icons\//,
    /\/@material-design-icons\/svg\//,
    /\/icons\//,
  ],
  type: 'asset/source',
};

const cssRule = {
  test: /\.css$/,
  use: [
    isProd ? MiniCssExtractPlugin.loader : require.resolve('style-loader'),
    require.resolve('css-loader'),
  ],
};

const extractPlugin = new MiniCssExtractPlugin({
  filename: isProd ? '[name].[contenthash:8].css' : '[name].css',
});

const devServer = {
  port: process.env.NODE_PORT || '3001',

  hot: !isTest,
  liveReload: false,

  historyApiFallback: true,

  devMiddleware: {
    writeToDisk: !isTest,
    publicPath: '',
  },

  client: {
    logging: 'log',
    overlay: false,
    progress: false,
  },

  static: './public',

  headers: { 'Access-Control-Allow-Origin': '*' },
  allowedHosts: 'all',
  open: false,
  compress: false,
};

module.exports = {
  devtool: isTest ? false : 'source-map',
  devServer,
  mode: isProd ? 'production' : 'development',
  entry: './src/index.jsx',

  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '',
    filename: isProd ? '[name].[contenthash:8].js' : '[name].js',
    chunkFilename: isProd ? 'chunk/[name].[contenthash:8].js' : '[name].js',
    assetModuleFilename: '[name].[contenthash:8][ext]',
    clean: true,
  },

  optimization: {
    runtimeChunk: false,
    splitChunks: {
      chunks: 'async',
      maxAsyncRequests: 10,
      maxInitialRequests: 10,
      hidePathInfo: true,
      automaticNameDelimiter: '--',
      name: false,
    },
    moduleIds: isProd ? 'deterministic' : 'named',
    chunkIds: isProd ? 'deterministic' : 'named',
    minimize: isProd,
    minimizer: [new TerserPlugin()],
    innerGraph: true,
    emitOnErrors: false,
  },

  plugins: [
    htmlPlugin,
    new webpack.DefinePlugin({
      'process.env.API_URL': JSON.stringify(process.env.API_URL),
    }),
    new webpack.NormalModuleReplacementPlugin(
      /^debug$/,
      path.resolve(path.dirname(require.resolve('debug/package.json')), 'src', 'browser.js')
    ),
    ...(isProd ? [] : isTest ? [] : [new ReactRefreshWebpackPlugin({ overlay: false })]),
    ...(isProd ? [extractPlugin] : []),
  ],

  resolve: {
    extensions: ['.js', '.jsx'],
  },

  module: {
    rules: [babelRule, svgUrlRule, svgSourceRule, cssRule],
  },
};
