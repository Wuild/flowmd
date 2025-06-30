const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = (env, argv) => {
	const isProduction = argv.mode === 'production'
	const isDevelopment = argv.mode === 'development'

	// Base configuration
	const baseConfig = {
		resolve: {
			extensions: ['.ts', '.js', '.svg'],
			alias: {
				'@': path.resolve(__dirname, 'src'),
			},
		},
		module: {
			rules: [
				{
					test: /\.ts$/,
					use: 'ts-loader',
					exclude: /node_modules/,
				},
				{
					test: /\.js$/,
					use: 'babel-loader',
					exclude: /node_modules/,
				},
				{
					test: /\.scss$/,
					use: [
						isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
						'css-loader',
						'postcss-loader',
						{
							loader: 'sass-loader',
							options: {
								api: 'modern', // Use the modern Sass API
								sassOptions: {
									// Modern Sass options
									silenceDeprecations: ['legacy-js-api'],
								},
							},
						},
					],
				},
				{
					test: /\.css$/,
					use: [
						isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
						'css-loader',
						'postcss-loader',
					],
				},
				{
					test: /\.svg$/,
					type: 'asset/source',
				},
			],
		},
		externals: {
			// Don't bundle ProseMirror dependencies in library builds
			'prosemirror-state': 'prosemirror-state',
			'prosemirror-view': 'prosemirror-view',
			'prosemirror-model': 'prosemirror-model',
			'prosemirror-schema-basic': 'prosemirror-schema-basic',
			'prosemirror-schema-list': 'prosemirror-schema-list',
			'prosemirror-keymap': 'prosemirror-keymap',
			'prosemirror-history': 'prosemirror-history',
			'prosemirror-commands': 'prosemirror-commands',
			'prosemirror-dropcursor': 'prosemirror-dropcursor',
			'prosemirror-gapcursor': 'prosemirror-gapcursor',
			'prosemirror-markdown': 'prosemirror-markdown',
			'markdown-it': 'markdown-it',
		},
	}

	// Library builds for production
	if (isProduction && env.library) {
		return [
			// UMD Build
			{
				...baseConfig,
				entry: './src/lib.ts',
				output: {
					path: path.resolve(__dirname, 'dist'),
					filename: 'flowmd.umd.js',
					library: {
						name: 'FlowMD',
						type: 'umd',
						export: 'default',
					},
					globalObject: 'this',
					clean: true,
				},
				plugins: [
					new MiniCssExtractPlugin({
						filename: 'flowmd.css',
					}),
				],
				devtool: 'source-map',
			},
			// ESM Build
			{
				...baseConfig,
				entry: './src/lib.ts',
				experiments: {
					outputModule: true,
				},
				externals: undefined, // Don't use externals for ESM build
				output: {
					path: path.resolve(__dirname, 'dist'),
					filename: 'flowmd.esm.js',
					library: {
						type: 'module',
					},
					clean: false, // Don't clean for second build
				},
				plugins: [
					new MiniCssExtractPlugin({
						filename: 'flowmd.css',
					}),
				],
				devtool: 'source-map',
			},
		]
	}

	// Development build (demo/playground)
	return {
		...baseConfig,
		entry: './src/index.ts',
		output: {
			path: path.resolve(__dirname, 'dist'),
			filename: isProduction ? '[name].[contenthash].js' : '[name].js',
			clean: true,
		},
		externals: undefined, // Include all dependencies in demo build
		plugins: [
			new HtmlWebpackPlugin({
				template: './src/index.html',
				filename: 'index.html',
			}),
			...(isProduction
				? [
						new MiniCssExtractPlugin({
							filename: '[name].[contenthash].css',
						}),
					]
				: []),
		],
		devServer: {
			static: path.join(__dirname, 'dist'),
			compress: true,
			port: 3000,
			hot: true,
			open: true,
		},
		optimization: {
			splitChunks: {
				chunks: 'all',
			},
		},
		devtool: isProduction ? 'source-map' : 'eval-source-map',
	}
}
