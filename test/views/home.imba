var mdart = require '!raw-loader!../md/article.md'

import Button,TextField,TextArea,Dialog,Menu,MenuItem,Form,Indicator,Tile from 'uxa'
import SelectField from '../../src/TextField'

var short = """

# Main heading
## Heading 2
### Heading 3

Paragraph text

"""

var long = """
# Heading

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec cursus elit at
odio congue, ac varius massa tincidunt. Nulla blandit odio vel bibendum 
condimentum. In hac habitasse [platea](#platea) dictumst. Nam eu nisl ut erat 
sollicitudin tincidunt. Nunc nec scelerisque felis. Nulla fringilla 
id nulla vitae pulvinar.

---

## Heading 2

Nullam eget urna vitae ex ullamcorper dictum ac ullamcorper nisl. Mauris a
quam non ante ullamcorper ultrices quis quis libero. Quisque ultrices lorem
metus. Duis mi est, elementum nec egestas a, luctus et lacus. Pellentesque
augue libero, scelerisque sit amet purus ut, tempor sagittis neque.

### Heading 3

Nullam eget urna vitae ex ullamcorper dictum ac ullamcorper nisl. Mauris a
quam non ante ullamcorper ultrices quis quis libero. Quisque ultrices lorem
metus. Duis mi est, elementum nec egestas a, luctus et lacus. Pellentesque
augue libero, scelerisque sit amet purus ut, tempor sagittis neque.

"""

var tile = """
## Intro to the Hacker News API
In this tutorial we'll wrap the Hacker News API in a tiny SDK and learn how to use it to fetch data from Hacker News submissions and comments.
"""

var tile2 = """
In this [tutorial](#tutorial) we'll wrap the Hacker News API in a tiny SDK and learn how to use it to fetch data from Hacker News submissions and comments.
"""

tag LogForm < Form
	
	def fill
		setFormData(title: "Something", desc: "Hello there mate!!")
	
	def render
		<self>
			<TextField label="Title" name='title' placeholder="Descriptive title" desc="Some description of this">
			<SelectField label="Category" name='category' desc="Some description of this">
			<TextField label="Secret word" name='secret' placeholder="What is the secret?" required=yes pattern="uxauxa" desc="Can you guess it?">
			<TextArea label="Description" name='desc' desc="Please feel free to describe" placeholder="Some description" required=yes>
			<TextField label="Alias" name='alias' desc="This field is disabled" disabled=yes>
			<Button.primary label="Submit" type='submit'>
			<Button.primary label="Fill" type='button' :tap='fill'>

	def onsubmit e
		e.cancel.halt
		console.log "submit",formData
		

tag DialogExample < Button		
	def ontap
		if @template
			uxa.open template(), responder: self
			
tag ColorSample
	prop bg
	prop weight
	prop color
	prop label

	def setup
		css(background: "var(--{bg})", color: "var(--{color})")
		
	def render
		<self> <span> label or weight
		
tag ColorScale
	prop tint
	def render
		<self> for item,i in [0,50,100,200,300,400,500,600,700,800,900,'A100','A200','A400','A700']
			<ColorSample weight=item bg="uxa-{tint}-{item}" color="uxa-{tint}-{i > 5 ? 0 : 900}">
		
tag Palette
	prop tint

	def menu
		<Menu.inset>
			<MenuItem icon='w' label='Open'>
			<MenuItem icon='v' label='Paste in place'>
			<MenuItem icon='v' label='Research'>
			<MenuItem icon='.' label='Go to site...'>
			<hr.sm>
			<MenuItem icon='>' label='Home'>
			<MenuItem icon='>' label='Back'>
			<MenuItem icon='>' label='Sign out' disabled=yes>

	
	def submitLong e
		e.target.uxa.queue.add 10000 do |a|
			Promise.new do |resolve,reject| setTimeout(resolve,3500)
		self

	def submitShort e
		e.target.uxa.queue.add 1000 do |a|
			Promise.new do |resolve,reject| resolve() # setTimeout(resolve,4500)

	def submitUnexpectedLong e
		e.target.uxa.queue.add 2000 do |a|
			Promise.new do |resolve,reject| setTimeout(resolve,4500)

	def submitFail e
		e.target.uxa.queue.add 10000 do |a|
			Promise.new do |resolve,reject|
		
				setTimeout(&,1500) do
					try
						Math.rendom
					catch e
						reject(e)
					# reject("Something went wrong!!")



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

				<DialogExample.raised.primary :uxasubmit='submitLong' label='Progress' ->
					<Dialog.modal submitLabel='Process'>
						<div uxa:md="This is a longer dialog explaining something right here?">

				<DialogExample.raised.primary :uxasubmit='submitFail' label='Fail' ->
					<Dialog.modal> <div uxa:md="This will fail on submit!">

				<DialogExample.raised.primary :uxasubmit='submitUnexpectedLong' label='Longer' ->
					<Dialog.modal> <div uxa:md="This will take longer than expected">

				<DialogExample.raised.primary :uxasubmit='submitShort' label='Instant' ->
					<Dialog.modal> <div uxa:md="This will submit instantly">
			
			<section.flat>
				<h3> "Flat buttons"
				<Button.muted label="Dismiss">
				<Button.secondary label="Secondary">
				<Button.primary label="Primary">
				<Button.primary label="Disabled" disabled=yes>
				<Button.primary icon='v' label="Menu" :menu='menu'>
				
			<section>
				<div uxa:md=long>
				<div.hx3 uxa:md=long>
				<hr>
				<LogForm>
				
			<section>
				# <h2> "Typography"
				# <div.xs uxa:md=short>
				# <div.sm uxa:md=short>
				<div.md uxa:md=short>
				# <div.lg uxa:md=short>
				# <div.xl uxa:md=short>
				# <Indicator type='indeterminate'>
			
			<section>
				<h2> "Tiles"
				<div.tiles.hbox.dark>
					<Tile md=tile>
					<Tile md=tile2>
					<Tile>
				
				<h2> "Small"
				<div.tiles.hbox.dark.sm>
					<Tile md=tile>
					<Tile md=tile2>
					<Tile>

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
			