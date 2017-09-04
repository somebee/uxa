import '../src/index'

var socket = WebSocket.new('ws://localhost:3002/socket')

var marked = require 'marked'

extend tag element
	prop markdown watch: yes
	
	def markdownDidSet text
		dom:innerHTML = marked(text)
		

import Head from './views/head'
import Nav from './views/nav'
import Home from './views/home'

socket:onmessage = do |e|
	console.log 'got message!!!',e
	#uxa-css.href = "style.css?{Math.random}"
	

tag App
	
	def render
		<self>
			<Head#head.dark>
			<Nav#nav.panel.drawer>
			<#main>
				<Home>

Imba.mount(<App>)