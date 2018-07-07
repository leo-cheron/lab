const argv = require('yargs').argv;

const src = process.cwd() + "/src/";
const bin = process.cwd() + "/www/";
const root = process.cwd() + "../";

module.exports = {

	src: src,
	bin: bin,

	env: argv.production ? 'prod' : 'dev',

	browsersSupport: ['last 2 versions', '> 5%'],

	webpack: {
		mode: argv.production ? 'production' : 'development',
		module: {
			rules: [{
				test: /\.(js)$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						cacheDirectory: true, 
						presets: [require.resolve('babel-preset-es2015')]
					}
				}
			}, {
				test: /\.(glsl|frag|vert)$/, 
				exclude: /node_modules/,
				loader: 'webpack-glsl-loader'
			}],
			noParse: [
				/lib\/three\/three/,
				/lib\/zepto/
			]
		},
		resolve: {
			unsafeCache: true,
			modules: [
				root + 'node_modules/'
			],
			extensions: ['.js'],
			alias: {
				Emitter: process.cwd() + "/node_modules/component-emitter/index.js",
			}
		},
		plugins: [],
		watchOptions: {
			aggregateTimeout: 300,
			ignored: /node_modules/,
		}
	}
};