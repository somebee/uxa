var path = require("path");

module.exports = {
	entry: "./index.imba",
	output: {
		path: path.resolve(__dirname),
		filename: './index.js',
		publicPath: "/assets/"
	}
};
