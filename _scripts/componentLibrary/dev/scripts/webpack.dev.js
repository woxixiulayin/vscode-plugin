const path = require("path");
const fse = require("fs-extra");
const WebpackBar = require("webpackbar");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtraWatchWebpackPlugin = require("extra-watch-webpack-plugin");

const devplugin = require("./devplugin");
const { tempPath } = require("../../../const");

const { filename } = process.env;
const jsonconfig = fse.readJSONSync(path.resolve(tempPath, `./${filename}`));
const { cacheId, entry, docPath, configName, extraWatchFiles } = jsonconfig;
const watchFiles = JSON.parse(decodeURIComponent(extraWatchFiles));
const outputPath = path.resolve(__dirname, "../public");
const config = fse.readJSONSync(docPath + "/" + configName);
const { externals } = config;

const externalsMap = {
  "react": "React",
  "react-dom": "ReactDOM"
};

let htmlLink = "";
let htmlScript = "";

if (Array.isArray(externals)) {
  externals.forEach(({name, library, urls}) => {
    if (name && library && Array.isArray(urls)) {
      externalsMap[name] = library;
      urls.forEach((url) => {
        if (url.endsWith('.js')) {
          htmlScript = htmlScript + `<script src="${url}"></script>\n`;
        } else if (url.endsWith('.css')) {
          htmlLink = htmlLink + `<link rel="stylesheet" href="${url}">\n`;
        }
      });
    }
  });
}

module.exports = {
  mode: "development",
  entry: {
    bundle: path.resolve(__dirname, "../src/index.tsx"),
    libEdt: entry
  },
  output: {
    path: outputPath,
    filename: "[name].js",
    libraryTarget: "umd",
    library: "[name]"
  },
  stats: {
    colors: true,
    preset: 'normal'
  },
  resolve: {
    alias: {},
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  // 配置
  // externals: [{
  //   "react": {
  //     commonjs: "react",
  //     commonjs2: "react",
  //     amd: "react",
  //     root: "React"
  //   },
  //   "react-dom": {
  //     commonjs: "react-dom",
  //     commonjs2: "react-dom",
  //     amd: "react-dom",
  //     root: "ReactDOM"
  //   },
  //   'antd': {
  //     commonjs: 'antd',
  //     commonjs2: 'antd',
  //     amd: 'antd',
  //     root: "antd"
  //   },
  //   '@ant-design/icons': 'icons',
  //   '@ant-design/charts': 'charts',
  // }],
  externals: [externalsMap],
  devtool: "cheap-source-map",
  devServer: {
    open: true,
    hot: true,
    allowedHosts: "all",
    static: {
      directory: outputPath,
    },
    client: {
      logging: "warn"
    },
    proxy: []
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-react"
              ],
              plugins: [
                ["@babel/plugin-proposal-class-properties", {"loose": true}]
              ],
              cacheDirectory: true
            }
          }
        ]
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-react"
              ],
              plugins: [
                ["@babel/plugin-proposal-class-properties", {"loose": true}]
              ],
              cacheDirectory: true
            }
          },
          {
            loader: 'ts-loader',
            options: {
              silent: true,
              transpileOnly: true
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.less$/i,
        use: [
          {
            loader: "style-loader",
            options: {attributes: {title: "less"}}
          },
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: "[local]-[hash:5]"
              }
            }
          },
          "less-loader"
        ]
      },
      {
        test: /\.(gif|png|jpe?g|webp|svg|woff|woff2|eot|ttf)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1024 * 2,
              name: 'img_[name]_[contenthash:4].[ext]'
            }
          }
        ]
      },
      {
        test: /\.d.ts$/i,
        use: [{ loader: 'raw-loader' }]
      },
      {
        test: /\.(xml|txt|html|cjs|theme)$/i,
        use: [{ loader: 'raw-loader' }]
      }
    ]
  },
  optimization: {
    concatenateModules: false
  },
  cache: {
    type: 'filesystem',
    name: cacheId
  },
  plugins: [
    new WebpackBar(),
    new devplugin({entry, docPath, configName, watchFiles}),
    new ExtraWatchWebpackPlugin({
      files: watchFiles
    }),
    new HtmlWebpackPlugin({
      inject: false,
      template: path.resolve(__dirname, "../public/index.ejs"),
      templateParameters: {
        title: "MyBricks-设计器（SPA版）Demo",
        link: htmlLink,
        script: htmlScript + "<script src=\"./bundle.js\" defer></script>"
      }
    })
  ]
};
