/*
 * slush-ember
 * https://github.com/jonkemp/slush-ember
 *
 * Copyright (c) 2014, Jonathan Kemp
 * Licensed under the MIT license.
 */

'use strict';

var gulp = require('gulp'),
    gutil = require('gulp-util'),
    install = require('gulp-install'),
    conflict = require('gulp-conflict'),
    template = require('gulp-template'),
    rename = require('gulp-rename'),
    _s = require('underscore.string'),
    inquirer = require('inquirer'),
    path = require('path'),
    gulpif = require('gulp-if'),
    replace = require('gulp-replace');

gulp.task('default', function (done) {

    gutil.log('Out of the box you get Ember.js Starter Kit to build your app.');

    inquirer.prompt([
        {
            type: 'confirm',
            name: 'moveon',
            message: 'Continue?'
        }
    ],
    function (answers) {
        var appname;

        if (!answers.moveon) {
            return done();
        }

        try {
            appname = require(path.join(process.cwd(), 'bower.json')).name;
        } catch (e) {
            try {
                appname = require(path.join(process.cwd(), 'package.json')).name;
            } catch (e) {}
        }

        if (!appname) {
            appname = path.basename(process.cwd());
        }

        answers.appname = appname.replace(/[^\w\s]+?/g, ' ');
        answers.appNameSlug = _s.slugify(answers.appname);

        gulp.src(__dirname + '/templates/**')
            .pipe(template(answers))
            .pipe(gulpif('**/gulpfile.js', replace('@@contents', '<%= contents %>')))
            .pipe(rename(function (file) {
                if (file.basename[0] === '_') {
                    file.basename = '.' + file.basename.slice(1);
                }
            }))
            .pipe(conflict('./'))
            .pipe(gulp.dest('./'))
            .pipe(install())
            .on('finish', function () {
                done();
            });

        process.on('exit', function () {
            var fs = require('fs'),
                wiredep = require('wiredep'),
                skipInstall = process.argv.slice(2).indexOf('--skip-install') >= 0;

            if (!skipInstall) {
                var bowerJson = JSON.parse(fs.readFileSync('./bower.json'));

                // wire Bower packages to .html
                wiredep({
                    bowerJson: bowerJson,
                    directory: 'bower_components',
                    src: 'app/index.html'
                });
            } else {
                gutil.log('After running `npm install & bower install`, inject your front end dependencies into');
                gutil.log('your HTML by running:');
                gutil.log('  gulp wiredep');
            }
        });
    });
});
