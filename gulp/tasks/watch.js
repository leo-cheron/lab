var gulp = require('gulp'),
	gutil = require('gulp-util'),
	config = require('../config'),
	argv = require('yargs').argv;

//-----------------------------------------------------o 
// watcher

gulp.task('setWatch', ['setModuleSrc'], function() 
{
	global.isWatching = argv.env != "prod";
});

gulp.task('watch', ['setWatch', 'browserify', 'browser-sync'], function() 
{
	if(argv.env != "prod")
	{
		gulp.watch(config.src + 'sass/**/*.scss', ['sass']);
		gulp.watch(config.src + 'twig/**/*.twig', ['twig']);
	}
});