/* eslint-disable import/no-extraneous-dependencies */
/* eslint-enable import/no-extraneous-dependencies */

const dotenv = require('dotenv').config({path: __dirname + '/.env'})
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const path = require('path')
const webpack = require('webpack')

const pkg = require('./package.json')

const nodeEnv = process.env.NODE_ENV || 'development'
const version = process.env.BUILD_VERSION || pkg.version
const build = process.env.BUILD_NUMBER || 'SNAPSHOT'

const config = require('./src/config.json')

const whitelist = config.developmentWhitelist

const ethereumUrl = process.env.ETHEREUM_URL || `${config.ethereum.protocol}://${config.ethereum.host}:${config.ethereum.port}`

module.exports = {
  context: path.join(__dirname, 'src'),
  entry: 'index.tsx',
  devtool: 'eval-source-map',
  output: {
    publicPath: '',
    path: process.env.CLAIM_ONLY ? `${__dirname}/dist/legacy` : `${__dirname}/dist/dev`,
    filename: 'bundle.js',
  },
  resolve: {
    symlinks: false,
    modules: [
      `${__dirname}/src`,
      'node_modules',
    ],
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
      {
        test: /\.tsx?$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'awesome-typescript-loader',
          options: {
            useBabel: true,
            useCache: true,
            babelCore: '@babel/core',
          },
        },
      },
      {
        test: /\.(jpe?g|png|svg|gif)$/i,
        use: {
          loader: 'file-loader',
          options: {
            name: 'img/[name].[ext]',
          },
        },
      },
      {
        test: /\.(pdf)$/i,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
          },
        },
      },
      {
        test: /\.s?css$/,
        use: [
          {
            loader: 'style-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        use: {
          loader: 'sass-loader',
          options: {
            sourceMap: true,
          },
        },
      },
      {
        test: /\.(ttf|otf|eot|woff2?)(\?[a-z0-9]+)?$/,
        use: {
          loader: 'file-loader',
          options: {
            name: 'fonts/[name].[ext]',
          },
        },
      },
      {
        test: /\/build\/contracts\/\w+\.json$/,
        use: ['json-loader', 'json-x-loader?exclude=unlinked_binary+networks.*.events+networks.*.links+bytecode+deployedBytecode+sourceMap+deployedSourceMap+source+sourcePath+ast+legacyAST']
      },
    ],
  },
  devServer: {
    disableHostCheck: true,
    historyApiFallback: true,
    port: 5000,
    host: '0.0.0.0',
    clientLogLevel: 'info',
    hot: true,
    watchOptions: {
      ignored: /node_modules/,
    },
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new FaviconsWebpackPlugin({
      logo: 'assets/favicon.png',
      prefix: './',
      // Generate a cache file with control hashes and
      // don't rebuild the favicons until those hashes change
      persistentCache: true,
      icons: {
        android: false,
        appleIcon: false,
        appleStartup: false,
        coast: false,
        favicons: true,
        firefox: false,
        opengraph: false,
        twitter: false,
        yandex: false,
        windows: false,
      },
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src/html/index.html'),
    }),
    new webpack.DefinePlugin({
      'process.env': {
        ETHEREUM_URL: JSON.stringify(ethereumUrl),
        FE_CONDITIONAL_ENV: JSON.stringify(process.env.FE_CONDITIONAL_ENV || 'development'),
        USE_DEV_NETWORKS: JSON.stringify(process.env.USE_DEV_NETWORKS),
        NODE_ENV: JSON.stringify(nodeEnv),
        CLAIM_ONLY: JSON.stringify(process.env.CLAIM_ONLY),
        VERSION: JSON.stringify(`${version}#${build}`),
        WHITELIST: JSON.stringify(whitelist),
        DOTENV_PARSED: JSON.stringify(dotenv.parsed),
      },
    }),
    new CopyWebpackPlugin([{
      from: 'public',
    }, {
      from: '../landing',
      to: 'landing',
    }]),
  ],
}
