module.exports = function(grunt) {
	'use strict';

	var exec = require('child_process').exec;

	// Project configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jsdoc: {
			dist: {
				src: ['lib/**/*.js', 'README.md'],
				options: {
					destination: 'docs'
				}
			}
		},
		nodeunit: {
			all: ['tests/**/*_test.js']
		}
	});

	grunt.loadNpmTasks('grunt-jsdoc');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');


	grunt.registerTask('default', ['nodeunit','jsdoc']);
	grunt.registerTask('tests', 'nodeunit');
};