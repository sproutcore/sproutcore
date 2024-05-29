import fs from 'fs';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';

/**
 * SproutCore library for webpack configuration
 *
 * The builder works as follows:
 * - We have a list of apps and frameworks
 * - the webpack entries are built from the apps and framework locales
 * - frameworks need to have an index.js, containing the load order of the files. There is a helper script to determine that load order
 *   and generate the index.js file.
 */

export const ensureNotEndWithSlash = (path) => path.replace(/\/$/, '');

const ASSETS_PATH = 'assets';

const __dirname = new URL('.', import.meta.url).pathname;
export const SPROUTCORE_PATH = path.resolve(__dirname, '..');
export const AKI_THEME_PATH = path.join(SPROUTCORE_PATH, 'themes', 'aki');

/**
 * @param {string} searchPath the base path to the app or framework
 * @returns {string[]} list of language codes in the app or framework folder

 */
export const getLangCodes = (searchPath) => {
    const langs = [];

    // read the entries in the searchPath to determine the locales
    fs.readdirSync(searchPath).forEach(file => {
        if (fs.lstatSync(`${searchPath}/${file}`).isDirectory()) {
            const results = file.match(/^(\w+)\.lproj/);
            if (results) {
                const lang = results[1];
                langs.push(lang);
            }
        }
    });
    return langs;
};

export const getAppChunkName = (appName) => `${appName}-app`;
export const getLocaleStringsChunkName = (appName, langCode) => {
    `${appName}-locale-strings-${langCode}`;
}
export const getLocaleViewsChunkName = (appName, langCode) => {
    `${appName}-locale-views-${langCode}`;
}


// this is used to determine the languages for every app
// and framework combination
/**
 * @param {Function} callback function accepting (acc, appName, langCode)
 * @param {[]]} initialAcc initial value for the accumulator
 * @param {string[]} langCodes list of language codes
 */

export const reduceAppLocales = (fn, apps, initialAcc, langCodes) => {
    console.log('reduceAppLocales', apps, initialAcc, langCodes);
    return apps.reduce((acc, appName) => {
        langCodes.forEach(langCode => {
            acc = fn(acc, appName, langCode);
        });
        return acc;
    }, initialAcc);
};

/**
    * @param {Function} callback function accepting (acc, appName, langCode)
    * @param {[]]} initialAcc initial value for the accumulator
    * @param {string[]} langCodes list of language codes
*/
export const reduceFrameworkLocales = (fn, initialAcc, langCodes) => {
    let acc = initialAcc;
    langCodes.forEach(langCode => {
        acc = fn(acc, langCode);
    });
    return acc;
};


/**
 * @param {string[]} langCodes list of language codes
 * @return {Object} entry points for webpack
 *
 */
export const getEntrypoints = (langCodes, apps, frameworks) => {

    let frameworkLocaleEntries = {};
    let appEntries = {};
    if (frameworks && frameworks.length) {
        frameworkLocaleEntries = {
            ...reduceFrameworkLocales(
                (acc, langCode) => {
                    frameworks.forEach(framework => {
                        const stringChunkName = getLocaleStringsChunkName(framework, langCode);
                        const viewsChunkName = getLocaleViewsChunkName(framework, langCode);
                        acc[stringChunkName] = {
                            import: `./frameworks/${framework}/${langCode}.lproj/strings.js`,
                            dependOn: 'sproutcore',
                        };
                        acc[viewsChunkName] = {
                            import: `./frameworks/${framework}/${langCode}.lproj/views.js`,
                            dependOn: 'sproutcore',
                        };
                    });
                    return acc;
                }
            ),
        }
    }

    if (apps.length) {
        appEntries = {
            ...reduceAppLocales(
                (acc, appName, langCode) => {
                    const stringsChunkName = getLocaleStringsChunkName(appName, langCode);
                    const viewsChunkName = getLocaleViewsChunkName(appName, langCode);
                    acc[stringsChunkName] = {
                        import: `./apps/${appName}/${langCode}.lproj/strings.js`,
                        dependOn: 'sproutcore',
                    };
                    acc[viewsChunkName] = {
                        import: `./apps/${appName}/${langCode}.lproj/views.js`,
                        dependOn: 'sproutcore',
                    };
                    return acc;
                },
                apps,
                {},
                langCodes
            ),
            ...apps.reduce((acc, appName) => {
                acc[getAppChunkName(appName)] = { import: `./apps/${appName}/index.js`, layer: appName };
                return acc;
            }, {}),
        };
        console.log('appEntries', appEntries)
    }

    return {
        // we have sproutcore always
        sproutcore: 'sproutcore',
        ...frameworkLocaleEntries,
        ...appEntries,
    };
};


