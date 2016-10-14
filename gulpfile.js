var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var del = require('del');
// Get new module : you can search at http://gulpjs.com/plugins/ (don't forget it should be saved in package.json)

// Todo: need to add new path to target .scss files
var paths = {
  scripts: ['src/js/**/*.js', '!src/external/**/*.js'],
  images: 'src/img/**/*'
};

// Todo: Need to run the sass task when building
gulp.task('build', gulp.series(
  clean,
  gulp.parallel(scripts, images)
));

gulp.task(clean);
gulp.task(watch);
gulp.task('default', gulp.series('build', watch));
 
 
function clean() {
  return del(['build']);
}
 
function images() {
  return gulp.src(paths.images)
    .pipe(imagemin({optimizationLevel: 5}))
    .pipe(gulp.dest('build/img'));
}
 
function scripts() {
  return gulp.src(paths.scripts)
    .pipe(uglify())
    .pipe(concat('all.min.js'))
    .pipe(gulp.dest('build/js'));
}

// Todo: add a function to compile sass into css

 
// Todo: Watch for modification in scss files
function watch() {
  gulp.watch(paths.scripts, scripts);
  gulp.watch(paths.images, images);
}