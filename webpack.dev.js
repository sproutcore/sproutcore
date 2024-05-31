const merge = require('webpack-merge').merge;

const common = require('./webpack.common.js');

const result = merge(common, {
    devServer: {
        devMiddleware: {
            publicPath: '/'
        },
        compress: true,
        historyApiFallback: true, // true for index.html upon 404, object for multiple paths
        hot: true, // hot module replacement. Depends on HotModuleReplacementPlugin
        https: false, // true for self-signed, object for cert authority
        host: '0.0.0.0',
        allowedHosts: 'all',
        port: 4020,
    }
});

module.exports = result;