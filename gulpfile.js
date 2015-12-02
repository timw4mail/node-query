var babel = require('gulp-babel'),
	concat = require('gulp-concat'),
	documentation = require('gulp-documentation'),
	eslint = require('gulp-eslint'),
	gulp = require('gulp'),
	istanbul = require('gulp-babel-istanbul'),
	nodeunit_runner = require('gulp-nodeunit-runner'),
	sloc = require('gulp-sloc'),
	sourcemaps = require('gulp-sourcemaps');

gulp.task('transpile', function() {
	return gulp.src('src/**/*.js')
		.pipe(sourcemaps.init())
		.pipe(babel({
			presets: ['es2015'],
			plugins: ['transform-es2015-modules-commonjs']
		}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('lib'));
});

gulp.task('lint', function() {
	return gulp.src('src/**/*.js')
		.pipe(eslint({
			"env": {
				"node": true,
				"es6": true
			},
			"ecmaFeatures": {
				"arrowFunctions": true,
				"blockBindings": true,
				"classes": true,
				"defaultParams": true,
				"destructuring": true,
				"forOf": true,
				"modules": true
			},
			"rules": {
				"radix": [2],
				"no-with": [2],
				"no-eval": [2],
				"no-unreachable": [2],
				"no-irregular-whitespace": [1],
				"no-new-wrappers": [2],
				"curly" : [2, "multi-line"],
				"no-implied-eval": [2],
				"no-invalid-this": [2],
				"constructor-super": [2],
				"no-dupe-class-members": [2],
				"no-this-before-super": [2],
				"prefer-arrow-callback": [1],
				"no-var": [1],
				"valid-jsdoc": [1]
			}
		}))
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task('lint-tests', ['lint'], function() {
	return gulp.src('tests/**/*.js')
		.pipe(eslint({
			"env": {
				"node": true
			},
			"rules": {
				"radix": [2],
				"no-with": [2],
				"no-eval": [2],
				"no-unreachable": [1],
				"no-irregular-whitespace": [1],
				"curly" : [2, "multi-line"],
				"no-implied-eval": [2],
				"no-invalid-this": [2],
				"no-dupe-class-members": [2],
				"block-scoped-var": [2]
			}
		}))
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task('sloc', ['transpile'], function() {
	gulp.src(['src/**/*.js'])
		.pipe(sloc());
	gulp.src(['lib/**/*.js'])
		.pipe(sloc());
})

gulp.task('docs', ['transpile'], function() {
	gulp.src('./src/QueryBuilder.js')
		.pipe(documentation({format: 'html'}))
		.pipe(gulp.dest('docs'));
	/*gulp.src('./lib/QueryBuilder.js')
		.pipe(documentation({format: 'md'}))
		.pipe(gulp.dest('api-docs'));*/
});

gulp.task('nodeunit', ['transpile', 'lint-tests'], function() {
	return gulp.src(['tests/**/*_test.js'])
		.pipe(nodeunit_runner());
});

gulp.task('fast-test', ['transpile', 'lint-tests'], function() {
	return gulp.src(['tests/**/*_test.js'])
		.pipe(nodeunit_runner());
});

gulp.task('test', ['transpile', 'lint-tests'], function(cb) {
	return gulp.src(['lib/**/*.js'])
		.pipe(istanbul())
		.pipe(istanbul.hookRequire())
		.on('finish', function () {
			gulp.src(['tests/**/*_test.js'])
				.pipe(nodeunit_runner())
				.pipe(istanbul.writeReports({
					dir: './coverage',
					reporters: ['lcov', 'lcovonly', 'html', 'text']
				}));
		});
});

gulp.task('default', ['lint', 'sloc', 'docs', 'test']);