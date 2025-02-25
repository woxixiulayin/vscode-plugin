﻿const ignoreWarningPlugin = require('../ignoreWarningPlugin')
const LessFunc = require('less-plugin-functions');

module.exports = function (envVars) {
  return {
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  '@babel/preset-react'
                ],
                plugins: [
                  ['@babel/plugin-proposal-class-properties', {'loose': true}]
                ],
                cacheDirectory: true
              }
            }
          ]
        },
        {
          test: /\.tsx?$/,
          //include: [pathSrc, testSrc],
          use: [
            // {
            //   loader: './config/test-loader'
            // },
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  '@babel/preset-react'
                ],
                plugins: [
                  ['@babel/plugin-proposal-class-properties', {'loose': true}]
                ],
                cacheDirectory: true
              }
            },
            {
              loader: 'ts-loader',
              options: {
                silent: true,
                transpileOnly: true
              }
            }
          ]
        },
        {
          test: /\.css$/,
          // exclude: /node_modules/,
          use: ['style-loader', 'css-loader']
        },
        // {
        //   test: /\.nmd(?=\.less)$/gi,
        //   use: ['style-loader', 'css-loader', 'less-loader']
        // },
        {
          test: /\.less$/i,
          use: [
            {
              loader: 'style-loader',
              options: {attributes: {title: 'less'}}
            },
            {
              loader: 'css-loader',
              options: {
                modules: {
                  localIdentName: '[local]-[hash:5]'
                }
              }
            },
            {
              loader: 'less-loader',
              options: {
                plugins: [new LessFunc()],
                javascriptEnabled: true,
                modifyVars: envVars
              }
            }
          ]
        },
        // {
        //   test: /\.svg$/i,
        //   use: [
        //     {loader: 'raw-loader'}
        //   ]
        // },
        {
          test: /\.d.ts$/i,
          use: [
            {loader: 'raw-loader'}
          ]
        },
        {
          test: /\.(xml|txt|html|cjs|theme)$/i,
          use: [
            {loader: 'raw-loader'}
          ]
        }
      ]
    },
    optimization: {
      concatenateModules: false//name_name
    },
    plugins: [
      // new webpack.DefinePlugin({
      //   'process.env': {
      //     NODE_ENV: JSON.stringify('production')
      //   }
      // }),
      // new webpack.ProvidePlugin({
      //   'React': 'react'
      // }),
      new ignoreWarningPlugin(),   // All warnings will be ignored
      //new VueLoaderPlugin(),
      //new BundleAnalyzerPlugin()
    ]
  }
}
