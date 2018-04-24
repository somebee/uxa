var http = require 'http'
var path = require 'path'
var fs = require 'fs'
var express = require 'express'
var less = require 'less'
var watch = require 'node-watch'
var cleanLess = require 'less-plugin-clean-css'

import {App} from './app'
import {Router} from 'imba-router'

# var lpap = require('less-plugin-autoprefix')
# LessPluginAutoPrefix = lpap.new(browsers: ['> 0.5%', 'IE 9'])
# var less = global:less = require 'less'
# 
var app = express()


# autocompile css
app.get '/:name.css' do |req, res|
	var src = path.resolve("{__dirname}/{req:params:name}.less")
	var dirs = [src.replace(/\/([^\/]+)$/,'')]
	var plugins = [cleanLess.new({advanced: true})]
	var plugins = [cleanLess.new({})]
	console.log 'requesting css in',dirs
	res.type('css')
	# if cssCache[path] and !cfg:debug
	# 	console.log 'returning cached css'
	# 	return res.send(cssCache[path])

	let fileManagers = less:environment && less:environment:fileManagers || []
	for m in fileManagers
		m:contents = {}

	fs.readFile(src) do |err,data|
		unless data
			return res.send ""

		if req:params[1] == 'less'
			return res.send data.toString

		less.render(data.toString, useFileCache: false, env: "development", paths: dirs, strictMath: 'on', plugins: plugins) do |err,out| # , plugins: [LessPluginAutoPrefix]
			if err
				console.log "error from less",err
				return res.send ""

			res.send out:css

app.use('/static', express.static(path.resolve("{__dirname}")))

app.get(/.*/) do |req,res|
	var path = req:path
	var router = Router.new(url: path)
	var node = <html router=router>
		<head>
			<link rel="stylesheet" href="https://i.icomoon.io/public/305431ae11/scrimba/style.css">
			<link rel="stylesheet" type="text/css" href="style.css" id="uxa-css">
		<body>
			<App>
			<script src='static/index.js'>
	
	node.router.onReady do 
		console.log "onready",path
		res.send node.toString
		
app.get '/' do |req,res|
	res.sendFile("{__dirname}/index.html")
	

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

let port = process:env.PORT or 8003
server.listen(port) do |err,res|
	console.log "server connected at :{port}"
	self

