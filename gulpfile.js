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
  src : {
    html: 'src/**/*.html',
    scss: 'src/scss/**/*.scss',
    css : 'src/css/**/*.css',
    js: 'src/js/**/*.js',
    images: 'src/img/**/*',
  },
  temp : './temp',
  tempAssets : {
    html: 'temp/**/*.html',
    scss: 'temp/**/*.scss',
    css : 'temp/**/*.css',
    js: 'temp/**/*.js',
    images: 'temp/**/*',
  },
  build : {
    root : 'build/',
    html: 'build/',
    css : 'build/css/',
    js: 'build/js',
    images: 'build/img/',
  },
  buildWatch: {
    html: 'build/**/*.html',
    css : 'build/css/**/*.css',
    js: 'build/js/**/*.js',
    images: 'build/img/**/*',
  } 
};

/*************** Task definition ***************/

gulp.task('build:temp', gulp.series(
  cleanAsset, 
  gulp.parallel(copyHtml, copyScript, copyCss, copyImages, compileSass)
));

gulp.task('build:build', gulp.series(
  cleanBuild,
  gulp.parallel(buildHtml, buildScript, buildCss, buildImages)
));

gulp.task('build', gulp.series('build:temp', 'build:build'));

gulp.task('clean', gulp.parallel(cleanAsset, cleanBuild));

gulp.task('server', gulp.series('build', gulp.parallel(watchBuild, watchServer, startServer)));

gulp.task('test', copyHtml);

/*************** Utils function ***************/

function cleanAsset() {
  return del([paths.temp]);
}

function cleanBuild() {
  return del([paths.build.root]);
}

/*************** Pre-compile function ***************/

function copyHtml(){
  return gulp.src(paths.src.html)
    .pipe(gulp.dest(paths.temp));
}

function copyScript(){
  return gulp.src(paths.src.js)
    .pipe(gulp.dest(paths.temp));
}

function copyCss(){
  return gulp.src(paths.src.css)
    .pipe(gulp.dest(paths.temp));
}

function copyImages(){
  return gulp.src(paths.src.images)
    .pipe(gulp.dest(paths.temp));
}

function compileSass(){
    return gulp.src(paths.src.scss)
    .pipe(sass())
    .pipe(gulp.dest(paths.temp));
}

/*************** Build functions (make ready for production) ***************/

function buildHtml(){
  return gulp.src(paths.tempAssets.html)
  .pipe(gulp.dest(paths.build.html));
}

// Only take from .temp and minify
function buildCss() {
  return gulp.src(paths.tempAssets.css)
    .pipe(cssnano())
    .pipe(gulp.dest(paths.build.css));
}

function buildImages() {
  return gulp.src(paths.tempAssets.images)
    .pipe(imagemin({optimizationLevel: 5}))
    .pipe(gulp.dest(paths.build.images));
}

function buildScript() {
  return gulp.src(paths.tempAssets.js)
    .pipe(uglify())
    .pipe(concat('all.min.js'))
    .pipe(gulp.dest(paths.build.js));
}

/*************** Watcher functions (change -> build) ***************/

// When a modification is done in the src folder, update the build
function watchBuild() {
  gulp.watch(paths.src.html, gulp.series(copyHtml, buildHtml));
  gulp.watch(paths.src.js, gulp.series(copyScript, buildScript));
  gulp.watch(paths.src.images, gulp.series(copyImages, buildImages));
  gulp.watch(paths.src.scss, gulp.series(compileSass, buildCss));
  gulp.watch(paths.src.css,  gulp.series(copyCss, buildCss));
}

// When change occurs in /build reload-server
function watchServer() {
  gulp.watch(paths.buildWatch.html, reload);
  gulp.watch(paths.buildWatch.js, reload);
  gulp.watch(paths.buildWatch.images, reload);
  gulp.watch(paths.buildWatch.css,  injectCss);
}

function reload(done){
  browserSync.reload();
  done();
}

// Todo: what if src not from same place as baseDir
function injectCss(){
  return gulp.src('build/css/**/*.css')
    .pipe(browserSync.stream());
}

function startServer(){
  browserSync.init({
    server: {
      baseDir: paths.build.root
    }
  });
}
