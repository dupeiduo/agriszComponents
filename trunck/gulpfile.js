const gulp = require('gulp'),
  babel = require('gulp-babel'),
  del = require('del'),
  sequence = require('gulp-sequence')

var rootPath = 'agrisz-*/*',
  lessPath = `${rootPath}/*.less`,
  jsonPath = `${rootPath}/*.json`,
  jsPath = `${rootPath}/*.js`



gulp.task('copy', function(){
  return gulp.src([lessPath, jsonPath, '!*.svn'])
    .pipe(gulp.dest('../tags/'))
})

gulp.task('turnes6', () =>
  gulp.src(jsPath)
  .pipe(babel({
    presets: ['es2015']
  }))
  .pipe(gulp.dest('../tags'))
);



gulp.task('default', sequence('copy', 'turnes6'));
