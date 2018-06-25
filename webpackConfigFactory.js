'use strict';

var _ = require('lodash'),
    webpackStream = require('webpack-stream'),
    webpack = webpackStream.webpack,
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    ManifestPlugin = require('webpack-manifest-plugin'),
    CopyWebpackPlugin = require('copy-webpack-plugin'),
    autoprefixer = require('autoprefixer');

var copyFileExtensions = /\.(ico|png|jpg|jpeg|gif|svg|ttf|otf|eot|woff|woff2)/;

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
        commonChunkConfig = getDefaultValue(config.commonChunkConfig, {name: 'common'}),

        publicPath = getDefaultValue(config.publicPath, ''),
        rootPath = getDefaultValue(config.rootPath, __dirname + '/../../'),
        frontendPath = getDefaultValue(config.frontendPath, []),
        filesPath = getDefaultValue(config.filesPath, false),

        presets = getDefaultValue(config.presets, ['es2015']),
        aliases = getDefaultValue(config.aliases, []),
        provides = getDefaultValue(config.provides, []);

    var extractWrapper = getExtractWrapper(extract ? ExtractTextPlugin : undefined);

    frontendPath = _.isArray(frontendPath) ? frontendPath : [frontendPath];

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

            loaders: _.concat(
                [{
                    test: /\.js$/,
                    loader: 'babel',
                    exclude: /(node_modules|bower_components|vendor)/,
                    query: {
                        presets: presets
                    }
                }, {
                    test: /\.css$/,
                    loader: extractWrapper(minimize ? 'css?minimize!postcss-loader' : 'css!postcss-loader')
                }, {
                    test: /\.less$/,
                    loader: extractWrapper(minimize ? 'css?minimize!postcss-loader!less' : 'css!postcss-loader!less')
                }, {
                    test: /\.scss$/,
                    loader: extractWrapper(minimize ? 'css?minimize!postcss-loader!sass' : 'css!postcss-loader!sass')
                }, {
                    test: copyFileExtensions,
                    include: /\/(bower_components|node_modules|vendor)\//,
                    loader: 'file?name=[2]&regExp=/(bower_components|node_modules|vendor)/(.*)'
                }],

                _.map(frontendPath, function (path) {
                    return {
                        test: copyFileExtensions,
                        include: new RegExp(path),
                        loader: 'file?name=[1]&regExp=' + path + '(.*)'
                    }
                })
            )
        },

        postcss: [autoprefixer({browsers: ['last 2 versions']})],

        plugins: _.concat([
                new webpack.DefinePlugin({
                    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
                }),
                new webpack.NoErrorsPlugin(),
                new webpack.ProvidePlugin(provides),
                new webpack.optimize.CommonsChunkPlugin(commonChunkConfig)
            ],
            manifest ? [new ManifestPlugin({basePath: publicPath})] : [],
            minimize ? [new webpack.optimize.UglifyJsPlugin()] : [],
            extract ? [new ExtractTextPlugin(hash ? '[name]-[hash].css' : '[name].css', {allChunks: true})] : [],
            filesPath ? [new CopyWebpackPlugin([{from: filesPath}])] : []
        )
    };
};
