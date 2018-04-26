var fs = require 'fs'
var path = require 'path'
var less = require 'less'
var cleanLess = require 'less-plugin-clean-css'
# var plugins = [cleanLess.new({advanced: true})]
var plugins = [cleanLess.new({
	keepBreaks: true,
	advanced: true,
	aggressiveMerging: false
})]

var dir = path.resolve(__dirname,'less')

# if cssCache[path] and !cfg:debug
# 	console.log 'returning cached css'
# 	return res.send(cssCache[path])

fs.readFile(dir + '/index.less') do |err,data|
	less.render(data.toString, paths: [dir], strictMath: 'on', plugins: plugins) do |err,out| # , plugins: [LessPluginAutoPrefix]
		if err
			console.log "error from less",err
		console.log out:css
		console.log out:css:length
		fs.writeFileSync(path.resolve(__dirname,'dist','uxa.css'),out:css)
		fs.writeFileSync('/repos/composeur/dist/uxa.css',out:css)