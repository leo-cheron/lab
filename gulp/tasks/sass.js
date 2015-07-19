var gulp = require('gulp'),
	gutil = require('gulp-util'),
	argv = require('yargs').argv,
	filter = require('gulp-filter'),
	config = require('../config'),

	sass = require('gulp-ruby-sass'),
	sourcemaps = require('gulp-sourcemaps'),
	browserSync = require('browser-sync'),
	reload = browserSync.reload,
	autoprefixer = require('gulp-autoprefixer');

//-----------------------------------------------------o 
// sass

gulp.task('sass', ['setModuleSrc'], function()
{
	return sass(config.moduleSrc + 'sass/style.scss',
		{ 
			style: config.env != "prod" ? "nested" : "compressed",
			sourcemap: config.env != "prod",
			quiet: true,
		})
		.pipe(autoprefixer({
            browsers: config.browsersSupport
        }))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(config.bin + argv.name + '/css'))
		.pipe(filter('**/*.css'))
		.pipe(reload({stream: true}))
		.on('end', function() {gutil.log(gutil.colors.green("Sass compiled"));});
});