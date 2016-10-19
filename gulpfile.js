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
  src: "src/",
  temp: ".temp/",
  dist: "build/",
  glob: {
    html: ['**/*.html'],
    scss: ['scss/**/*.scss'],
    css : ['css/**/*.css'],
    js: ['js/**/*.js'],
    images: ['img/**/*'],
  },
  dest: {
    html: '',
    css : 'css/',
    js: 'js/',
    images: 'img/',
  },
}

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


/*************** Utils function ***************/

function cleanAsset() {
  return del([paths.temp]);
}

function cleanBuild() {
  return del([paths.dist]);
}

// Todo: this should but not calculated at runtime...
function prefixGlob(prefix, glob){
  return glob.map(function(el) { 
    return prefix + el; 
  })
}

/*************** Pre-compile function ***************/

function copyHtml(){
  var glob = prefixGlob(paths.src,paths.glob.html);
  var dest = paths.temp + paths.dest.html;

  return gulp.src(glob)
    .pipe(gulp.dest(dest));
}

function copyScript(){
  var glob = prefixGlob(paths.src,paths.glob.js);
  var dest = paths.temp + paths.dest.js;

  return gulp.src(glob)
    .pipe(gulp.dest(dest));
}

function copyCss(){
  var glob = prefixGlob(paths.src,paths.glob.css);
  var dest = paths.temp + paths.dest.css;

  return gulp.src(glob)
    .pipe(gulp.dest(dest));
}

function copyImages(){
  var glob = prefixGlob(paths.src,paths.glob.images);
  var dest = paths.temp + paths.dest.images;

  return gulp.src(glob)
    .pipe(gulp.dest(dest));
}

function compileSass(){
    var glob = prefixGlob(paths.src,paths.glob.scss);
    var dest = paths.temp + paths.dest.css;

    return gulp.src(glob)
    .pipe(sass())
    .pipe(gulp.dest(dest));
}

/*************** Build functions (make ready for production) ***************/

function buildHtml(){
  var glob = prefixGlob(paths.temp, paths.glob.html);
  var dest = paths.dist + paths.dest.html;

  return gulp.src(glob)
  .pipe(gulp.dest(dest));
}

// Only take from .temp and minify
function buildCss() {
  var glob = prefixGlob(paths.temp, paths.glob.css);
  var dest = paths.dist + paths.dest.css;

  return gulp.src(glob)
    .pipe(cssnano())
    .pipe(gulp.dest(dest));
}

function buildImages() {
  var glob = prefixGlob(paths.temp, paths.glob.images);
  var dest = paths.dist + paths.dest.images;

  return gulp.src(glob)
    .pipe(imagemin({optimizationLevel: 5}))
    .pipe(gulp.dest(dest));
}

function buildScript() {
  var glob = prefixGlob(paths.temp, paths.glob.js);
  var dest = paths.dist + paths.dest.js;

  return gulp.src(glob)
    .pipe(uglify())
    .pipe(concat('all.min.js'))
    .pipe(gulp.dest(dest));
}

/*************** Watcher functions (change -> build) ***************/

// When a modification is done in the src folder, update the build
function watchBuild() {
  var html_glob = prefixGlob(paths.src,paths.glob.html);
  var js_glob = prefixGlob(paths.src,paths.glob.js);
  var image_glob = prefixGlob(paths.src,paths.glob.images);
  var sass_glob = prefixGlob(paths.src,paths.glob.scss);
  var css_glob = prefixGlob(paths.src,paths.glob.css);

  gulp.watch(html_glob, gulp.series(copyHtml, buildHtml));
  gulp.watch(js_glob, gulp.series(copyScript, buildScript));
  gulp.watch(image_glob, gulp.series(copyImages, buildImages));
  gulp.watch(sass_glob, gulp.series(compileSass, buildCss));
  gulp.watch(css_glob,  gulp.series(copyCss, buildCss));
}

// When change occurs in /build reload-server
function watchServer() {
  var html_glob = prefixGlob(paths.dist,paths.glob.html);
  var js_glob = prefixGlob(paths.dist,paths.glob.js);
  var image_glob = prefixGlob(paths.dist,paths.glob.images);
  var css_glob = prefixGlob(paths.dist,paths.glob.css);

  gulp.watch(html_glob, reload);
  gulp.watch(js_glob, reload);
  gulp.watch(image_glob, reload);
  gulp.watch(css_glob,  injectCss);
}

function reload(done){
  browserSync.reload();
  done();
}

// Todo: what if src not from same place as baseDir
function injectCss(){
  var css_glob = prefixGlob(paths.dist,paths.glob.css);

  return gulp.src(css_glob)
    .pipe(browserSync.stream());
}

function startServer(){
  browserSync.init({
    server: {
      baseDir: paths.dist
    }
  });
}
