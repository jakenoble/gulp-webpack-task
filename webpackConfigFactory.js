'use strict';

var _ = require('lodash'),
    webpackStream = require('webpack-stream'),
    webpack = webpackStream.webpack,
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    ManifestPlugin = require('webpack-manifest-plugin');

module.exports = function (isDevelopment, config) {
    return {
        context: __dirname + '/',
        watch: isDevelopment,
        devtool: isDevelopment ? 'cheap-inline-source-map' : null,

        output: {
            filename: isDevelopment ? '[name].js' : '[name]-[hash].js'
        },

        resolve: {
            root: __dirname,
            modulesDirectories: [
                'node_modules',
                'bower_components'
            ],
            alias: config.aliases
        },

        module: {

            loaders: [{
                test: /\.js$/,
                loader: 'babel',
                exclude: /(node_modules|bower_components)/,
                query: {
                    presets: ['es2015']
                }
            }, {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract(isDevelopment ? 'css' : 'css?minimize')
            }, {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract(isDevelopment ? 'css!less' : 'css?minimize!less')
            }, {
                test: /\.(png|jpg|gif|svg|ttf|otf|eot|woff|woff2)/,
                include: new RegExp(config.frontendDir),
                loader: 'file?name=[1]&regExp=' + config.frontendDir + '(.*)'
            }, {
                test: /\.(png|jpg|gif|svg|ttf|otf|eot|woff|woff2)/,
                include: /\/(bower_components|node_modules)\//,
                loader: 'file?name=[2]&regExp=/(bower_components|node_modules)/(.*)'
            }]

        },

        plugins: _.concat([
            new webpack.NoErrorsPlugin(),
            new ExtractTextPlugin(isDevelopment ? '[name].css' : '[name]-[hash].css', {allChunks: true}),
            new ManifestPlugin({basePath: config.publicDir}),
            new webpack.ProvidePlugin(config.provides)
        ], isDevelopment ? [] : [
            new webpack.optimize.UglifyJsPlugin()
        ])
    };
};
