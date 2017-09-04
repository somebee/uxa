var marked = require 'marked'
var tints = ['primary','info','success','warning','danger','dark']

var samples =
	paragraph: "This is a paragraph with a [link](http://test.no) and some more text!"
	
var mdart = require '!raw-loader!./md/article.md'
var mdlists = require '!raw-loader!./md/lists.md'
	
import Button from '../src/Button'
import TextField from '../src/TextField'
import Stack from '../src/Stack'

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
			<.bar>
				<Button.muted label="Cancel">
				<Button.danger label="Uninstall">
				<Button.primary label="Finish">
			<.fields>
				<TextField label='First name'>
				<TextField label='Last name'>
				<TextField label='Title'>
				<TextField label='Interests' desc="Something about this">
				<TextField label='Title' disabled=yes>

tag Buttons
	def render
		<self>
			<Button.muted label="Cancel">
			<Button.danger label="Uninstall">
			<Button.primary label="Finish">

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
	
	def showDialog
		Stack.show <div.dialog>
			
			<section>
				<h2> "Create new screencast"
				<hr>
				<TextField label='Title'>
				<TextField label='Last name'>

			<footer.flat>
				<Button.muted label="dismiss">
				<Button.primary label="archive">
	
	def showConfirm
		Stack.show <div.menu>
			<section>
				<h2> "Use Google's location service?"
				<p.muted> "When opening an dialog it’s important that the page behind is slightly darkened. This does two jobs. Firstly it draws attention to the overlay and secondly it lets the user know that the page isn’t currently active."
			<footer.flat>
				<Button.muted label="disagree">
				<Button label="agree">
				
	def showMenu
		Stack.show <div.dialog.dark>
			<section.sm>
				<h2> "Record"
				<p.muted> "When in editing mode, all changes will be saved instantly. If this cast is public, all changes will be broadcasted live to your audience."
				<p> "Any edits you make will not be published as part of the Scrimba until you explicitly choose to publish."
				<TextField label='Title'>
				# <TextField label='Last name'>
			<footer.flat>
				<Button.muted label="dismiss">
				<Button.primary label="start">
	
	def render
		<self>
			<#nav>
				<a href="#forms"> 'forms'
				<a href="#articles"> 'articles'
				<a href="#panels"> 'panels'
				<a href="#alerts"> 'alerts'
				<a href="#buttons"> 'buttons'
			
			<#forms.page>
				<Button label="confirm" :tap='showConfirm'>
				<Button label="dialog" :tap='showDialog'>
				<Button label="menu" :tap='showMenu'>
				<Fields.raised>
				<hr>
				<h4> "Small"
				<Fields.raised.sm>
				<hr>
				<h4> "Extra small"
				<Fields.raised.xs>
				
				<.panel.dark>
					<Fields.raised>
				
			<#articles.page>
				<div markdown=mdart>
				<div markdown=mdlists>
				
			<#alerts.page>
				<Alerts>
				
			<#buttons.page>
				<.panel>
					<Button.muted label="Cancel">
					<Button.danger label="Uninstall">
					<Button.primary label="Finish">
				<.panel.sm>
					<Button.muted label="Cancel">
					<Button.danger label="Uninstall">
					<Button.primary label="Finish">

Imba.mount <Example>