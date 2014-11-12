'use strict';

var gulp = require('gulp'),
  del = require('del');

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('lint', function () {
  var jshint = require('gulp-jshint');

  return gulp.src('app/js/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('test', function () {
  var qunit = require('node-qunit-phantomjs');

  qunit('./tests/index.html');
});

gulp.task('images', function () {
  return gulp.src('app/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}')
    .pipe(gulp.dest('dist/images'));
});

gulp.task('templates', function () {
  var wrap = require('gulp-wrap'),
    concat = require('gulp-concat'),
    declare = require('gulp-declare'),
    handlebars = require('gulp-handlebars');

  return gulp.src('app/templates/**/*.hbs')
    .pipe(handlebars({
      handlebars: require('ember-handlebars')
    }))
    .pipe(wrap('Ember.Handlebars.template(@@contents)'))
    .pipe(declare({
      namespace: 'Ember.TEMPLATES',
      noRedeclare: true
    }))
    .pipe(concat('compiled-templates.js'))
    .pipe(gulp.dest('.tmp/js'));
});

gulp.task('html', ['templates'], function () {
  var uglify = require('gulp-uglify'),
    minifyCss = require('gulp-minify-css'),
    useref = require('gulp-useref'),
    gulpif = require('gulp-if'),
    assets = useref.assets();

  return gulp.src('app/*.html')
    .pipe(assets)
    .pipe(gulpif('*.js', uglify()))
    .pipe(gulpif('*.css', minifyCss()))
    .pipe(assets.restore())
    .pipe(useref())
    .pipe(gulp.dest('dist'));
});

// inject bower components
gulp.task('wiredep', function () {
  var wiredep = require('wiredep').stream;

  gulp.src('app/*.html')
    .pipe(wiredep())
    .pipe(gulp.dest('app'));
});

gulp.task('connect', ['templates'], function () {
  var connect = require('connect');
  var serveStatic = require('serve-static');
  var serveIndex = require('serve-index');
  var app = connect()
    .use(require('connect-livereload')({ port: 35729 }))
    .use(serveStatic('app'))
    .use(serveStatic('.tmp'))
    // paths to bower_components should be relative to the current file
    // e.g. in app/index.html you should use ../bower_components
    .use('/bower_components', serveStatic('bower_components'))
    .use(serveIndex('app'));

  require('http').createServer(app)
    .listen(9000)
    .on('listening', function () {
      console.log('Started connect web server on http://localhost:9000');

      require('opn')('http://localhost:9000');
    });
});

gulp.task('serve', ['connect'], function () {
  var livereload = require('gulp-livereload');

  livereload.listen();

  // watch for changes
  gulp.watch([
    'app/*.html',
    'app/css/**/*.css',
    '.tmp/js/**/*.js',
    'app/js/**/*.js',
    'app/images/**/*'
  ]).on('change', livereload.changed);

  gulp.watch('app/templates/**/*.hbs', ['templates']);
  gulp.watch('bower.json', ['wiredep']);
});

gulp.task('build', ['lint', 'test', 'html', 'images']);

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});
