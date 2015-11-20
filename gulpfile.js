var gulp = require('gulp'),
	documentation = require('gulp-documentation'),
	nodeunit_runner = require('gulp-nodeunit-runner'),
	istanbul = require('gulp-istanbul');

gulp.task('default', ['docs', 'test']);

gulp.task('docs', function() {
	gulp.src('./lib/node-query.js')
		.pipe(documentation({format: 'html'}))
		.pipe(gulp.dest('docs'));
	gulp.src('./lib/node-query.js')
		.pipe(documentation({format: 'md'}))
		.pipe(gulp.dest('api-docs'));
});

gulp.task('pre-test', function() {
	return gulp.src(['lib/**/*.js'])
		.pipe(istanbul())
		.pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], function() {
	return gulp.src(['tests/**/*_test.js'])
		.pipe(nodeunit_runner())
		.pipe(istanbul.writeReports({
			dir: './coverage',
			reporters: ['lcov', 'lcovonly', 'html', 'text']
		}));
});