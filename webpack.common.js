const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  name: "SproutCore",
  mode: 'development', // for now
  context: __dirname,
  entry: {
    bootstrap: './frameworks/bootstrap/index.js',
    jquery: './frameworks/jquery/index.js',
    yuireset: './frameworks/yuireset/index.js',
    runtime: {
      import: './frameworks/runtime/index.js',
      dependOn: 'bootstrap'
    },
    core_foundation: {
      import: './frameworks/core_foundation/index.js',
      dependOn: ['jquery', 'runtime', 'yuireset']
    },
    template_view: {
      import: './frameworks/template_view/index.js',
      dependOn: 'core_foundation'
    },
    datetime: {
      import: './frameworks/datetime/index.js',
      dependOn: 'runtime'
    },
    routing: {
      import: './frameworks/routing/index.js',
      dependOn: 'core_foundation'
    },
    ajax: {
      import: './frameworks/ajax/index.js',
      dependOn: 'core_foundation'
    },
    foundation: {
      import: './frameworks/foundation/index.js',
      dependOn: ['routing', 'core_foundation', 'datetime', 'ajax']
    },
    datastore: {
      import: './frameworks/datastore/index.js',
      dependOn: ['runtime', 'datetime']
    },
    formatters: {
      import: './frameworks/formatters/index.js',
      dependOn: ['runtime', 'foundation']
    },
    desktop: {
      import: './frameworks/desktop/index.js',
      dependOn: 'foundation'
    },
    legacy: {
      import: './frameworks/legacy/index.js',
      dependOn: 'desktop'
    },
    media: {
      import: './frameworks/media/index.js',
      dependOn: 'desktop'
    },
    statechart: {
      import: './frameworks/statechart/index.js',
      dependOn: 'core_foundation'
    },
    // designer: {
    //   import: './frameworks/designer/index.js',
    //   dependOn: ['desktop', 'template_view']
    // },
    sproutcore: {
      import: './index.js',
    },
    empty_theme: './themes/empty_theme/index.js',
    // iphone_theme: {
    //   import: './themes/iphone_theme/index.js',
    //   dependOn: 'empty_theme'
    // },
    legacy_theme: {
      import: "./themes/legacy_theme/index.js",
      dependOn: 'empty_theme'
    },
    core_tools: {
      import: "./frameworks/core_tools/index.js",
      dependOn: ["desktop", 'datastore'],
    },
    tests: {
      import: "./apps/tests/index.js",
      dependOn: ["statechart", "core_tools"]
    }
  },
  module: {
    rules: [
      {
        test: /\.s?css$/i,
        use: [
          // 'style-loader', // inject in html
          MiniCssExtractPlugin.loader,

          'css-loader', // convert to es modules
          // 'sass-loader' // convert sass to css
          {
            loader: 'sass-loader',
            options: {
              // additionalData: '@import "./node_modules/compass-mixins-fixed/lib/compass";',
              sassOptions: {
                includePaths: [
                    path.resolve(
                        './node_modules/compass-mixins-fixed/lib'
                    ),
                ],
            },
            }
          },
          {
            loader: path.resolve('./lib/sc_static_url_loader.js'),
          },

        ]
      },

      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: path.resolve('./lib/sc_super_loader.js'),
            options: {
              useOldStyle: false,
              injectImport: false
            }
          },
          'imports-loader?wrapper=window',
        ]
      }
    ]
  },
  output: {
    path: path.join(__dirname, 'build'),
    // filename: "SproutCore.[name].js",
    // filename: "sproutcore.js",
    // library: ["SC"],
    library: ["[name]"],
    libraryTarget: 'var',
    globalObject: 'window',
    // iife: false
  },
  optimization: {
    // useExports: true
    // innerGraph: false
  },
  plugins: [
    new MiniCssExtractPlugin(),
  ]
};
