/**
 Puppeteer Unit Test Runner
 ==========================

 This script can be used to run the SproutCore unit tests in Puppeteer.

 This script can also be used to run tests locally, either for developing SproutCore
 or for all of your own app's unit tests.
 - Run sc-server. (If you run it on a custom port, note the port number and see below.)
 - Run this script to run the unit tests provided by sc-server.

 Run all tests:

   node test_runner.js

 Run all tests with sc-server running on a custom port:

   node test_runner.js --port 4021

 Run only runtime and desktop unit tests:

   node test_runner.js --include-targets "/sproutcore/runtime,/sproutcore/desktop"

 Run everything but greenhouse tests (a good idea):

   node test_runner.js --exclude-targets "/sproutcore/greenhouse"

 Get help:

   node test_runner.js -h
*/

// require modules
const minimist = require('minimist');
const puppeteer = require('puppeteer');

// constants
const EXIT_SUCCESS = 0;
const EXIT_FAILURE = 1;
const EXIT_ERROR = 2;
const PASSED = 'passed';
const FAILED = 'failed';
const ERRORS = 'errors';
const WARNINGS = 'warnings';
const TIMEOUT = 'timeout';
const SKIPPED = 'skipped';
const PASS_COLOR = '\x1b[32m';
const FAIL_COLOR = '\x1b[31m';
const ERROR_COLOR = '\x1b[41m';
const WARN_COLOR = '\x1b[33m';
const TIMEOUT_COLOR = '\x1b[36m';
const SKIPPED_COLOR = '\x1b[46m';
const RESET_COLOR = '\x1b[0m';
const TIMEOUT_WAIT = 30000;

// vars
const args = processArgs(process.argv.slice(2), process.env);
const urlRoot = `http://${args.host}:${args.port}`;

/**
 Processes command line arguments.

 Uses corresponding environment variables as the default values,
 allowing override by the command line arguments.

 @param {Array.<string>} args Command line arguments (minus argv[0])
 @param {Object} env Environment variables
 @returns {{ travis: boolean, host: string, port: number, includeTargets: ?Array, excludeTargets: ?Array,
             filter: ?RegExp, experimental: boolean, verbose: boolean, veryVerbose: boolean, help: boolean }}
*/
function processArgs(args, env) {
    args = minimist(args, {
        default: {
            travis: !!env.TRAVIS,
            host: env.HOST || 'localhost',
            port: env.PORT || 4020,
            includeTargets: null,
            excludeTargets: null,
            targetKinds: null,
            filter: null,
            experimental: true,
            verbose: !!env.VERBOSE && !env.TRAVIS,
            veryVerbose: !!env.VERY_VERBOSE,
            help: false,
        },
        alias: {
            includeTargets: 'include-targets',
            excludeTargets: 'exclude-targets',
            targetKinds: 'target-kinds',
            verbose: 'v',
            veryVerbose: ['V', 'very-verbose'],
            help: 'h',
        },
    });

    if (typeof args.includeTargets === 'string') {
        args.includeTargets = args.includeTargets.split(',');
    }
    if (typeof args.excludeTargets === 'string') {
        args.excludeTargets = args.excludeTargets.split(',');
    }
    if (typeof args.targetKinds === 'string') {
        args.targetKinds = args.targetKinds.split(',');
    }
    if (typeof args.filter === 'string') {
        args.filter = new RegExp(args.filter);
    }
    args.verbose = args.verbose || args.veryVerbose;

    if (args.includeTargets && args.excludeTargets) {
        throw new Error('Cannot whitelist and blacklist targets at the same time');
    }

    return args;
}

