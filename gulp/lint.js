'use strict';

var gulp   = require('gulp');
var plugins = require('gulp-load-plugins')();

module.exports = function (paths, config) {
  gulp.task('lint', function () {
    return gulp.src(paths.src)
      .pipe(plugins.jshint('.jshintrc'))
      .pipe(plugins.jshint.reporter('jshint-stylish'));
  });
};
