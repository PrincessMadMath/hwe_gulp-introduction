var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var del = require('del');

/* Defines globs to target specic files type */
var paths = {
  scripts: ['src/js/**/*.js', '!src/external/**/*.js'],
  images: 'src/img/**/*'
};
 
/* Register some tasks to expose to the cli */
gulp.task('build', gulp.series(
  clean,
  gulp.parallel(scripts, images)
));
gulp.task(clean);
gulp.task(watch);
 
// The default task (called when you run `gulp` from cli) 
gulp.task('default', gulp.series('build', watch));
 
 
/* Define our tasks using plain functions */
 
// Will delete the directory name build
function clean() {
  // Return a promise: (gulp required that the function return a promise, a stream or alternatively take a call back and call it)
  return del(['build']);
}
 
// Take all images find in paths.images, minify them and save each of them in "build/img" (initial one doesn't change)
function images() {
  return gulp.src(paths.images)
    // imagemin is the module required at the beginning of the files, some module can take option
    .pipe(imagemin({optimizationLevel: 5}))
    .pipe(gulp.dest('build/img'));
}
 
// Minify all JavaScript (except vendor scripts) and save the concatanate result in "build/js"
function scripts() {
  return gulp.src(paths.scripts)
    .pipe(uglify())
    .pipe(concat('all.min.js'))
    .pipe(gulp.dest('build/js'));
}
 
// Rerun the task when a file changes 
function watch() {
  gulp.watch(paths.scripts, scripts);
  gulp.watch(paths.images, images);
}