/**
 Logs a summary of the test results.

 Number of tests run out of total number of test is logged (some tests may not run because they were skipped).
 Number of tests that failed, had errors, had warnings, or timed out is logged.

 @param {Array} allResults The results object for each test (including skipped tests).
 @returns {number} Final result of the test run. Will be 0 if all tests passed, otherwise 1, so it can be passed
                   directly to process.exit().
*/
function logSummary(allResults) {
    let ran = 0;
    let passed = 0;
    let failed = 0;
    let errored = 0;
    let warned = 0;
    let timedout = 0;
    let skipped = 0;

    allResults.forEach(results => {
        if (results.result === PASSED) {
            passed++;
        } else if (results.result === FAILED) {
            failed++;
        } else if (results.result === ERRORS) {
            errored++;
        } else if (results.result === WARNINGS) {
            warned++;
        } else if (results.result === TIMEOUT) {
            timedout++;
        } else if (results.result === SKIPPED) {
            skipped++;
        }

        if (results.result !== SKIPPED) {
            ran++;
        }
    });

    const parts = ['\nRan ', ran, ' of ', `${allResults.length} tests.`];

    if (failed > 0) {
        parts.push(' ');
        parts.push(failed);
        parts.push(' failed.');
    }

    if (errored > 0) {
        parts.push(' ');
        parts.push(errored);
        parts.push(' had errors.');
    }

    if (warned > 0) {
        parts.push(' ');
        parts.push(warned);
        parts.push(' had warnings.');
    }

    if (timedout > 0) {
        parts.push(' ');
        parts.push(timedout);
        parts.push(' timed out.');
    }

    console.log(parts.join(''));

    allResults.forEach(results => {
        if (results.result !== PASSED && results.result !== SKIPPED) {
            logTestResult(results, results.test);
        }
    });

    return failed + errored + timedout > 0 ? EXIT_FAILURE : EXIT_SUCCESS;
}

/**
 Filters targets.

 If includeTargets or excludeTargets arguments were given to the script,
 they will be used to do the filtering.
 If includeTargets was specified, only those targets will be included.
 If excludeTargets was specified, all targets except those targets will be included.
 As a shortcut, the --no-experimental argument will filter out the /sproutcore/experimental
 frameworks.

 If a target is filtered out, it will be completely ignored. Its tests will not be considered
 when showing total tests and they will not be logged as skipped tests.

 @param {Object} target Target object to filter
 @returns {boolean} false if this target should be filtered out
*/
function filterTarget(target) {
    let include = true;

    if (args.targetKinds && args.targetKinds.indexOf(target.kind) < 0) {
        include = false;
    }
    if (args.excludeTargets && args.excludeTargets.indexOf(target.name) >= 0) {
        include = false;
    }
    if (args.includeTargets && args.includeTargets.indexOf(target.name) < 0) {
        include = false;
    }
    if (/^\/sproutcore\/experimental/.test(target.name) && !args.experimental) {
        include = false;
    }

    return include;
}

/**
 Filters tests.

 If a filter argument was given to the script, it will be used to do the filtering.
 The url of the test as returned by abbot will be tested against the filter regexp.

 If a test is filtered out, it will be considered a skipped test. It will be considered
 when showing total tests, and will be logged as a skipped test.

 @param {Object} test Test object to filter
 @returns {boolean} false if this test should be filtered out
*/
function filterTest(test) {
    return args.filter ? args.filter.test(test.url) : true;
}

/**
 Determines the text color for the given result.

 @param {string} result Result string
 @returns {string} ANSI escape code required to change
                   the text to the correct color for the test result
*/
function colorForResult(result) {
    let color;

    switch (result) {
        case PASSED:
            color = PASS_COLOR;
            break;
        case FAILED:
            color = FAIL_COLOR;
            break;
        case ERRORS:
            color = ERROR_COLOR;
            break;
        case WARNINGS:
            color = WARN_COLOR;
            break;
        case TIMEOUT:
            color = TIMEOUT_COLOR;
            break;
        case SKIPPED:
            color = SKIPPED_COLOR;
            break;
        default:
            color = '';
            break;
    }

    return color;
}

/**
 Determines what result the test should have based on the result of its assertions.

 @param {Object} results Results object for the test
 @returns {string} String describing the test result
*/
function getTestResult(results) {
    let testResult;

    if (results.isSkipped) {
        testResult = SKIPPED;
    } else if (results.isTimeout) {
        testResult = TIMEOUT;
    } else if (results.passed === results.total) {
        testResult = PASSED;
    } else if (results.errors > 0) {
        testResult = ERRORS;
    } else if (results.failed > 0) {
        testResult = FAILED;
    } else if (results.warnings > 0) {
        testResult = WARNINGS;
    }

    return testResult;
}

