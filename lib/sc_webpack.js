const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const validate = require('schema-utils').validate;
const fs = require('fs');

/**
 * @typedef SCWebpackOpts
 * @type object
 * @property {string} context The root path of the project
 * @property {string} mode the build mode of the project
 * @property {string} name The name of the webpack entry
 * @property {string} import The path to the index.js, which is the import entry for the app
 * @property {string} [outputPath] The path to the output, 'dist' by default, optional
 * @property {string} [filename] The output file name, [name].js by default, optional
 * @property {string} title The title to be inserted in the html
 * @property {string} [html_filename] The name of the html file to be generated, index.html by default
 * @property {string} [html_template] the name of the EJS html template, overrides the default
 * @property {string} [css_theme] The value that should be inserted as $theme in all style files
 */

const SCDIR = path.resolve(__dirname, '..');

const schema = {
  type: "object",
  properties: {
    context: { type: "string", required: true, description: "the root directory of the project" },
    mode: { type: "string", required: true, description: "the build mode in the project"},
    name: { type: "string", required: true, description: "the name of the webpack entry"},
    import: { type: "string", required: true, description: "which file is the entry of the app"},
    outputPath: { type: "string", required: false, description: "output path, 'dist' by default "},
    filename: { type: "string", required: false, description: "webpack output filename, [name].js by default"},
    title: { type: "string", required: true, description: "title to be used in the generated HTML"},
    html_filename: { type: "string", required: false, description: "the filename of the html to be generated, index.html by default"},
    html_template: { type: "string", required: false, description: "override for the default SproutCore HTML template"},
    css_theme: { type: "string", required: false, description: "css string to be inserted, overrides resources/_theme.css"}
  }
}

function determine_$theme (opts) {
  if (opts.css_theme) return opts.css_theme;
  else {
        // we first search for resources/_theme.css
    const entryBasePath = path.dirname(path.join(opts.context, opts.import));
    const themeCSSFilePath = path.join(entryBasePath, 'resources', '_theme.css');
    const themeSCSSFilePath = path.join(entryBasePath, 'resources', '_theme.scss');

    if (fs.existsSync(themeSCSSFilePath)) {
      return themeSCSSFilePath;
    }
    else if (fs.existsSync(themeCSSFilePath)) {
      return themeCSSFilePath;
    }
    else return false;
  }
}




/**
 *
 * @param {SCWebpackOpts} opts
 */
module.exports = function createSCWebpack (opts) {
  // validate(schema, opts);

  // return {};
  const cssTheme = determine_$theme(opts);
  const entryBasePath = path.dirname(path.join(opts.context, opts.import));

  const ret = {
    context: opts.context,
    mode: opts.mode || 'development', // for now
    entry: {
      [opts.name]: {
        import: opts.import
      }
    },
    output: {
      filename: opts.filename || '[name].js',
      path: opts.outputPath || path.resolve(opts.context, "dist"),
      globalObject: 'window',
      clean: true
    },
    plugins: [
      new webpack.ProvidePlugin({
        $: path.resolve(SCDIR, 'frameworks/jquery/jquery-1.11.1.js'),
        jQuery: path.resolve(SCDIR, 'frameworks/jquery/jquery-1.11.1.js'),
      }),
      new HtmlWebpackPlugin({
        title: opts.title || opts.name,
        filename: opts.html_filename || 'index.html',
        inject: false,
        // scriptLoading: 'blocking',
        template: opts.html_template || path.resolve(SCDIR, 'lib/index.ejs'),
        // templateParameters: // option to pass in specific parameters, or even a function such as:
        //
        templateParameters: (compilation, assets, assetTags, options) => {
          return {
            app: {
              scripts: assets.js,
              styles: assets.css,
              assets: assets
            }
          }

        },

      }),
    ],  // end plugins
    resolve: {
      modules: [
        "node_modules",
        path.resolve(opts.context, "frameworks"),
        path.resolve(opts.context, "apps"),
        path.resolve(opts.context, "themes"),
        path.resolve(SCDIR, "frameworks"),
        path.resolve(SCDIR, "themes")
      ]
    },
    module: {
      rules: [
        {
          test: /\.(png|jpg|gif|svg)/,
          type: 'asset/resource'
        },
        {
          test: /\.s?css$/i,
          use: [
            'style-loader',
            'css-loader',
            {
              loader: path.resolve(SCDIR, "lib/sc_static_url_loader.js")
            },
            {
              loader: 'sass-loader',
              options: {
                additionalData: (content, loaderContext) => {

                  // we replace the $theme, for as far that is possible
                  // two options, either opts.css-style has been defined, so we
                  // add it directly, otherwise import
                  const regexp = /\$theme\./gi;
                  const newContent = content.replace(regexp, "#{\$theme}.");

                  if (opts.css_theme) {
                    return `$theme: '${opts.css_theme}; \n ${newContent}`;
                  }
                  else if (cssTheme) {
                    return `@import "${cssTheme}";\n ${newContent}`;
                  }
                  else return newContent;
                },
                sassOptions: {
                  includePaths: [
                    path.resolve(opts.context, entryBasePath, 'resources'),
                    path.resolve(SCDIR, 'node_modules/compass-mixins-fixed/lib')
                  ]
                }

              }
            }
          ]
        },
        {
          test: /\.js$/,
          use: [
            {
              loader: path.resolve(SCDIR, 'lib/sc_static_url_loader.js'),
            },
            {
              loader: path.resolve(SCDIR, 'lib/sc_super_loader.js'),
              options: {
                useOldStyle: false,
                insertImport: false
              }
            },
            'imports-loader?wrapper=window',
          ]
        }
      ]
    }
  }
  return ret;
}

