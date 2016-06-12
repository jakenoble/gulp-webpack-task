'use strict';

var _ = require('lodash'),
    webpackConfigFactory = require('./webpackConfigFactory'),
    webpack = require('webpack-stream'),
    gulplog = require('gulplog'),
    notify = require('gulp-notify'),
    plumber = require('gulp-plumber'),
    named = require('vinyl-named');

module.exports = function (gulp, config, isDevelopment) {
    var webpackConfig = webpackConfigFactory(isDevelopment, config);

    return function (callback) {
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

        return gulp.src(config.entry)
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
            .
            pipe(named())
            .pipe(webpack(webpackConfig, null, done))
            .pipe(gulp.dest(config.destination))
            .on('data', function () {
                if (firstBuildReady && isDevelopment) {
                    setTimeout(callback, 100);
                }
            })
            .on('end', function () {
                callback();
            });
    };
};