/**
 * Logs test assertions.
 *
 * If the verbose option is used, logs all test assertions, regardless of result.
 * Otherwise, only logs failed test assertions.
 *
 * @param {Object} results Test results object
 * @param {string} testResult Test result string
 */
function logTestAssertions(results, testResult) {
    let assertionsByTest;
    if (args.verbose || testResult === FAILED || testResult === ERRORS) {
        assertionsByTest = {};

        results.assertions.forEach(assertion => {
            const parts = assertion.module.split('\n');
            const testId = `${parts[1]} module: ${assertion.test}`;
            assertionsByTest[testId] = assertionsByTest[testId] || [];
            assertionsByTest[testId].push(assertion);
        });

        Object.keys(assertionsByTest).forEach(testId => {
            const assertions = assertionsByTest[testId];
            let firstFail = true;

            assertions.forEach(assertion => {
                let parts;
                let color;

                if (args.verbose || assertion.result !== PASSED) {
                    if (firstFail) {
                        console.log(testId);
                        firstFail = false;
                    }

                    color = colorForResult(assertion.result);
                    parts = ['  ', assertion.message, ': ', color, assertion.result, RESET_COLOR];

                    console.log(parts.join(''));
                }
            });
        });
    }
}

/**
 Logs the result of the test.

 @param {Object} results Results object for the test
 @param {Object} test Test object
*/
function logTestResult(results, test) {
    const testResult = getTestResult(results);
    const testResultColor = colorForResult(testResult);

    results.result = testResult;

    const parts = [
        '[',
        test.index + 1,
        '/',
        test.totalTests,
        ']',
        ' ',
        testResultColor,
        test.url,
        ' (',
        testResult,
        ')',
        RESET_COLOR,
    ];

    // Check that the test page actually ran (wasn't skipped, didn't timeout).
    if (results.tests > 0) {
        parts.push(': Completed ');
        parts.push(results.tests);
        parts.push(' tests in ');
        parts.push(results.runtime);
        parts.push(' msecs.');
        parts.push(' ');
        parts.push(results.total);
        parts.push(' total assertions:');

        if (results.passed > 0) {
            parts.push(' ');
            parts.push(PASS_COLOR);
            parts.push(results.passed);
            parts.push(' passed');
            parts.push(RESET_COLOR);
        }

        if (results.failed > 0) {
            parts.push(' ');
            parts.push(FAIL_COLOR);
            parts.push(results.failed);
            parts.push(' failed');
            parts.push(RESET_COLOR);
        }

        if (results.errors > 0) {
            parts.push(' ');
            parts.push(ERROR_COLOR);
            parts.push(results.errors);
            parts.push(' errors');
            parts.push(RESET_COLOR);
        }

        if (results.warnings > 0) {
            parts.push(' ');
            parts.push(WARN_COLOR);
            parts.push(results.warnings);
            parts.push(' warnings');
            parts.push(RESET_COLOR);
        }
    }

    // Add a note if there were unhandled exceptions on the page.
    // Any exceptions inside a test() are caught by the test runner,
    // so an unhandled exception must have happened either on page
    // load, or inside the test runner code. Either way, it's
    // bad news!
    if (results.hadUnhandledError) {
        parts.push(' ');
        parts.push(ERROR_COLOR);
        parts.push('(');
        parts.push('with unhandled errors');
        parts.push(')');
        parts.push(RESET_COLOR);
    }

    console.log(parts.join(''));
    logTestAssertions(results, testResult);
}

