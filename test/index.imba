import '../src/index'
import Router from 'imba-router'

var socket = WebSocket.new('ws://localhost:3002/socket')

var marked = require 'marked'

extend tag element
	prop markdown watch: yes
	
	def markdownDidSet text
		dom:innerHTML = marked(text)
		

import Head from './views/head'
import Nav from './views/nav'
import Home from './views/home'
import Note from './views/note'

socket:onmessage = do |e|
	console.log 'got message!!!',e
	#uxa-css.href = "style.css?{Math.random}"
	

tag App
	
	def render
		<self>
			<#head.masthead.lg.bar.base-bg.flat.dark>
				<.brand> "UXA"
				<.flexer>
				<a.tab route-to="/"> 'Home'
				<a.tab route-to="/components"> 'Components'
				<a.tab route-to="/elements"> 'Elements'
				<a.tab route-to="/form"> 'Form'
				<a.tab route-to="/note"> 'Note'
			
			<Home route='/'>
			<Note route='/note'>
			# <#main>
			# 	<Home>

Imba.mount(<App router=Router.new(mode: 'hash')>)