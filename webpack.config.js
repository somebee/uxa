var webpack = require('webpack');
var LessPluginAutoPrefix = require('less-plugin-autoprefix');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var LessPluginCleanCSS = require('less-plugin-clean-css');
var cleanCSSPlugin = new LessPluginCleanCSS({advanced: true});

var lessLoader = {
	loader: 'less-loader',
	options: {
		strictMath: true,
		plugins: [
			new LessPluginAutoPrefix({ browsers: ["last 2 versions"] }),
			new LessPluginCleanCSS({advanced: true})
		]
	}
};

module.exports = [{
	entry: "./src/index.imba",
	output:  {filename: './uxa.js'}
}];