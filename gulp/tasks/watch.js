var gulp = require('gulp'),
	gutil = require('gulp-util'),
	config = require('../config'),
	argv = require('yargs').argv;

//-----------------------------------------------------o 
// watcher

gulp.task('setWatch', ['setModuleSrc'], function() 
{
	config.isWatching = config.env != "prod";
});

gulp.task('watch', ['setWatch', 'webpack', 'browser-sync'], function() 
{
	if(config.env != "prod")
	{
		gulp.watch(config.src + '**/*.scss', ['sass']);
		gulp.watch(config.moduleSrc + 'sass/**/*.scss', ['sass']);
		gulp.watch(config.src + '**/*.twig', ['twig']);
		gulp.watch(config.moduleSrc + 'twig/**/*.twig', ['twig']);
	}
});