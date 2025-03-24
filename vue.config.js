'use strict'
const path = require('path')
const defaultSettings = require('./src/settings.js')

function resolve(dir) {
  return path.join(__dirname, dir)
}

const name = defaultSettings.title || 'Веб портал ТСД Групп' // page title

// If your port is set to 80,
// use administrator privileges to execute the command line.
// For example, Mac: sudo npm run
// You can change the port by the following methods:
// port = 9528 npm run dev OR npm run dev --port = 9528
const port = process.env.port || 80 // dev port

// All configuration item explanations can be find in https://cli.vuejs.org/config/
module.exports = {
  /**
   * You will need to set publicPath if you plan to deploy your site under a sub path,
   * for example GitHub Pages. If you plan to deploy your site to https://foo.github.io/bar/,
   * then publicPath should be set to "/bar/".
   * In most cases please use '/' !!!
   * Detail: https://cli.vuejs.org/config/#publicpath
   */
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: process.env.NODE_ENV === 'development',
  productionSourceMap: false,
  devServer: {
    port: port,
    open: false,
    // host: 'dev.tsd-group.ru',
    overlay: {
      warnings: false,
      errors: true
    },
    proxy: {
      ['^' + process.env.VUE_APP_ATLAS_GOODS]: {
        target: 'https://terminal.scloud.ru/09/sc0503166_base006/hs/ex?appid=atlasweb&action=getgoods',
        changeOrigin: true,
        mode: 'no-cors',
        logLevel: 'debug',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        auth: 'sc0503166:WCfY1PjokM',
        credentials: 'same-origin',
        pathRewrite: {
          ['^' + process.env.VUE_APP_ATLAS_GOODS]: ''
        }
      },
      ['^' + process.env.VUE_APP_ATLAS_UPDATE_GOODS]: {
        target: 'https://terminal.scloud.ru/09/sc0503166_base006/hs/ex?appid=atlasweb&action=updategoods',
        changeOrigin: true,
        mode: 'no-cors',
        logLevel: 'debug',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        auth: 'sc0503166:WCfY1PjokM',
        credentials: 'same-origin',
        pathRewrite: {
          ['^' + process.env.VUE_APP_ATLAS_UPDATE_GOODS]: ''
        }
      },
      ['^' + process.env.VUE_APP_ATLAS_SALES]: {
        target: 'https://terminal.scloud.ru/09/sc0503166_base006/hs/ex?appid=atlasweb&action=getsales',
        changeOrigin: true,
        mode: 'no-cors',
        logLevel: 'debug',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        auth: 'sc0503166:WCfY1PjokM',
        credentials: 'same-origin',
        pathRewrite: {
          ['^' + process.env.VUE_APP_ATLAS_SALES]: ''
        }
      },
      ['^' + process.env.VUE_APP_ATLAS_INVOICE]: {
        target: 'https://terminal.scloud.ru/09/sc0503166_base006/hs/ex?appid=atlasweb&action=getinvoice',
        changeOrigin: true,
        mode: 'no-cors',
        logLevel: 'debug',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        auth: 'sc0503166:WCfY1PjokM',
        credentials: 'same-origin',
        pathRewrite: {
          ['^' + process.env.VUE_APP_ATLAS_INVOICE]: ''
        }
      },
      ['^' + process.env.VUE_APP_ATLAS_CONTRACTORS]: {
        target: 'https://terminal.scloud.ru/09/sc0503166_base006/hs/ex?appid=atlasweb&action=getcontractors',
        changeOrigin: true,
        mode: 'no-cors',
        logLevel: 'debug',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        auth: 'sc0503166:WCfY1PjokM',
        credentials: 'same-origin',
        pathRewrite: {
          ['^' + process.env.VUE_APP_ATLAS_CONTRACTORS]: ''
        }
      },
      ['^' + process.env.VUE_APP_ATLAS_WAREHOUSES]: {
        target: 'https://terminal.scloud.ru/09/sc0503166_base006/hs/ex?appid=atlasweb&action=warehouses',
        changeOrigin: true,
        mode: 'no-cors',
        logLevel: 'debug',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        auth: 'sc0503166:WCfY1PjokM',
        credentials: 'same-origin',
        pathRewrite: {
          ['^' + process.env.VUE_APP_ATLAS_WAREHOUSES]: ''
        }
      },
      ['^' + process.env.VUE_APP_ATLAS_DISASSEMBLE]: {
        target: 'https://terminal.scloud.ru/09/sc0503166_base006/hs/ex?appid=atlasweb&action=createDisassemble',
        changeOrigin: true,
        mode: 'no-cors',
        logLevel: 'debug',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        auth: 'sc0503166:WCfY1PjokM',
        credentials: 'same-origin',
        pathRewrite: {
          ['^' + process.env.VUE_APP_ATLAS_DISASSEMBLE]: ''
        }
      },
      ['^' + process.env.VUE_APP_ATLAS_ASSEMBLE]: {
        target: 'https://terminal.scloud.ru/09/sc0503166_base006/hs/ex?appid=atlasweb&action=createAssemble',
        changeOrigin: true,
        mode: 'no-cors',
        logLevel: 'debug',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        auth: 'sc0503166:WCfY1PjokM',
        credentials: 'same-origin',
        pathRewrite: {
          ['^' + process.env.VUE_APP_ATLAS_ASSEMBLE]: ''
        }
      },
      ['^' + process.env.VUE_APP_ATLAS_MOVEMENT]: {
        target: 'https://terminal.scloud.ru/09/sc0503166_base006/hs/ex?appid=atlasweb&action=createMovement',
        changeOrigin: true,
        mode: 'no-cors',
        logLevel: 'debug',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        auth: 'sc0503166:WCfY1PjokM',
        credentials: 'same-origin',
        pathRewrite: {
          ['^' + process.env.VUE_APP_ATLAS_MOVEMENT]: ''
        }
      },
      ['^' + process.env.VUE_APP_ATLAS_SALES_REPORT]: {
        target: 'https://terminal.scloud.ru/09/sc0503166_base006/hs/ex?appid=atlasweb&action=selesReport',
        changeOrigin: true,
        mode: 'no-cors',
        logLevel: 'debug',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        auth: 'sc0503166:WCfY1PjokM',
        credentials: 'same-origin',
        pathRewrite: {
          ['^' + process.env.VUE_APP_ATLAS_SALES_REPORT]: ''
        }
      },
      ['^' + process.env.VUE_APP_BASE_API]: {
        target: process.env.VUE_APP_BASE_API,
        changeOrigin: true,
        pathRewrite: {
          ['^' + process.env.VUE_APP_BASE_API]: ''
        }
      }
    }
    /* before: require('./mock/mock-server.js') */
  },
  configureWebpack: {
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    name: name,
    resolve: {
      alias: {
        '@': resolve('src')
      }
    }
  },
  chainWebpack(config) {
    config.plugins.delete('preload') // TODO: need test
    config.plugins.delete('prefetch') // TODO: need test
    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()

    // set preserveWhitespace
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap(options => {
        options.compilerOptions.preserveWhitespace = true
        return options
      })
      .end()

    config
      // https://webpack.js.org/configuration/devtool/#development
      .when(process.env.NODE_ENV === 'development',
        config => config.devtool('cheap-source-map')
      )

    config
      .when(process.env.NODE_ENV !== 'development',
        config => {
          config
            .plugin('ScriptExtHtmlWebpackPlugin')
            .after('html')
            .use('script-ext-html-webpack-plugin', [{
              // `runtime` must same as runtimeChunk name. default is `runtime`
              inline: /runtime\..*\.js$/
            }])
            .end()
          config
            .optimization.splitChunks({
              chunks: 'all',
              cacheGroups: {
                libs: {
                  name: 'chunk-libs',
                  test: /[\\/]node_modules[\\/]/,
                  priority: 10,
                  chunks: 'initial' // only package third parties that are initially dependent
                },
                elementUI: {
                  name: 'chunk-elementUI', // split elementUI into a single package
                  priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
                  test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
                },
                vuetify: {
                  name: 'chunk-vuetify', // split vuetify into a single package
                  priority: 25, // the weight needs to be larger than libs and app or it will be packaged into libs or app
                  test: /[\\/]node_modules[\\/]_?vuetify(.*)/ // in order to adapt to cnpm
                },
                commons: {
                  name: 'chunk-commons',
                  test: resolve('src/components'), // can customize your rules
                  minChunks: 3, //  minimum common number
                  priority: 5,
                  reuseExistingChunk: true
                }
              }
            })
          config.optimization.runtimeChunk('single')
        }
      )
  }
}