/**
 Configures the unit test page.

 Callbacks will be set up so that we can determine:
   * The result of the test.
   * If any unhandled exceptions occurred during the test.
   * If the test takes too long to run (possibly due to an unhandled exception).

 @param {WebPage} page Puppeteer page for the unit test
 @param {Object} test Test object
*/
function configureTestPage(page, test) {
    return new Promise(resolve => {
        let isCompleted = false;

        let timeoutId;

        // Set a reasonable viewport size.
        page.setViewport({ width: 1024, height: 768 });

        // When the unit test notifies us that it is complete,
        // resolve the promise and log the result.
        // The SproutCore tests was built for PhantomJS so uses `callPhantom`
        // to pass back the test results.
        page.exposeFunction('callPhantom', results => {
            // Make sure we haven't already resolved this test.
            if (!isCompleted) {
                page.close();
                results.test = test;
                clearTimeout(timeoutId);
                results.hadUnhandledError = !!test.hadUnhandledError;
                logTestResult(results, test);

                isCompleted = true;
                resolve(results);
            }
        });

        // If an unhandled exception or some other error occurs,
        // the test page may never invoke callPhantom. We want to
        // make sure we don't wait forever, so set a timeout.
        // If we hit this, we will resolve the promise as a timeout.
        timeoutId = setTimeout(() => {
            let results;

            // If not resolved yet, resolve as a timeout, possibly due to an
            // unhandled exception.
            if (!isCompleted) {
                page.close();

                results = {
                    isTimeout: true,
                    hadUnhandledError: !!test.hadUnhandledError,
                    test,
                };

                logTestResult(results, test);
                resolve(results);
            }
        }, TIMEOUT_WAIT);

        page.on('pageError', error => {
            const msg = error.message;

            // If very verbose, dump console messages to the console.
            if (args.veryVerbose) {
                console.log(`ERROR: ${msg}`);
            }
            // Indicate that an error occurred. This may or may not cause the unit
            // test to fail to complete. We will not resolve the promise right now.
            // Instead, wait to see if the script finished, otherwise the timeout
            // will handle it.
            test.hadUnhandledError = true;
        });

        if (args.veryVerbose) {
            // If very verbose, dump console messages to the console.
            page.onConsoleMessage = msg => {
                console.log(`CONSOLE: ${msg}`);
            };
        }
    });
}

/**
 * Helper function that creates a new page and for it to go to the provided URL.
 *
 * @param {*} browser Puppeteer browser object
 * @param {String} url url for the new page to go to
 * @param {Function} setupPage optional function for setting up the page
 */
function goToPage(browser, url, setupPage = () => {}) {
    return new Promise((resolve, reject) => {
        browser.newPage().then(page => {
            page.on('error', () => {
                reject(new Error(`Error for page: ${url}`));
            });

            // call the setup callback
            setupPage(page, resolve, reject);

            page.goto(url).catch(reject);
        });
    });
}

/**
 Start running a single unit test.

 Returns a promise which will be resolved when the unit test completes.
 If the test has been filtered out, the promise will be immediately
 resolved.

 @param {Object} test Test object
 @returns {Promise} Promise which will resolve upon test completion
*/
function runTest(browser, test) {
    // Check if we should run this test.
    if (filterTest(test)) {
        const url = urlRoot + test.url;
        return goToPage(browser, url, (page, resolve, reject) => {
            configureTestPage(page, test)
                .then(resolve)
                .catch(reject);
        });
    } else {
        // Resolve as a skipped test.
        const results = {
            isSkipped: true,
            test,
        };
        logTestResult(results, test);
        Promise.resolve(results);
    }
}

/**
 Runs all the unit tests.

 Returns a single promise which will resolve when all unit tests have completed.

 NOTE: the following note applies to the PhantomJS test runner. We may be able to
       parallelize the tests with node/puppeteer.

 This function is a little complex because we can't fire off all the tests in
 parallel. Doing so causes PhantomJS to run out of resources. So the
 promises need to be chained in sequence.

 @param {Array} tests Test object for all the unit tests
 @returns {Promise} Promise which will resolve when all tests finish
*/
function runTests(browser, tests) {
    const len = tests.length;

    // Reduce the tests down to a single promise.
    return tests.reduce((p, test, idx) => {
        // Set the index/length for the test, so we can log progress.
        test.index = idx;
        test.totalTests = len;

        // Chain a new promise...
        return p.then(allResults => {
            // that returns the promise from running the test...
            return runTest(browser, test).then(results => {
                // that pushes its result onto the list of test results.
                allResults.push(results);
                return allResults;
            });
        });
    }, Promise.resolve([]));
}

