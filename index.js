'use strict';

var _ = require('lodash'),
    webpackConfigFactory = require('./webpackConfigFactory'),
    webpack = require('webpack-stream'),
    gulplog = require('gulplog'),
    notify = require('gulp-notify'),
    plumber = require('gulp-plumber'),
    named = require('vinyl-named');

module.exports = function (gulp, configExpr) {
    return function (callback) {
        var config = _.isFunction(configExpr) ? configExpr() : configExpr;
        var webpackConfig = webpackConfigFactory(config);
        var watch = config.watch || false,
            isOld = config.old || false,
            entry = config.entry,
            destinations = _.isArray(config.destination) ? config.destination : [config.destination];

        var firstBuildReady = false;

        var done = function (err, stats) {
            gulplog[stats.hasErrors() ? 'error' : 'info'](stats.toString({
                colors: true
            }));

            if (!firstBuildReady) {
                callback();
            }

            firstBuildReady = true;
        };

        var gulpPipe = gulp.src(entry)
            .pipe(plumber({
                errorHandler: function(err) {
                    notify.onError({
                        title:    'Webpack',
                        message: _.truncate(err.message, {
                            length: 250
                        })
                    })(err);
                }
            }))
            .pipe(named())
            .pipe(webpack(webpackConfig, null, done));

        _.forEach(destinations, function (destination) {
            gulpPipe.pipe(gulp.dest(destination));
        });

        return gulpPipe;
    };
};
