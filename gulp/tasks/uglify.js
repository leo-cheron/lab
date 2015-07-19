var gulp = require('gulp'),
	gutil = require('gulp-util'),
	argv = require('yargs').argv,
	config = require('../config'),

	uglify = require('gulp-uglify');

//-----------------------------------------------------o 
// uglify

gulp.task('uglify', ['browserify'], function() 
{
	// main app js file
	gulp.src(config.bin + argv.name + '/js/*.js')
		.pipe(uglify())
		.pipe(gulp.dest(config.bin + argv.name + '/js/'))
		.on('end', function() {gutil.log(gutil.colors.cyan("JS uglified"));});
});