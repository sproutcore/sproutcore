const mergeWithRules = require('webpack-merge').mergeWithRules;
const CssMinimizePlugin = require('css-minimizer-webpack-plugin');

const commonConfig = require('./webpack.common.js');

const prodConfig = {
    mode: 'production',
    optimization: {
        minimizer: ['...', new CssMinimizePlugin()]
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules|fixtures|min\.js$/,
            },
        ],
    },
    devtool: 'hidden-source-map',
};

module.exports = mergeWithRules({
    module: {
        rules: {
            test: 'match',
            exclude: 'replace',
        },
    }
})(commonConfig, prodConfig);