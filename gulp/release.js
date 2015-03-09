'use strict';

var exec = require('child_process').exec;

var gulp   = require('gulp');
var plugins = require('gulp-load-plugins')();

module.exports = function (options) {
  function createTag(type, cb) {
    gulp.src(['./package.json', './bower.json'])
      .pipe(plugins.bump({ type: type }))
      .pipe(gulp.dest('./'))
      .pipe(plugins.git.commit('bump version'))
      .pipe(plugins.filter('package.json'))
      .pipe(plugins.tagVersion())
      .on('error', function (err) {
        console.error(err);
      });

    exec('./push.sh', function (err, stdout, stderr) {
      console.log(stdout);
      console.error(stderr);
      cb(err);
    });
  }

  gulp.task('release:major', function (cb) { createTag('major', cb); });
  gulp.task('release:minor', function (cb) { createTag('minor', cb); });
  gulp.task('release:patch', function (cb) { createTag('patch', cb); });
};