var gulp = require('gulp'),
	browserSync = require('browser-sync').create(),
	argv = require('yargs').argv,
	config = require('../config');

//-----------------------------------------------------o 
// live reload

gulp.task('browser-sync', function() 
{
	var options = 
	{
		server: {
            baseDir: config.bin + argv.name
        },
		open: true,
		notify: false,
		https: false,
		ui: false,
		ghostMode: false
	};

	browserSync.init(options);

	config.browserSync = browserSync;
});

gulp.task('reload', function() 
{
	browserSync.reload();
});