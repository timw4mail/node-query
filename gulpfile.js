'use strict';

const documentation = require('gulp-documentation'),
	eslint = require('gulp-eslint'),
	gulp = require('gulp'),
	istanbul = require('gulp-istanbul'),
	jscs = require('gulp-jscs'),
	mocha = require('gulp-mocha'),
	pipe = require('gulp-pipe'),
	sloc = require('gulp-sloc');

const SRC_FILES = ['lib/**/*.js'];
const TEST_FILES = [
	'test/*_test.js',
	'test/adapters/*_test.js'
];

const MOCHA_OPTIONS = {
	ui: 'tdd',
	bail: true,
	reporter: 'dot',
	timeout: 10000,
};

gulp.task('lint', () => {
	pipe(gulp.src(SRC_FILES), [
		eslint(),
		eslint.format(),
		eslint.failAfterError()
	]);
	pipe(gulp.src(SRC_FILES), [
		jscs(),
		jscs.reporter()
	]);
});

gulp.task('lint-tests', ['lint'], () => {
	pipe(gulp.src(['test/**/*.js']), [
		eslint(),
		eslint.format(),
		eslint.failAfterError()
	]);
	pipe(gulp.src(['test/**/*.js']), [
		jscs(),
		jscs.reporter()
	]);
});

gulp.task('sloc', () => gulp.src(SRC_FILES).pipe(sloc()));
gulp.task('test-sloc', () => gulp.src(TEST_FILES).pipe(sloc()));

gulp.task('docs', () => {
	gulp.src(['lib/*.js'])
		.pipe(documentation({format: 'html'}))
		.pipe(gulp.dest('docs'));
	gulp.src(['lib/*.js'])
		.pipe(documentation({format: 'md'}))
		.pipe(gulp.dest('.'));
});

gulp.task('mocha', ['lint-tests', 'sloc'], () => {
	return gulp.src(TEST_FILES)
		.pipe(mocha(MOCHA_OPTIONS))
		.once('error', () => {
            process.exit(1);
        })
		.once('end', () => {
            process.exit();
        });
});

gulp.task('test', ['test-sloc', 'lint-tests'], function(cb) {
	return pipe(gulp.src(SRC_FILES), [
		istanbul(),
		istanbul.hookRequire()
	]).on('finish', () => {
		pipe(gulp.src(TEST_FILES), [
			mocha(MOCHA_OPTIONS),
			istanbul.writeReports({
				dir: './coverage',
				reporters: ['clover', 'lcov', 'lcovonly', 'html', 'text']
			})
				.once('error', () => {
		            process.exit(1);
		        })
				.once('end', () => {
		            process.exit();
		        })
		]);
	});
});

gulp.task('default', ['lint', 'sloc', 'docs', 'test']);