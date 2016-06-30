module.exports = function (grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		browserify: {
			watch: {
				files: [{
					src: 'src/*.js',
					dest: 'dist/app.js',
				}],
				options: {
					watch: true,
					keepAlive: true
				}
			}
		}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-browserify');

	// Default task(s).
	grunt.registerTask('default', ['browserify']);

};