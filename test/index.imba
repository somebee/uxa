var socket = WebSocket.new('ws://localhost:3002/socket')

socket:onmessage = do |e|
	console.log 'got message!!!',e
	#uxa-css.href = "uxa.css?{Math.random}"
	
var marked = require 'marked'
var tints = ['primary','info','success','warning','danger']

var samples =
	paragraph: "This is a paragraph with a [link](http://test.no) and some more text!"
	
var ARTICLE = """
# Basics

This one of the main differentiators of Imba. The language has native support for tags. Tags are in fact native DOM elements, with a very lightweight wrapper that provides additional functionality and extensibility.

## Defining

Tags are basically a separate Class hierarchy with syntactic sugar for instantiating nodes. All html elements are predefined, but you can also extend these tags, or inherit from them with your own tags. The syntax for creating new tags is very similar to our class syntax.

## Cascading inheritance

Custom tags still use native supported node types in the DOM tree. Our `<sketchpad>` will render as a `<canvas class='_sketchpad'>` in the DOM, while
`<task>` will render as `<li class='_entry _task'>`. This means that css/styling can also be inherited, and we can use query selectors to select all entries (including inherited tags project and task).

---

Imba is a new programming language for the web that compiles
to performant JavaScript. It is heavily inspired by ruby and python, but developed explicitly for web programming (both server and client). It has language level 
support for defining, extending, subclassing, instantiating 
and rendering dom nodes. For a semi-complex application like 
[TodoMVC](http://todomvc.com), it is more than [10 times faster than React](http://somebee.github.io/todomvc-render-benchmark/index.html)
with less code, and a much smaller library.

> Tip! When compiling files and folders without specifying an output location Imba will follow a specific convention. If the path includes a src/ directory, and there is a sibling lib/ directory, Imba will automatically choose this path. If you have the directories `/myapp/src` and `/myapp/lib`, running `> imba compile /myapp/src/app.imba` will by default write the compiled code to `/myapp/lib/app.js`.

"""

import Button from '../src/Button'

extend tag element
	prop markdown watch: yes
	
	def markdownDidSet text
		console.log "markdown!!!",text
		dom:innerHTML = marked(text)

tag Article
	
	def render
		<self>

tag Fields
	def render
		<self>
			<input type='text'>
			<button type='button'> "Hello"
			<Button label="Submit">
			<Button.muted label="Cancel">

tag Component
	prop tint default: 'primary'
	
	def ontap
		tint = tints[tints.indexOf(tint) + 1] or tints[0]
		render

tag Alert < Component
	def render
		<self.alert .{tint}>
			<h3> "This is an alert"
			<div markdown=samples:paragraph>
			<hr>
			<p> "Some more info about the alert here"
		
tag Panel < Component
	def render
		<self.panel .{tint}>
			<header> "My header"
			<article> "My article"
			<footer> "My footer"

tag Texts
	
	def render
		<self>
			<h1>
				"Heading 1"
				<span.muted> "Context of heading"
			
			<h2> "Heading 2"
			<h3> "Heading 3"
			<hr>
			<h4> "Heading 4"
			<h5> "Heading 5"
			<h6> "Heading 6"
			<p> "Paragraph"
			<dl>
				<dt> "Description list"
				<dd> "A description list is perfect for defining terms."
				<dt> "Eusmod"
				<dd> "Vestibulum id ligula porta felis euismod semper eget lacinia odio sem."
			<.highlight>
				<h2> "Heading 2"
				<p.muted> "A description list is perfect for defining terms."

tag Alerts
	
	def render
		<self>
			<.alert.primary> "This is a primary alert—check it out!"
			<.alert.success> "This is a success alert—check it out!"
			<.alert.danger> "This is a danger alert—check it out!"
			<.alert.warning> "This is a warning alert—check it out!"
			<Alert>

tag Example
	
	def render
		<self>
			<article.panel>
				<Texts>
				<Fields>
				<Alerts>
				<.alert markdown=ARTICLE>
			<.panel.dark>
				<Texts>
				<Fields>
				<Alerts>
			<Panel>


Imba.mount <Example>
