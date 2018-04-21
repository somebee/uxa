import '../src/index'
import Router from 'imba-router'
import App from './app'

var socket = WebSocket.new('ws://localhost:3002/socket')

import Code from '../src/Code'

import highlight from './highlighter/index'
Code:highlight = highlight


socket:onmessage = do |e|
	console.log 'got message!!!',e
	#uxa-css.href = "style.css?{Math.random}"

var app = <App router=Router.new>

app.router.onReady do
	document:body:innerHTML = ''
	Imba.mount(app)