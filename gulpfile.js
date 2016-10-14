var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var del = require('del');
var sass = require('gulp-sass');

var paths = {
  scripts: ['src/js/**/*.js', '!src/external/**/*.js'],
  images: 'src/img/**/*',
  scss: 'src/scss/**/*.scss'
};

gulp.task('build', gulp.series(
  clean,
  gulp.parallel(scripts, images, scss)
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

function scss() {
  return gulp.src(paths.scss)
    .pipe(sass())
    .pipe(gulp.dest('build/css'));
}

// Todo: Watch for modification in scss files
function watch() {
  gulp.watch(paths.scripts, scripts);
  gulp.watch(paths.images, images);
  gulp.watch(paths.scss, scss);
}