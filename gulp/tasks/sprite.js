var gulp = require('gulp'),
	gutil = require('gulp-util'),
	argv = require('yargs').argv,
	fs = require('fs'),
	config = require('../config'),

	svgSprite = require("gulp-svg-sprite"),
	spritesmith = require('gulp.spritesmith');

//-----------------------------------------------------o 
// sprite

gulp.task('sprite-generate', function()
{
	return gulp.src(config.src + 'svg/' + argv.name + '/*.svg')
		.pipe(svgSprite({
			// log: 'verbose',
			shape: {
				spacing: {
					padding: 2
				}
			},
			mode: {
				css: {
					dest: "./",
					dimensions: true,
					bust: false,
					prefix: ".icon--",
					common: "icon",
					render: {
						scss: {
							dest: '_sprites.scss'
						},
					},
					sprite: "../svg/sprite.svg",
				},
				symbol: false
			}
		}))
		.pipe(gulp.dest(config.bin + "/" + argv.name + "/svg"));
});

gulp.task('sprite', ["sprite-generate"], function()
{
	fs.rename(config.bin + 'svg/_sprites.scss', config.src + 'sass/modules/' + argv.name + '/_sprites.scss');
});

gulp.task('spritesmith', function()
{
	var spriteData = gulp.src(config.src + 'sprite/bmp/' + argv.name + '/*.png').pipe(spritesmith(
	{
		imgName: 'sprite.png',
		cssName: 'sprite-bmp.sass',
		cssFormat: 'css',
		// imgPath: '../imgs/particles.png'
	}));

	spriteData.img.pipe(gulp.dest(config.bin + argv.name + '/img/'));
	spriteData.css.pipe(gulp.dest(config.moduleSrc + 'sass/'));
});