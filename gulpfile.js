var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var del = require('del');
var sass = require('gulp-sass');
var cssnano = require('gulp-cssnano');

// Plugin to enable live-reload (https://www.browsersync.io/docs/gulp)
var browserSync = require('browser-sync').create();

var paths = {
  scripts: ['src/js/**/*.js', '!src/external/**/*.js'],
  images: 'src/img/**/*',
  scss: 'src/scss/**/*.scss',
  html: 'src/**/*.html',
  css : ['src/css/**/*.css', 'temp/css/*.css'],
  localServer: './build'
};

gulp.task('build', gulp.series(
  clean,
  gulp.parallel(scripts, images, gulp.series(scss, css), html)
));

gulp.task(clean);
gulp.task('server', gulp.series('build', gulp.parallel(watch, startServer)));
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

// Todo: change for if .scss -> sass, but also copy .css in temp
function scss() {
  return gulp.src(paths.scss)
    .pipe(sass())
    .pipe(gulp.dest('temp/css'));
}

// Only take from .temp and minify
function css() {
  return gulp.src(paths.css)
    .pipe(cssnano())
    .pipe(gulp.dest('build/css'));
}

function html(){
  return gulp.src(paths.html)
  .pipe(gulp.dest('build/'));
}

// Todo: Watch for modification in scss files
function watch() {
  gulp.watch(paths.scripts, scripts);
  gulp.watch(paths.images, images);
  gulp.watch(paths.scss, gulp.series(scss, css));
  gulp.watch(paths.css, css);
  gulp.watch(paths.html, html);
}

function watchReload(){
  
}

// Todo: what if src not from same place as baseDir
function injectCss(){
  return gulp.src('build/css/**/*.css')
    .pipe(browserSync.stream());
}

function startServer(){
  browserSync.init({
    server: {
      baseDir: paths.localServer
    }
  });
}
