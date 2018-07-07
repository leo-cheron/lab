'use strict';

var gulp = require('gulp'),
	gutil = require('gulp-util'),
	config = require('../config'),
	argv = require('yargs').argv,
	webpack = require('webpack');

//-----------------------------------------------------o

var logger = function(err, stats)
{
	if(err) throw new gutil.PluginError('webpack', err);

	if(stats.compilation.errors.length > 0)
	{
		console.log(gutil.colors.red('Webpack errors:'));
		stats.compilation.errors.forEach(function(error)
		{
			if(error.origin)
				gutil.log(gutil.colors.underline.red(error.origin.resource) + ":\n" + gutil.colors.red(error.toString()));
			else
				gutil.log(gutil.colors.red(error.toString()));
		});

		if(!config.isWatching) process.exit(1);
	}
	else
	{
		gutil.log(gutil.colors.green('JS built in ' + (stats.endTime - stats.startTime) + 'ms'));
	}
};

//-----------------------------------------------------o

gulp.task('webpack', ['setModuleSrc'], function(callback)
{
	var built = false;

	var webpackConfig = config.webpack;
	webpackConfig.entry = config.moduleSrc + 'js/Main.js';
	webpackConfig.output = 
	{
		path: config.bin + argv.name +  "/js", 
		filename: "scripts.js"
	};

	webpackConfig.resolve.modules.push(config.src + '_shared/js/', config.moduleSrc + 'js/');

	if(config.env !== 'prod')
	{
		webpackConfig.devtool = 'cheap-module-eval-source-map';
	}
	
	if(config.isWatching)
	{
		webpack(webpackConfig).watch(200, function(err, stats)
		{
			logger(err, stats);
			
			if(config.browserSync)
				config.browserSync.reload();

			// On the initial compile, let gulp know the task is done
			if(!built)
			{
				built = true;
				callback();
			}
		});
	}
	else
	{
		webpack(webpackConfig, function(err, stats)
		{
			logger(err, stats);
			callback();
		});
	}
});
