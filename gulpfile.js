var src = "./src/",
	bin = "./www/";
	// domain = "lab:8888";

var gulp = require('gulp'),
	gutil = require('gulp-util'),
	argv = require('yargs').argv,
	source = require('vinyl-source-stream'),
	path = require('path'),
	runSequence = require('run-sequence').use(gulp),
	fs = require('fs'),

	sourcemaps = require('gulp-sourcemaps'),
	browserify = require('browserify'),
	babel = require('gulp-babel'),
	babelify = require('babelify'),
	watchify = require('watchify'),

	twig = require('gulp-twig'),

	sass = require('gulp-ruby-sass'),
	autoprefixer = require('gulp-autoprefixer'),

	uglify = require('gulp-uglify'),
	filter = require('gulp-filter'),
	browserSync = require('browser-sync'),
	reload = browserSync.reload,
	svgSprite = require("gulp-svg-sprite"),
	spritesmith = require('gulp.spritesmith');


//-----------------------------------------------------o 
// live reload

gulp.task('browser-sync', function() 
{
	var options = 
	{
		// proxy: domain,
		server: {
            baseDir: "./www/" + argv.name
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

//-----------------------------------------------------o 
// sass

gulp.task('sass', function()
{
	return sass(src + 'sass/modules/' +  argv.name + '/style.scss',
		{ 
			style: argv.env != "prod" ? "nested" : "compressed",
			sourcemap: argv.env != "prod",
			quiet: true,
		})
		.pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(bin + argv.name + '/css'))
		.pipe(filter('**/*.css'))
		.pipe(reload({stream: true}))
		.on('end', function() {gutil.log(gutil.colors.green("Sass compiled"));});
});

//-----------------------------------------------------o 
// sprite

gulp.task('sprite-generate', function()
{
	return gulp.src(src + 'svg/' + argv.name + '/*.svg')
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
		.pipe(gulp.dest(bin + "/" + argv.name + "/svg"));
});

gulp.task('sprite', ["sprite-generate"], function()
{
	fs.rename(bin + 'svg/_sprites.scss', src + 'sass/modules/' + argv.name + '/_sprites.scss');
});

gulp.task('spritesmith', function()
{
	var spriteData = gulp.src(src + 'sprite/bmp/' + argv.name + '/*.png').pipe(spritesmith(
	{
		imgName: 'sprite.png',
		cssName: 'sprite-bmp.sass',
		cssFormat: 'css',
		// imgPath: '../imgs/particles.png'
	}));

	spriteData.img.pipe(gulp.dest(bin + argv.name + '/img/'));
	spriteData.css.pipe(gulp.dest(src + 'sass/modules/' + argv.name));
});

//-----------------------------------------------------o
// twig

gulp.task('twig', function ()
{
	return gulp.src(src + 'twig/modules/' + argv.name + '/index.twig')
		.pipe(twig({
			data: {
				version: '1'
			}
		}))
		.pipe(gulp.dest('./www/' + argv.name))
		.on('end', function() {gutil.log(gutil.colors.green("Twig compiled"));});
});

//-----------------------------------------------------o 
// browserify

gulp.task('browserify', function() 
{
	var b = browserify(path.join(__dirname, src + "js/modules/" + argv.name + "/Main.js"),
	{
		cache: {},
		packageCache: {}, 
		extensions: [".js", ".es6"],
		paths: [src + "js/"],
		debug: argv.env != "prod",
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
			.pipe(gulp.dest(bin + argv.name + "/js"))
			.on('end', function() {gutil.log(gutil.colors.green("JS built in " + (Date.now() - updateStart) + 'ms'));
		});
	};

	if(global.isWatching) bundler.on('update', bundle);

	return bundle();
});

//-----------------------------------------------------o 
// uglify

gulp.task('uglify', ['browserify'], function() 
{
	// main app js file
	gulp.src(bin + argv.name + '/js/*.js')
		.pipe(uglify())
		.pipe(gulp.dest(bin + argv.name + '/js/'))
		.on('end', function() {gutil.log(gutil.colors.cyan("JS uglified"));});
});

//-----------------------------------------------------o 
// watcher

gulp.task('setWatch', function() 
{
	global.isWatching = argv.env != "prod";
});

gulp.task('watch', ['setWatch', 'browserify', 'browser-sync'], function() 
{
	if(argv.env != "prod")
	{
		gulp.watch(src + 'sass/**/*.scss', ['sass']);
		gulp.watch(src + 'twig/**/*.twig', ['twig']);
	}
});

//-----------------------------------------------------o
// tasks

gulp.task('setProd', function()
{
	argv.env = "prod";
});

gulp.task('setMobile', function()
{
	argv.mode = "mobile";
});

gulp.task('dist', function()
{
	runSequence('setProd', 'sprite', 'sass', 'uglify',
				'setMobile', 'sprite', 'sass', 'uglify');
});

gulp.task('default', ['sass', 'twig', 'watch']);
