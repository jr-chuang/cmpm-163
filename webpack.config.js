const webpack = require('webpack');

module.exports = {
	entry: [
    'core-js/fn/promise',
    'core-js/fn/object/assign',
    './src/index.js'
  ],
  devtool: 'eval',
	output: {
    path: __dirname + '/dist',
		filename: 'app.js',
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				loader: 'babel-loader'
			}
		]
	},
	devServer: {
		contentBase: './dist/',
		hot: false,
		progress: true
	},
	plugins: [
    new webpack.NamedModulesPlugin(),
		new webpack.HotModuleReplacementPlugin(),
    new webpack.ProvidePlugin({
      THREE: 'three'
    })
	]
};