/**
 Fetches the tests for the given target.

 Follows the target's link_tests path to get the JSON list of
 test urls for the target.
 Returns a promise that resolves when the JSON page finishes loading
 and we get our list of tests.

 @param {Object} target Target object
 @returns {Promise} Promise which will resolve when we get the
                      list of test for the target
*/
function fetchTestsForTarget(browser, target) {
    const url = urlRoot + target.link_tests;

    return goToPage(browser, url, (page, resolve, reject) => {
        page.on('load', () => {
            const evalResults = page.evaluate(() => {
                return JSON.parse(document.getElementsByTagName('pre')[0].innerHTML);
            });

            evalResults
                .then(tests => {
                    if (tests) {
                        resolve(tests);
                        page.close();
                    } else {
                        reject(new Error('Could not find tests'));
                    }
                })
                .catch(error => {
                    reject(error);
                });
        });
    });
}

/**
 Fetches the tests for all targets.

 Returns a single promise which will resolve when all the tests for all targets
 have been fetched.

 @param {Array} targets Target objects for all the targets
 @returns {Promise} Promise which will resolve when all test for
                      all targets have been fetched
*/
function fetchTests(browser, targets) {
    // Reduce the targets down to a single promise.
    return targets.reduce((p, target) => {
        // Check if we should handle this target.
        if (filterTarget(target)) {
            // Chain a new promise...
            return p.then(allTests => {
                // that returns the promise from fetching the tests...
                return fetchTestsForTarget(browser, target).then(tests => {
                    // that pushes its result onto the list of tests.
                    return allTests.concat(tests);
                });
            });
        }
        // If we filter out the target, we completely ignore it.
        // So just return the previous promise, don't chain anything
        // extra for this target.
        return p;
    }, Promise.resolve([]));
}

/**
 Fetches the list of targets.

 Uses the special /sc/targets.json abbot url to get the JSON list of targets.
 Returns a promise that resolves when the JSON page finishes loading
 and we get our list of targets.

 @returns {Promise} Promise which will resolve when we get the list of targets
*/
function fetchTargets(browser) {
    const url = `${urlRoot}/sc/targets.json`;

    return goToPage(browser, url, (page, resolve, reject) => {
        page.on('load', () => {
            page.evaluate(() => {
                return JSON.parse(document.getElementsByTagName('pre')[0].innerHTML);
            })
              .then(targets => {
                  if (targets) {
                      page.close();
                      resolve(targets);
                  } else {
                      reject(new Error('Could not find targets'));
                  }
              })
              .catch(error => {
                  reject(error);
              });
        });
    });
}

/**
 Main entry point to the test runner.

 Handles the following steps:
   * Fetches the targets.
   * Fetches the tests for those targets (minus any filtered targets).
   * Runs the tests (including logging the result of each test).
   * Logs a summary of the test results.

 @returns {Promise} Promise that resolves when the test runner finishes.
*/
async function run() {
    const browser = await puppeteer.launch();

    const targets = await fetchTargets(browser);
    const tests = await fetchTests(browser, targets);
    const results = await runTests(browser, tests);
    return logSummary(results);
}

if (!args.help) {
    // Run the test runner.
    // Exit with an exit status indicating if the tests passed or failed.
    run()
        .then(finalResult => {
            process.exit(finalResult);
        })
        .catch(reason => {
            console.log(reason);
            process.exit(EXIT_ERROR);
        });
} else {
    console.log('SproutCore Puppeteer Test Runner');
    console.log('');
    console.log('  Runs unit tests under Puppeteer. Requires sc-server to be running.');
    console.log('  Options below, command line options override environment variables.');
    console.log('');
    console.log('Options:');
    console.log('');
    console.log('      --host, env[HOST]                  sc-server host [localhost]');
    console.log('      --port, env[PORT]                  sc-server port [4020]');
    console.log('      --include-targets                  Comma-delimited list of targets to include');
    console.log('      --exclude-targets                  Comma-delimited list of targets to exclude');
    console.log('      --target-kinds                     Comma-delimited list of target kinds to include');
    console.log('      --filter                           Regular expression to use to filter tests');
    console.log('      --[no-]experimetal                 Shortcut to control inclusion of experimental framework tests [true]');
    console.log('      --travis, env[TRAVIS]              Running under Travis CI [false]');
    console.log('  -v, --verbose, env[VERBOSE]            Log test assertion results [false]');
    console.log('  -V, --very-verbose, env[VERY_VERBOSE]  Log test page console messages [false]');
    console.log('  -h, --help                             This help page');

    process.exit(EXIT_SUCCESS);
}
