'use strict';

var path = require('path');
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

module.exports = function (paths, config) {
  gulp.task('test', function () {
    return gulp.src(path.resolve(paths.testDir, 'index.js'))
      .pipe(plugins.mocha({ reporter: 'spec' }))
      .on('error', function (err) {
        console.error(err);
      });
  });

  gulp.task('watch:test', function () {
    return gulp.watch([
      paths.src,
      paths.test
    ], ['test']);
  });
};