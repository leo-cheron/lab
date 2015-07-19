var gulp = require('gulp'),
	gutil = require('gulp-util'),
	browserSync = require('browser-sync'),
	reload = browserSync.reload,
	argv = require('yargs').argv,
	source = require('vinyl-source-stream'),
	config = require('../config'),

	sourcemaps = require('gulp-sourcemaps'),
	browserify = require('browserify'),
	babel = require('gulp-babel'),
	babelify = require('babelify'),
	watchify = require('watchify');

//-----------------------------------------------------o 
// browserify

gulp.task('browserify', ['setModuleSrc'], function() 
{
	var b = browserify(config.moduleSrc + "js/Main.js",
	{
		cache: {},
		packageCache: {}, 
		extensions: [".js", ".es6"],
		paths: [config.src + "_shared/js/", config.moduleSrc + "js/"],
		debug: config.env != "prod",
		fullPaths: false
	});

	var bundler = global.isWatching ? watchify(b) : b;
	bundler.transform(babelify.configure(
	{
		loose: "all",
		extensions: [".es6"]
	}));
	bundler.transform('browserify-shader');

	var bundle = function() 
	{
		var updateStart = Date.now();
		return bundler.bundle()
			.on('error', function(e) {gutil.log(gutil.colors.red('Browserify Error ' + e));})
      		.pipe(source("scripts.js"))
			.pipe(gulp.dest(config.bin + argv.name + "/js"))
			.on('end', function() 
			{
				gutil.log(gutil.colors.green("JS built in " + (Date.now() - updateStart) + 'ms'));
			});
	};

	if(global.isWatching) bundler.on('update', bundle);

	return bundle();
});