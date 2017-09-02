var webpack = require('webpack');
var LessPluginAutoPrefix = require('less-plugin-autoprefix');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var lessLoader = {
	loader: 'less-loader',
	options: {
		strictMath: true,
		plugins: [
			new LessPluginAutoPrefix({ browsers: ["last 3 versions"] })
		]
	}
};

module.exports = [{
	entry: "./src/index.imba",
	output:  {filename: './uxa.js'}
},{
	entry: "./less/index.less",
	module: {
		rules: [{
				test: /\.less/,
				use: ExtractTextPlugin.extract({
					fallback: "style-loader",
					use: ["css-loader", lessLoader]
				})
			}
		]
	}
	output:  {filename: './uxa.css'}
}];