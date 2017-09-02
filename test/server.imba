var http = require 'http'
var path = require 'path'
var fs = require 'fs'
var express = require 'express'
var less = require 'less'
var watch = require 'node-watch'

# var lpap = require('less-plugin-autoprefix')
# LessPluginAutoPrefix = lpap.new(browsers: ['> 0.5%', 'IE 9'])
# var less = global:less = require 'less'
# 
var app = express()


# autocompile css
app.get '/uxa.css' do |req, res|
	var src = path.resolve("{__dirname}/../less/index.less")
	var dirs = [src.replace(/\/([^\/]+)$/,'')]
	console.log 'requesting css in',dirs
	res.type('css')

	# if cssCache[path] and !cfg:debug
	# 	console.log 'returning cached css'
	# 	return res.send(cssCache[path])

	fs.readFile(src) do |err,data|
		unless data
			return res.send ""

		if req:params[1] == 'less'
			return res.send data.toString

		less.render(data.toString, paths: dirs) do |err,out| # , plugins: [LessPluginAutoPrefix]
			if err
				console.log "error from less",err
				return res.send ""

			res.send out:css


app.get '/' do |req,res|
	res.sendFile("{__dirname}/index.html")
	
app.use('/static', express.static(path.resolve("{__dirname}")))
	
var server = http.createServer
server.on('request', app)


var WebSocketServer = require('ws').Server
var wss = WebSocketServer.new(
	server: server,
	perMessageDeflate: no,
	path:  "/socket"
)

var connections = Set.new

wss.on('connection') do |ws|
	console.log 'connection'
	connections.add(ws)

	# handling binary data
	ws.on('message') do |message|
		self

	ws.on('error') do |err|
		console.log "error from socket",err

	ws.on('close') do
		console.log "close socket",ws:id,ws:uid,ws:ip
		connections.delete(ws)
		self
		
watch(path.resolve(__dirname + '/../less'), { recursive: true }) do |evt,name|
	console.log('%s changed.', name)
	connections.forEach do |conn|
		conn.send("!!")

server.listen(process:env.PORT) do |err,res|
	console.log "server connected here?!"
	self

