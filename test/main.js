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
                    '.bowerrc',
                    '.editorconfig',
                    '.gitattributes',
                    '.gitignore',
                    '.jshintrc',
                    'bower.json',
                    'package.json',
                    'gulpfile.js',
                    'README.md',
                    'app/index.html',
                    'app/css/style.css',
                    'app/js/app.js',
                    'tests/runner.css',
                    'tests/runner.js',
                    'tests/tests.js',
                    'tests/vendor/qunit-1.12.0.css',
                    'tests/vendor/qunit-1.12.0.js'
                ]);

                done();
            });
        });
    });
});
