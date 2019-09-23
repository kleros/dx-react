/* eslint-disable import/no-extraneous-dependencies */
/* eslint-enable import/no-extraneous-dependencies */

const dotenv = require('dotenv').config({path: __dirname + '/.env'})
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const NameAllModulesPlugin = require('name-all-modules-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const path = require('path')
const webpack = require('webpack')

const pkg = require('./package.json')

const nodeEnv = process.env.NODE_ENV || 'development'
const version = process.env.BUILD_VERSION || pkg.version
const build = process.env.BUILD_NUMBER || 'SNAPSHOT'

module.exports = {
  context: path.join(__dirname, 'src'),
  entry: 'index.tsx',
  output: {
    publicPath: '',
    path: process.env.CLAIM_ONLY ? `${__dirname}/dist/legacy` : `${__dirname}/dist/prod`,
    chunkFilename: '[name].[chunkhash].js',
    filename: '[name].[chunkhash].js',
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
            hash: 'sha512',
            digest: 'hex',
            name: 'img/[hash].[ext]',
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
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            { loader: 'css-loader', options: { minimize: true, importLoaders: 1 } },
            { loader: 'postcss-loader' },
          ],
        }),
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            { loader: 'css-loader', options: { minimize: true, importLoaders: 1 } },
            { loader: 'postcss-loader' },
            { loader: 'sass-loader' },
          ],
        }),
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
  stats: {
    children: false,
  },
  devServer: {
    disableHostCheck: true,
    contentBase: false,
    historyApiFallback: true,
    port: 5000,
    host: '0.0.0.0',
    watchOptions: {
      ignored: /node_modules/,
    },
  },
  recordsPath: path.join(__dirname, 'records.json'),
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.NamedChunksPlugin((chunk) => {
      if (chunk.name) {
        return chunk.name
      }
      return chunk.modules.map(m => path.relative(m.context, m.request)).join('_')
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: ({ resource, context }) => {
        if (resource && (/^.*\.(css|scss|sass|less)$/).test(resource)) {
          return false
        }
        return context && context.indexOf('node_modules') !== -1
      },
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      minChunks: Infinity,
    }),
    new NameAllModulesPlugin(),
    new ExtractTextPlugin('[name].[contenthash].css'),
    new FaviconsWebpackPlugin({
      logo: 'assets/favicon.png',
      prefix: './', // puts favicons into root folder,
      // which allows for not html content (like pdf) to fetch /favicon.icon from default location

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
        VERSION: JSON.stringify(`${version}#${build}`),
        NODE_ENV: JSON.stringify(nodeEnv),
        FE_CONDITIONAL_ENV: JSON.stringify(process.env.FE_CONDITIONAL_ENV || 'production'),
        USE_DEV_NETWORKS: JSON.stringify(process.env.USE_DEV_NETWORKS),
        CLAIM_ONLY: JSON.stringify(process.env.CLAIM_ONLY),
        DOTENV_PARSED: JSON.stringify(dotenv.parsed),
      },
    }),
    new UglifyJsPlugin(),
    new CopyWebpackPlugin([{
      from: 'public',
    }, {
      from: '../landing',
      to: 'landing',
    }]),
  ],
}