export const getHtmlPluginConfigs = (langCodes, apps, publicPath) => {
    const htmlPluginCommonConfig = {
        inject: false,
        scriptLoading: 'blocking',
        publicPath: publicPath? publicPath: 'auto',
    };

    if (!langCodes.length) {
        langCodes = ['en'];
    }

    return reduceAppLocales(
        (acc, appName, langCode) => {
            // for the chunks, in addition to sproutcore and the app chunk itself
            // we need the locale strings and views chunks. The order here doesn't
            // matter, as the HtmlWebpackPlugin will use the ordering in the entrypoints
            // configuration
            const chunks = [
                'sproutcore',
                getLocaleStringsChunkName(appName, langCode),
                getLocaleViewsChunkName(appName, langCode),
                getAppChunkName(appName),
            ];

            // converts any language tag to BCP47 (RFC 5646)
            let htmlLangCode = langCode;
            if (htmlLangCode.indexOf('_') !== -1) {
                // subtag of locale
                const parts = htmlLangCode.split('_');
                parts[1] = parts[1].toUpperCase();
                htmlLangCode = parts.join('-');
            }

            // check if the app has a custom index.ejs file
            // if not, use the default one
            let indexEjsPath = `./apps/${appName}/lib/index.ejs`;
            let loadingEjsPath = `./apps/${appName}/lib/loading.ejs`;
            const defaultPath = `${SPROUTCORE_PATH}/lib/`;
            // this is yet incorrect, but we need to figure out the sproutcore path
            // and use that
            if (!fs.existsSync(indexEjsPath)) {
                indexEjsPath = path.join(defaultPath, 'index.ejs');
            }
            if (!fs.existsSync(loadingEjsPath)) {
                loadingEjsPath = path.join(defaultPath, 'loading.ejs');
            }
            console.log('loadingEjsPath', loadingEjsPath);
            console.log('indexEjsPath', indexEjsPath);

            const filename = langCodes.length > 1 ? `${appName}/${langCode}/index.html` : `${appName}/index.html`;
            acc.push(
                new HtmlWebpackPlugin({
                ...htmlPluginCommonConfig,
                title: appName,
                filename,
                template: indexEjsPath,
                chunks,
                templateParameters: {
                    lang: htmlLangCode,
                    loading: fs.readFileSync(loadingEjsPath, 'utf8'),
                    // possibly more, need to figure out how to pass in additional parameters
                },
            }));
            return acc;
        },
        apps,
        [],
        langCodes
    );
}

/**
 *
 * @param {string[]} appNames names of the apps
 * @param {string} themePath path to the used theme
 * @param {string} publicPath
 * @param {MiniCssExtractPlugin} MiniCssExtractPlugin We need to pass this in, as there is a requirement that the
 * MiniCssExtractPlugin is the same instance for all the rules as well as the plugins. By passing it in from the
 * webpack.common.mjs file, we ensure that this is the case.
 * @returns {Object[]} rules for the webpack module
 */
export const getModuleRules = (appNames, themePath, publicPath, MiniCssExtractPlugin) => {
    const rules = [
        {
            test: /\.(eot|ttf|woff)/,
            type: 'asset/resource',
        },
        {
            test: /\.(png|jpg|gif|svg|xls)$/,
            type: 'asset/resource',
        },
        {
            test: /\.txt/,
            // use: 'raw-loader',
            type: 'asset/resource',
        },
        {
            test: /\.js$/,
            // don't forget to update webpack.prod.ts as well when changing this!
            include: /node_modules\/sproutcore/,
            exclude: /node_modules/,
            use: [
                'imports-loader?wrapper=window',
                {
                    loader: path.resolve(
                        SPROUTCORE_PATH, 'lib/sc_static_url_loader.js'
                    ),
                },
                {
                    loader: path.resolve(SPROUTCORE_PATH, 'lib/sc_super_loader.js'),
                    options: {
                        useOldStyle: false,
                        insertImport: false,
                    },
                },
                {
                    loader: path.resolve(
                        SPROUTCORE_PATH, 'lib/sc_ifdebug_fixtures_loader.js'
                    ),
                },
            ],
        },
        // for the css we need the context of the app, so we use layers as appNames, and then
        // use this to load the resources/_theme.scss file from the app
        {
            test: /\.s?css$/,
            oneOf: appNames.map((appName) => {
                return {
                    issuerLayer: appName,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                esModule: false,
                                publicPath: publicPath !== undefined ? `${publicPath}/` : 'auto',
                            },
                        },
                        'css-loader',
                        {
                            loader: path.resolve(
                                SPROUTCORE_PATH,
                                'lib/sc_static_url_loader.js'
                            ),
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                additionalData: (content) => {
                                    console.log('additionalData for appName', appName);
                                    const regexp = /\$theme\./gi;
                                    const newContent = content.replace(regexp, '#{$theme}.');
                                    return `@import "./apps/${appName}/resources/_theme.scss"; \n ${newContent}`;
                                },
                                sassOptions: {
                                    includePaths: [
                                        path.resolve(`${themePath}/resources`),
                                        path.resolve(`./apps/${appName}/resources`),
                                        path.resolve('./node_modules/compass-mixins-fixed/lib'),
                                        path.resolve( // we might make this different
                                            SPROUTCORE_PATH, '/node_modules/compass-mixins-fixed/lib'
                                        ),
                                    ],
                                },
                            },
                        }
                    ]
                };
            })
        }
    ];
    return rules;
}