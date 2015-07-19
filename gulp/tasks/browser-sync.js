var gulp = require('gulp'),
	gutil = require('gulp-util'),
	browserSync = require('browser-sync'),
	argv = require('yargs').argv,
	config = require('../config');

//-----------------------------------------------------o 
// live reload

gulp.task('browser-sync', function() 
{
	var options = 
	{
		// proxy: domain,
		server: {
            baseDir: config.bin + argv.name
        },
		open: true,
		notify: false,
		https: false,
		ui: false,
		ghostMode: false
	};

	browserSync(options);
});

gulp.task('reload', function() 
{
    browserSync.reload();
});