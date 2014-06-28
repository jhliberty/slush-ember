/* jshint node:true */
/* global require, it, before, beforeEach, describe */

'use strict';
var should = require('should'),
    inquirer = require('inquirer'),
    gulp = require('gulp'),
    mockGulpDest = require('mock-gulp-dest')(gulp);

require('../slushfile');

/**
 * Mock inquirer prompt
 */

function mockPrompt(answers) {
    inquirer.prompt = function (prompts, done) {

        [].concat(prompts).forEach(function (prompt) {
            if (!(prompt.name in answers)) {
                answers[prompt.name] = prompt.default;
            }
        });

        done(answers);
    };
}

describe('slush-ember', function() {
    before(function () {
        process.chdir(__dirname);
    });

    describe('default generator', function () {
        beforeEach(function () {
            mockPrompt({
                moveon: true
            });
        });

        it('should put all project files in current working directory', function (done) {
            gulp.start('default').once('stop', function () {
                mockGulpDest.cwd().should.equal(__dirname);
                mockGulpDest.basePath().should.equal(__dirname);
                done();
            });
        });

        it('should create expected files', function (done) {
            gulp.start('default').once('stop', function () {
                mockGulpDest.assertDestContains([
                    '.editorconfig',
                    '.gitattributes',
                    '.gitignore',
                    '.jshintrc',
                    'package.json',
                    'gulpfile.js',
                    'app/README.md',
                    'app/index.html',
                    'app/css/normalize.css',
                    'app/css/style.css',
                    'app/js/app.js',
                    'app/js/libs/ember-1.5.1.js',
                    'app/js/libs/handlebars-1.1.2.js',
                    'app/js/libs/jquery-1.10.2.js',
                    'app/tests/runner.css',
                    'app/tests/runner.js',
                    'app/tests/tests.js',
                    'app/tests/vendor/qunit-1.12.0.css',
                    'app/tests/vendor/qunit-1.12.0.js'
                ]);

                done();
            });
        });
    });
});
