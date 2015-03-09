'use strict';

var gulp = require('gulp');

var paths = {
  testDir: './test/',
  srcDir: './lib/'
};
paths.src = [paths.srcDir + '**/*.js', './index.js'];
paths.test = [paths.testDir + '**/*.js'];
paths.lint =  ['./gulpfile.js'].concat(paths.src);
paths.watch = ['./gulpfile.js'].concat(paths.src).concat(paths.test);

var config = {
  plumber: {}
};

if (process.env.CI) {
  config.plumber.errorHandler = function(err) {
    throw err;
  };
}

// tasks:
// - lint
require('./gulp/lint')(paths, config);

// tasks
// - istanbul
require('./gulp/istanbul')(paths, config);

// tasks
// - test
// - watch:test
require('./gulp/test')(paths, config);

// tasks
// - release:major
// - release:minor
// - release:patch
require('./gulp/release')(paths, config);

// main tasks
gulp.task('watch', ['watch:test']);

gulp.task('default', ['watch']);