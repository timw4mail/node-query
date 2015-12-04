'use strict';

const documentation = require('gulp-documentation'),
	eslint = require('gulp-eslint'),
	gulp = require('gulp'),
	istanbul = require('gulp-istanbul'),
	mocha = require('gulp-mocha'),
	pipe = require('gulp-pipe'),
	sloc = require('gulp-sloc');

const SRC_FILES = ['lib/**/*.js'];
const TEST_FILES = ['test/**/*_test.js'];

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
		"no-unexpected-multiline" : [2],
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
		"callback-return": [1]
	}
};

gulp.task('lint', () => {
	return pipe(gulp.src(SRC_FILES), [
		eslint(ESLINT_SETTINGS),
		eslint.format(),
		eslint.failAfterError()
	]);
});

gulp.task('lint-tests', ['lint'], () => {
	return pipe(gulp.src(TEST_FILES), [
		eslint(ESLINT_SETTINGS),
		eslint.format(),
		eslint.failAfterError()
	]);
});

gulp.task('sloc', () => gulp.src(SRC_FILES).pipe(sloc()));
gulp.task('test-sloc', () => gulp.src(TEST_FILES).pipe(sloc()));

gulp.task('docs', () => {
	gulp.src('./lib/QueryBuilder.js')
		.pipe(documentation({format: 'html'}))
		.pipe(gulp.dest('docs'));
	/*gulp.src('./lib/QueryBuilder.js')
		.pipe(documentation({format: 'md'}))
		.pipe(gulp.dest('api-docs'));*/
});

gulp.task('mocha', ['lint-tests', 'sloc'], () => {
	return gulp.src(TEST_FILES)
		.pipe(mocha({
			ui: 'tdd',
			bail: true,
			//reporter: 'dot',
			//reporter: 'landing',
		}));
});

gulp.task('test', ['test-sloc', 'lint-tests'], function(cb) {
	return pipe(gulp.src(SRC_FILES), [
		istanbul(),
		istanbul.hookRequire()
	]).on('finish', () => {
		pipe(gulp.src(TEST_FILES), [
			mocha({
				ui: 'tdd',
				bail: true
			}),
			istanbul.writeReports({
				dir: './coverage',
				reporters: ['lcov', 'lcovonly', 'html', 'text']
			})
		]);
	});
});

gulp.task('default', ['lint', 'sloc', 'docs', 'test']);