'use strict';

var _ = require('lodash'),
    webpackStream = require('webpack-stream'),
    webpack = webpackStream.webpack,
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    ManifestPlugin = require('webpack-manifest-plugin');

var getDefaultValue = function (value, defaultValue) {
    return value !== undefined ? value : defaultValue;
};
var getExtractWrapper = function (plugin) {
    return function (loaders) {
        return plugin ? plugin.extract(loaders) : loaders;
    };
};

module.exports = function (config) {
    var watch = getDefaultValue(config.watch, false),
        minimize = getDefaultValue(config.minimize, false),
        extract = getDefaultValue(config.extract, true),
        hash = getDefaultValue(config.hash, false),
        manifest = getDefaultValue(config.manifest, false),

        publicPath = getDefaultValue(config.publicPath, ''),
        rootPath = getDefaultValue(config.rootPath, __dirname + '/../../'),
        frontendPath = getDefaultValue(config.frontendPath, ''),

        presets = getDefaultValue(config.presets, ['es2015']),
        aliases = getDefaultValue(config.aliases, []),
        provides = getDefaultValue(config.provides, []);

    var extractWrapper = getExtractWrapper(extract ? ExtractTextPlugin : undefined);

    return {
        context: rootPath,
        watch: watch,

        output: {
            filename: hash ? '[name]-[hash].js' : '[name].js',
            publicPath: publicPath
        },

        resolve: {
            root: rootPath,
            modulesDirectories: [
                'node_modules',
                'bower_components'
            ],
            alias: aliases
        },

        module: {

            loaders: [{
                test: /\.js$/,
                loader: 'babel',
                exclude: /(node_modules|bower_components)/,
                query: {
                    presets: presets
                }
            }, {
                test: /\.css$/,
                loader: extractWrapper(minimize ? 'css?minimize' : 'css')
            }, {
                test: /\.less$/,
                loader: extractWrapper(minimize ? 'css?minimize!less' : 'css!less')
            }, {
                test: /\.scss$/,
                loader: extractWrapper(minimize ? 'css?minimize!sass' : 'css!sass')
            }, {
                test: /\.(png|jpg|gif|svg|ttf|otf|eot|woff|woff2)/,
                include: new RegExp(frontendPath),
                loader: 'file?name=[1]&regExp=' + frontendPath + '(.*)'
            }, {
                test: /\.(png|jpg|gif|svg|ttf|otf|eot|woff|woff2)/,
                include: /\/(bower_components|node_modules)\//,
                loader: 'file?name=[2]&regExp=/(bower_components|node_modules)/(.*)'
            }]
        },

        plugins: _.concat([
                new webpack.NoErrorsPlugin(),
                new webpack.ProvidePlugin(provides)
            ],
            manifest ? [new ManifestPlugin({basePath: publicPath})] : [],
            minimize ? [new webpack.optimize.UglifyJsPlugin()] : [],
            extract ? [new ExtractTextPlugin(hash ? '[name]-[hash].css' : '[name].css', {allChunks: true})] : []
        )
    };
};
