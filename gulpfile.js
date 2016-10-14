var gulp = require('gulp');

/* Defines globs to target specic files type */
var paths = {
  scripts: ['src/js/**/*.js', '!src/external/**/*.js'],
};
 
/****** Register some tasks to expose to the cli ******/

// We can call using: gulp build
gulp.task('build',  scripts);

// We can call using: gulp watch
gulp.task(watch);
 
// The default task, we can call using: gulp
gulp.task('default', gulp.series('build', watch));
 
 
/****** Define our tasks using plain functions ******/
 
 
// Copying all JavaScript (except vendor scripts) into "build/js"
function scripts() {
  return gulp.src(paths.scripts)
    .pipe(gulp.dest('build/js'));
}
 
// Re-run the task when a file changes 
function watch() {
  gulp.watch(paths.scripts, scripts);
}