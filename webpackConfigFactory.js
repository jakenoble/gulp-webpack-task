'use strict';

var _ = require('lodash'),
    webpackStream = require('webpack-stream'),
    webpack = webpackStream.webpack,
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    ManifestPlugin = require('webpack-manifest-plugin');

module.exports = function (isDevelopment, config) {
    var extractCss = config.extractCss !== undefined ? config.extractCss : true;

    return {
        context: __dirname + '/../../',
        watch: config.watch,
        devtool: isDevelopment ? 'cheap-inline-source-map' : null,

        output: {
            filename: config.hash ? '[name]-[hash].js' : '[name].js',
            publicPath: config.publicDir
        },

        resolve: {
            root: __dirname + '/../../',
            modulesDirectories: [
                'node_modules',
                'bower_components'
            ],
            alias: config.aliases
        },

        module: {

            loaders: _.concat(
                [{
                    test: /\.js$/,
                    loader: 'babel',
                    exclude: /(node_modules|bower_components)/,
                    query: {
                        presets: config.presets ? config.presets : ['es2015']
                    }
                }],

                extractCss ? [{
                    test: /\.css$/,
                    loader: ExtractTextPlugin.extract(isDevelopment ? 'css' : 'css?minimize')
                }, {
                    test: /\.less$/,
                    loader: ExtractTextPlugin.extract(isDevelopment ? 'css!less' : 'css?minimize!less')
                }, {
                    test: /\.scss$/,
                    loader: ExtractTextPlugin.extract(isDevelopment ? 'css!sass' : 'css?minimize!sass')
                }] : [{
                    test: /\.css$/,
                    loader: isDevelopment ? 'style!css' : 'style!css?minimize'
                }, {
                    test: /\.less$/,
                    loader: isDevelopment ? 'style!css!less' : 'style!css?minimize!less'
                }, {
                    test: /\.scss$/,
                    loader: isDevelopment ? 'style!css!sass' : 'style!css?minimize!sass'
                }],

                [{
                    test: /\.(png|jpg|gif|svg|ttf|otf|eot|woff|woff2)/,
                    include: new RegExp(config.frontendDir),
                    loader: 'file?name=[1]&regExp=' + config.frontendDir + '(.*)'
                }, {
                    test: /\.(png|jpg|gif|svg|ttf|otf|eot|woff|woff2)/,
                    include: /\/(bower_components|node_modules)\//,
                    loader: 'file?name=[2]&regExp=/(bower_components|node_modules)/(.*)'
                }]
            )
        },

        plugins: _.concat([
            new webpack.NoErrorsPlugin(),
            new ManifestPlugin({basePath: config.publicDir}),
            new webpack.ProvidePlugin(config.provides)
        ], isDevelopment ? [] : [
            new webpack.optimize.UglifyJsPlugin()
        ], !extractCss ? [] : [
            new ExtractTextPlugin(config.hash ? '[name]-[hash].css' : '[name].css', {allChunks: true})
        ])
    };
};
