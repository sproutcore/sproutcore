const testConfig = require('./webpack.tests.js');

testConfig.plugins.push(
    new CompilerHookPlugin({
        done: (stats) => {
            console.log('\n\nTest server ready!\n\n');
            compilationStats = stats;
            // auto start the tests here...
            const { spawn } = require('child_process');
            // - node scripts/run_puppeteer.js --exclude-targets "/sproutcore/greenhouse,/sproutcore/frameworks/designer"
            const test_runner = spawn("node", ["./scripts/run_puppeteer.js", '--exclude-targets "/sproutcore/greenhouse,/sproutcore/frameworks/designer"']);
            test_runner.stdout.on('data', data => {
                console.log(data.toString());
            });
            test_runner.stderr.on('data', data => {
                console.log('stderr: ', data.toString());
            });

            test_runner.on('close', code => {
                console.log('test runner exited with code', code);
                process.exit(code); // also quit the dev server
            });
        },
    })
);

module.exports = testConfig;