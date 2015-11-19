module.exports = function(grunt) {
	'use strict';

	// Project configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		/*jsdoc: {
			dist: {
				src: ['lib/*.js', 'README.md'],
				options: {
					template: 'node_modules/grunt-jsdoc/node_modules/ink-docstrap/template',
					configure: 'node_modules/grunt-jsdoc/node_modules/ink-docstrap/template/jsdoc.conf.json',
					destination: 'docs'
				}
			}
		},*/
		nodeunit: {
			all: ['tests/**/*_test.js'],
			options: {
				reporter: 'verbose'
			}
		}
	});

	//grunt.loadNpmTasks('grunt-jsdoc');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');


	//grunt.registerTask('default', ['nodeunit','jsdoc']);
	grunt.registerTask('default', 'nodeunit');
	grunt.registerTask('tests', 'nodeunit');
	//grunt.registerTask('docs', 'jsdoc');
};