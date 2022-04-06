const fs = require('fs');
const path = require('path');
const { Compiler, Stats } = require('webpack');
const devConfig = require('./webpack.dev.js');

// don't split chunks as it complicates test URLs
delete devConfig.optimization?.splitChunks;

function findIndexJs(startPath, stopAt = '/') {
    let p = startPath;
    do {
        const t = path.join(p, 'index.js');
        if (fs.existsSync(t)) {
            return t;
        } else {
            p = path.resolve(p, '..');
        }
    } while (p !== stopAt); // stop at root
}

function scanDir (dir, insideTests = false) {
    const ret = [];
    // read current dir
    const folder = fs.readdirSync(dir, { withFileTypes: true });
    if (insideTests) {
        // only check files when inside tests folder
        folder
            .filter(f => f.isFile() && f.name.endsWith('.js'))
            .forEach(f => {
                // I need to have a reference to the proper index.js as well
                const index = findIndexJs(dir);
                if (index === undefined) {
                    throw new Error(`no index found for ${path.join(dir, f.name)}`);
                }

                const fn = path.join(dir, f.name);
                if (fn !== index)
                    ret.push({ import: [fn, index], name: f.name, path: fn, indexJs: index });
            });
    }
    // check for folders
    const maps = folder.filter(o => o.isDirectory());
    maps.forEach(m => {
        if (m.name === 'tests' && !dir.endsWith('apps') && !insideTests) {
            scanDir(path.join(dir, m.name), true).forEach(f => ret.push(f));
        } else {
            if (m.name !== 'node_modules') {
                scanDir(path.join(dir, m.name), insideTests).forEach(f => ret.push(f));
            }
        }
    });
    return ret;
}

function determineAncestry(dir) {
    // given frameworks/sproutcore/apps/tests find sproutcore
    // given frameworks/third_party/frameworks/raphael find third_party

    const projFolderNames = ['frameworks', 'apps', 'themes'];

    const parts = dir.split(path.sep);
    const ret = [];
    parts.forEach(p => {
        if (projFolderNames.indexOf(p) === -1) {
            ret.push(p);
        }
    });

    return `/${ret.join('/')}`;
}

function getAllTargets(testInfos) {
    const targets = [];
    testInfos.forEach(testInfo => {
        // some extra info:
        const fwDir = path.dirname(testInfo.indexJs);

        const ancestry = determineAncestry(path.relative(__dirname, fwDir));

        // now we check: when split by path.sep
        // - the last item is the name
        // - the last item by one indicates whether it is a framework or app, because
        const parts = fwDir.split(path.sep);
        const isApp = parts[parts.length - 2] === 'apps';
        const isFw = parts[parts.length - 2] === 'frameworks';
        const isTheme = parts[parts.length - 2] === 'themes';
        // const name = ancestry.slice(ancestry.lastIndexOf("/") + 1);
        const parent = ancestry.slice(0, ancestry.lastIndexOf('/'));
        const indexJsonUrl = `/${path.relative(__dirname, path.join(fwDir, '-index.json'))}`;

        if (!targets.find(t => t.name === ancestry)) {
            let kind;

            if (isApp) {
                kind = 'app';
            } else if (isFw) {
                kind = 'framework';
            } else if (isTheme) {
                kind = 'theme';
            } else {
                kind = 'unknown';
            }

            targets.push({
                name: ancestry,
                kind,
                parent,
                // eslint-disable-next-line @typescript-eslint/camelcase
                link_tests: indexJsonUrl,
                // eslint-disable-next-line @typescript-eslint/camelcase
                link_root: `/${path.relative(__dirname, fwDir)}`,
            });
        }
    });

    return targets;
}

function getAllIndexJsons(testInfos) {
    const indexes = {};

    testInfos.forEach(testInfo => {
        const { filename, indexJsonUrl, htmlUrl } = testInfo;

        if (!indexes[indexJsonUrl]) {
            indexes[indexJsonUrl] = [];
        }

        indexes[indexJsonUrl].push({
            filename,
            url: htmlUrl,
        });

        /*
        {
            type: "object",
            properties: {
                filename: { type: "string", description: "contains the filename without extension of the test file" },
                url: { type: "string", description: "url to a html, containing the test, wrapped in a special html file" }
            }
        }
        */
    });

    return indexes;
}

const testingFw = path.resolve(__dirname, 'frameworks/testing/index.js');
const debugFw = path.resolve(__dirname, 'frameworks/debug/index.js');
const qunitFw = path.resolve(__dirname, 'frameworks/qunit/index.js');

const configEntry = devConfig.entry;

configEntry.testing = testingFw;
configEntry.debug = debugFw;
configEntry.qunit = qunitFw;

console.log('configEntry.testing', configEntry.testing);

