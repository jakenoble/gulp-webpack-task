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
            destination = config.destination;

        var firstBuildReady = false;

        var done = function (err, stats) {
            firstBuildReady = true;

            if (err) {
                return;
            }

            gulplog[stats.hasErrors() ? 'error' : 'info'](stats.toString({
                colors: true
            }));
        };

        return gulp.src(entry)
            .pipe(plumber({
                errorHandler: notify.onError(function (err) {
                    return {
                        title: 'Webpack',
                        message: _.truncate(err.message, {
                            length: 250
                        })
                    }
                })
            }))
            .pipe(named())
            .pipe(webpack(webpackConfig, null, done))
            .pipe(gulp.dest(destination))
            .on('data', function () {
                if (!isOld && firstBuildReady && watch) {
                    setTimeout(callback, 100);
                }
            })
            .on('end', function () {
                if (!isOld) {
                    callback();
                }
            });
    };
};
