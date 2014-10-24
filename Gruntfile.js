module.exports = function(grunt) {
	'use strict';

	var tests = 'tests/**/*_test.js';
	var src = 'lib/**/*.js';
	var reportDir = 'coverage';

	// Project configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: [ 'build' ],
		jsdoc: {
			dist: {
				src: ['lib/*.js', 'README.md'],
				options: {
					template: 'node_modules/grunt-jsdoc/node_modules/ink-docstrap/template',
					configure: 'node_modules/grunt-jsdoc/node_modules/ink-docstrap/template/jsdoc.conf.json',
					destination: 'docs'
				}
			}
		},
		nodeunit: {
			all: [tests],
			options: {
				reporter: 'verbose'
			}
		},
		watch: {
			files: [src, tests],
			tasks: 'default'
		},
		instrument: {
			files: src,
			options: {
				lazy: true,
				basePath : 'build/instrument/'
			}
		},
		storeCoverage : {
			options : {
				dir: reportDir
			}
		},
		makeReport: {
			src: 'build/reports/**/*.json',
			options: {
				type: ['lcov', 'html'],
				dir: reportDir,
				print: 'detail'
			}
		}
	});

	grunt.loadNpmTasks('grunt-jsdoc');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');
	grunt.loadNpmTasks('grunt-istanbul');


	grunt.registerTask('default', ['nodeunit','jsdoc']);
	grunt.registerTask('tests', 'nodeunit');
	grunt.registerTask('docs', 'jsdoc');
	grunt.registerTask('cover', ['clean', 'instrument', 'tests', 'storeCoverage', 'makeReport']);
};