const allTests = scanDir(path.join(__dirname, 'apps'))
    .concat(scanDir(path.join(__dirname, 'frameworks')))
    .concat(scanDir(path.join(__dirname, 'themes')))
    .map(testInfo => {
        const freename = path.relative(__dirname, testInfo.path);
        const entryName = path.join(path.dirname(freename), path.basename(freename, '.js')).replace(/\//g, "_");

        const fwDir = path.dirname(testInfo.indexJs);
        const filename = path.relative(fwDir, testInfo.path);
        const fwUrl = path.relative(__dirname, fwDir);
        const fnUrl = path.dirname(filename);

        const indexJsonUrl = `/${path.relative(__dirname, path.join(fwDir, '-index.json'))}`;
        const htmlUrl = `/${path.join(fwUrl, fnUrl, `${path.basename(filename, '.js')}.html`)}`;

        return {
            ...testInfo,
            entryName,
            filename,
            indexJsonUrl,
            htmlUrl,
        };
    });


    // add an entrypoint for each of the tests
allTests.forEach(testInfo => {
    const { entryName } = testInfo;
    const ep = testInfo.import;
    if (ep.includes(testingFw)) {
        configEntry[entryName] = testInfo.import.concat(debugFw).reverse();
    }
    else {
        configEntry[entryName] = testInfo.import.concat(testingFw, debugFw).reverse();
    }
    // const entrypoints = testInfo.import.concat(testingFw, debugFw).reverse();
    // configEntry[entryName] = entrypoints;
});

// have malformed.json treated as
devConfig.module = devConfig.module ?? {};
devConfig.module.rules = devConfig.module.rules ?? [];
//@ts-ignore
devConfig.output.filename = '[name].js';
devConfig.module.rules.push(
    {
        test: /malformed\.json$/,
        type: 'asset/resource',
    },
    {
        test: /file_exists\.json$/,
        type: 'asset/resource',
    },
    {
        test: /\.mp3$/,
        type: 'asset/resource',
    },
    {
        test: /\.swf$/,
        type: 'asset/resource',
    },
    {
        test: /.*\/(tests|debug)\/.*\.js$/,
        // type: 'asset/resource',
        // technically I could create a html file here for every test js file
        // but only when in dev mode... This would make sure that you simply require
        // all tests js files, and it emits html files... could even emit a full list with all test files...
        use: [
            {
                loader: 'imports-loader',
                options: {
                    wrapper: {
                        thisArg: 'window',
                        args: [
                            '$=window.SC.$',
                            'jQuery=window.SC.$',
                            'exports=0',
                            'module=window.ctModule',
                            'test=window.ctTest',
                            'clearHtmlbody=window.ctClearHtmlbody',
                            'htmlBody=window.ctHtmlbody',
                        ],
                    },
                    additionalCode: 'var define = undefined;',
                },
            },
        ],
    }
);

devConfig.devServer.liveReload = false;
devConfig.devServer.hot = false;
devConfig.devServer.webSocketServer = false;


class CompilerHookPlugin {
    constructor(options) {
        this.options = options;
    }

    apply(compiler) {
        (Object.keys(this.options)).forEach( hookName => {
                // This hook function typing is a bit too complicated so just using
                // "any" as an escape hatch for now
                const fn = this.options[hookName];
                compiler.hooks[hookName].tap('CompilerHookPlugin', fn);
            }
        );
    }
}

let compilationStats;

devConfig.plugins = devConfig.plugins ?? [];
// this is very brittle, as it tries to refer to the mini css extract plugin by location in the plugins 
// array. A better detection would be better.
devConfig.plugins[0].options.filename = '[name].css';

// this is to provide the sc/targets.json and the -index.json
devConfig.devServer.onBeforeSetupMiddleware = function (devServer) {
    const app = devServer.app;
    app.post('/', function (req, res) {
        // this is specifically for the request post and upload event tests.
        res.send('ok');
    });
    
    app.get('/ready', function (req, res) {
        // only return 200 status if compilation is completed
        if (compilationStats) {
            res.send('ok');
        } else {
            res.sendStatus(503);
        }
    });
    
    app.get('/sc/targets.json', function (req, res) {
        const targets = getAllTargets(allTests);
        res.send(JSON.stringify(targets));
    });

    const allIndexJsons = getAllIndexJsons(allTests);
    Object.keys(allIndexJsons).forEach(indexJsonUrl => {
        const responseContent = allIndexJsons[indexJsonUrl];
        // add the test -index.json endpoint
        app.get(indexJsonUrl, function (req, res) {
            /*
                    {
                        type: "object",
                        properties: {
                            filename: { type: "string", description: "contains the filename without extension of the test file" },
                            url: { type: "string", description: "url to a html, containing the test, wrapped in a special html file" }
                        }
                    }
                    */

            res.send(JSON.stringify(responseContent));
        });
    });

    // add the HTML endpoints for each test
    allTests.forEach(testInfo => {
        const { htmlUrl, entryName } = testInfo;
        //@ts-ignore
        // add the test HTML endpoint
        app.get(htmlUrl, function (req, res) {
            const entrypoint = compilationStats.compilation.entrypoints.get(entryName);

            if (entrypoint === undefined) {
                throw new Error(`Cannot find entrypoint for ${entryName}`);
            }

            const files = Array.from(entrypoint.getEntrypointChunk().files);
            const jsPath = files.find(f => f.match(/\.js$/));
            const cssPath = files.find(f => f.match(/\.css$/));

            const html = `
            <html>
              <head>
                <title>${htmlUrl}</title>
                <link rel="stylesheet" href="/${cssPath}">
              </head>
              <body>
                <script>
                  window.SC = {};
                </script>
                <script src="/${jsPath}">
                </script>
              </body>
            </html>
          `;

            res.send(html);
        });
    });
};



module.exports = devConfig;