var mdart = require '!raw-loader!../md/article.md'

import Button,TextField,Dialog from 'uxa'

var short = """

# Main heading

This is a short paragraph with a [link](#link) and some text.

"""

tag DialogExample < Button		
	def ontap
		if @template
			uxa.open template()
			
tag ColorSample
	prop bg
	prop weight
	prop color
	prop label

	def setup
		css(background: "var(--{bg})", color: "var(--{color})")
		
	def render
		<self> <span> label
		
tag ColorScale
	prop tint
	def render
		<self> for item,i in [0,50,100,200,300,400,500,600,700,800,900,'A100','A200','A400','A700']
			<ColorSample weight=item bg="uxa-{tint}-{item}" color="uxa-{tint}-{i > 5 ? 0 : 900}" label="{tint}{item}">
		
tag Palette
	prop tint
	
	def render
		<self.paper .{tint}>
			<h2> "{tint} panel"
			<section>
				<h3> "Raised buttons"
				<DialogExample.raised label='Dismiss' ->
					<Dialog.modal> <span> "Hello there - this is something"
				
				<DialogExample.raised.secondary label='Secondary' ->
					<Dialog.modal submitLabel='Absolutely'>
						<span> "Hello there"
						
				<DialogExample.raised.primary label='Primary' ->
					<Dialog.modal submitLabel='Absolutely'>
						<div uxa:md="# Hello\nThis is a longer dialog explaining something right here?">
			
			<section.flat>
				<h3> "Flat buttons"
				<Button.muted label="Dismiss">
				<Button.secondary label="Secondary">
				<Button.primary label="Primary">
				<Button.primary label="Disabled" disabled=yes>
				<Button.primary icon='v' label="Primary">
				
			<section>
				<h3> "Typography"
				<p.mute> "Muted paragraph"
				<div uxa:md=short>

			<section>
				<h3> "Colors"
				<ColorScale tint='tint'>
				<ColorScale tint='pri'>
				<ColorScale tint='sec'>
				# <ColorScale tint='dark'>
				# <ColorSample bg='bg'>
				# <ColorSample bg='alt-bg'>
				# <ColorSample bg='pri'>
				# <ColorSample bg='sec'>
	
export tag Home

	def render
		<self>
			<Palette tint='neutral'>
			<Palette tint='dark'>

			<div.section uxa:md=mdart>
			<TextField label="Something" placeholder="Nothing to see">
			<button :tap='conf'> 'confirm'
			<h2> "Markdown examples"
			<div uxa:md="hello">
			<div uxa:md="# hello\nagain">
			
	def conf
		var res = await uxa.confirm("Are you sure you want to do this?")
		console.log "response from confirm",res