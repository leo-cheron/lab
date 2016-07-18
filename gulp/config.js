module.exports = {

	src: process.cwd() + "/src/",
	bin: process.cwd() + "/www/",

	device: null,

	browsersSupport: ['last 2 versions', '> 5%'],

	webpack: {
		cache: true,
		devtool: 'cheap-module-eval-source-map',
		module: {
			loaders: [
				{ test: /\.es6$/, exclude: /node_modules/, loader: 'babel-loader', query: { presets: [require.resolve('babel-preset-es2015-loose')] }},
				{ test: /\.glsl$/, exclude: /node_modules/, loader: 'webpack-glsl'}
			],
			noParse: [
				// /lib\/three\/three/,
				// /lib\/tweenLite/,
				/lib\/zepto/,
			]
		},
		resolve: {
			root: undefined, // to be specified with the use of moduleSrc task
			extensions: ['', '.js', '.es6'],
			alias:
			{
				Emitter: process.cwd() + "/node_modules/component-emitter/index.js",
			}
		},
		plugins: []
	}
	
};