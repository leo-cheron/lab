var gulp = require('gulp'),
	gutil = require('gulp-util'),
	argv = require('yargs').argv,
	fs = require('fs'),
	config = require('../config'),

	twig = require('gulp-twig');

//-----------------------------------------------------o
// twig

gulp.task('twig', ['setModuleSrc'], function()
{
	return gulp.src(config.moduleSrc + 'twig/index.twig')
		.pipe(twig({
			data: {
				version: '1'
			}
		}))
		.pipe(gulp.dest(config.bin + argv.name))
		.on('end', function() {gutil.log(gutil.colors.green("Twig compiled"));});
});