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

const ESLINT_SETTINGS = {
	"env": {
		"node": true,
		"es6": true
	},
	"rules": {
		"arrow-parens": [2, "as-needed"],
		"no-console": [1],
		"no-constant-condition": [1],
		"no-extra-semi": [1],
		"no-func-assign": [1],
		"no-obj-calls": [2],
		"no-unexpected-multiline" : [2],
		"no-unneeded-ternary": [2],
		"radix": [2],
		"no-with": [2],
		"no-eval": [2],
		"no-unreachable": [1],
		"no-irregular-whitespace": [1],
		"no-new-wrappers": [2],
		"no-new-func": [2],
		"curly" : [2, "multi-line"],
		"no-implied-eval": [2],
		"no-invalid-this": [2],
		"constructor-super": [2],
		"no-dupe-args": [2],
		"no-dupe-keys": [2],
		"no-dupe-class-members": [2],
		"no-this-before-super": [2],
		"prefer-arrow-callback": [1],
		"no-var": [2],
		"valid-jsdoc": [1],
		"strict": [2, "global"],
		"callback-return": [1],
		"object-shorthand": [1, "methods"],
		"prefer-template": [1]
	}
};

const MOCHA_OPTIONS = {
	ui: 'tdd',
	bail: true,
	reporter: 'dot',
	timeout: 10000,
};

gulp.task('lint', () => {
	pipe(gulp.src(SRC_FILES), [
		eslint(ESLINT_SETTINGS),
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
		eslint(ESLINT_SETTINGS),
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
	gulp.src(['lib/**/*.js'])
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
				reporters: ['lcov', 'lcovonly', 'html', 'text']
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