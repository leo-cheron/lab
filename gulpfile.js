var path = require('path'),
	fs = require('fs');

var gulp = require('gulp'),
	gutil = require('gulp-util'),
	runSequence = require('run-sequence').use(gulp),
	argv = require('yargs').argv,
	config = require('./gulp/config');

fs.readdirSync('./gulp/tasks/').forEach(function(task) 
{
	if (path.extname(task) === '.js')
		require('./gulp/tasks/' + task);
});

//-----------------------------------------------------o
// generic tasks

gulp.task('setModuleSrc', function()
{
	if(!argv.name)
		throw Error("parameter --name must be defined");
	else
		config.moduleSrc = config.src + argv.name + "/";
});

gulp.task('setProd', function()
{
	config.env = "prod";
});

gulp.task('dist', function()
{
	runSequence('setModuleSrc', 'setProd', 'sass', 'uglify');
});

gulp.task('default', ['sass', 'twig', 'watch']);