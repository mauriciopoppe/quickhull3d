'use strict';

var path = require('path');
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

module.exports = function (paths, config) {
  gulp.task('istanbul', function (cb) {
    gulp.src(paths.src)
      .pipe(plugins.istanbul()) // Covering files
      .pipe(plugins.istanbul.hookRequire()) // Force `require` to return covered files
      .on('finish', function () {
        gulp.src(path.resolve(paths.testDir, 'index.js'), {cwd: __dirname})
          .pipe(plugins.plumber(config.plumber))
          .pipe(plugins.mocha())
          .pipe(plugins.istanbul.writeReports()) // Creating the reports after tests runned
          .on('finish', function() {
            process.chdir(__dirname);
            cb();
          });
      });
  });
};