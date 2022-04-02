const webpack = require('webpack');

const prod = require('./webpack.prod.js');
const dev = require('./webpack.dev');

module.exports = function (env, args) {
    switch (args.mode) {
        case 'development': return dev;
        case 'production': return prod;
        default: return dev;
    }
}