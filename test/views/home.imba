var mdart = require '!raw-loader!../md/article.md'

import IconButton,Button,TextField,TextArea,Dialog,Menu,MenuItem,Form,Indicator,Tile from 'uxa'
import SelectField from '../../src/TextField'

var short = """

# Main heading
## Heading 2
### Heading 3

Paragraph text

"""

var long = """
# Heading 1

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec cursus elit at
odio congue, ac varius massa tincidunt. Nulla blandit odio vel bibendum 
condimentum. In hac habitasse [platea](#platea) dictumst. Nam eu nisl ut erat 
sollicitudin tincidunt.

## Heading 2

Nullam eget urna vitae ex ullamcorper dictum ac ullamcorper nisl. Mauris a
quam non ante ullamcorper ultrices quis quis libero. Quisque ultrices lorem
metus. Duis mi est, elementum nec egestas a, luctus et lacus.

### Heading 3

Nullam eget urna vitae ex ullamcorper dictum ac ullamcorper nisl. Mauris a
quam non ante ullamcorper ultrices quis quis libero. Quisque ultrices lorem
metus.

"""

var tile = """
## Intro to the Hacker News API
In this tutorial we'll wrap the Hacker News API in a tiny SDK and learn how to use it to fetch data from Hacker News submissions and comments.
"""

var tile2 = """
In this [tutorial](#tutorial) we'll wrap the Hacker News API in a tiny SDK and learn how to use it to fetch data from Hacker News submissions and comments.
"""

var items = [{
	title: "Introduction to HTML"
},{
	title: "Learn about Variables"
},{
	title: "Creating a website"
}]

var state = {
	title: "Something"
	category: 'Imba'
	categories: ['Imba','React','Vue.js','Angular']
	rating: 8
}

tag LogForm < Form
	
	def fill
		setFormData(title: "Something", desc: "Hello there mate!!")
	
	def render
		<self>
			# <.field.resting.lg>
			# 	<input[state:title] type='text' placeholder='Title of project'>
			# 	<label data-label="Title"> "Title"
			# 	<hr>
				
			<.field>
				<input[state:title] type='text' placeholder='Subtitle of project' pattern="Stuff">
				<label> "Subtitle"
				<hr>
			
			<.field.radio>
				<input[state:rating] type='range' min=0 max=10 step=1 name='slide'>
				<label> "Font-size"

			<.field>
				<input type='checkbox'>
				<label> "Another checkbox yes"
			
			<.field>
				<.field>
					<input type='radio' name='group' value='red'>
					<label> "Red"
				
				<.field>
					<input type='radio' name='group' value='green'>
					<label> "Green"
					
				<.field>
					<input type='radio' name='group' value='blue'>
					<label> "Blue"
				
			<.field.select>
				<select[state:category]>
					for item in state:categories
						<option> item
				<label> "Blue"
			# <TextField label="Title" name='title' placeholder="Descriptive title" desc="Some description of this">
			# <SelectField label="Category" name='category' desc="Some description of this">
			# <TextField label="Secret word" name='secret' placeholder="What is the secret?" required=yes pattern="uxauxa" desc="Can you guess it?">
			# <TextArea label="Description" name='desc' desc="Please feel free to describe" placeholder="Some description" required=yes>
			# <TextField label="Alias" name='alias' desc="This field is disabled" disabled=yes>
			# <Button.primary label="Submit" type='submit'>
			# <Button.primary label="Fill" type='button' :tap='fill'>

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
				# <h3> "Flat buttons"
				<Button.muted label="Dismiss">
				<Button.secondary label="Secondary">
				<Button.primary label="Primary">
				<Button.primary label="Disabled" disabled=yes>
				<Button.primary icon='v' label="Menu" :menu='menu'>
				# <h3> "Icon buttons"
				<.hbar>
					<IconButton.xs icon='*'>
					<IconButton.sm icon='*'>
					<IconButton.md icon='*'>
					<IconButton.lg icon='*'>
					<IconButton.xl icon='*'>

				# <h3> "Floating IconButton"
				# <.hbar css:position='relative'>
				# 	<IconButton.floating.xs icon='*'>
				# 	<IconButton.floating.sm icon='*'>
				# 	<IconButton.floating.md icon='*'>
				# 	<IconButton.floating.lg icon='*'>
				# 	<IconButton.floating.xl icon='*'>
				
			<section>
				<div uxa:md=long>
				<hr>
				<LogForm>
				
			<section>
				<div.md uxa:md=short>
			
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

tag TileTest
	def render
		<self.tile>
			<.body>
				<.title>
					<span> data:title
					<span.dim> " (example.uxa.io)"
				<.legend.bullets.dim>
					<span> "by John Doe"
					<span> "20 minutes ago"
export tag Home

	def render
		<self>
			<article.hero>
				<.container.narrow.pad.lg>
					<h1> "Hello, future expert"
					<p> "Scrimba is a powerful new way of learning code. Play around with the instructors code any time, right in the player."
					<.spaced.center>
						<a.button.primary> "Take Tour"
					<hr>

			<.container.light>
				
				<.masthead>
					<a.logo> "Scrimba"
					<a.item> "tes"

				<.masthead.dark>
					"Masthead"

				<.breadcrumb>
					<ul>
						<li> "Home"
						<li> "Next"
						<li> "Other"

				<section>
					for item in ['light','dark']
						<.grid.tiles .{item}>
							<.tile>
								<p> "Default color"
								<p.red> "Red"
								<p.green> "Green"
								<p.blue> "Blue"
								<p.yellow> "Yellow"
								<p.dim> "Dim"
								<p.muted> "Muted"
								<.spaced>
									<a.button> "Cancel"
									<a.button.primary> "Submit"
							<.tile>
								<.spaced.bar>
									<a.button data-icon='mclose'> "Archive"
									<a.button data-icon-after='mclose'> "Undo"
									<a.sm.button data-icon='mclose'> "Archive"
									<a.sm.button data-icon-after='mclose'> "Undo"
								<hr>
								<p> "Some text right here"
								<.bar.spaced>
									<.green> "Green"
									<.blue> "Blue"
									<.yellow> "Yellow"
								<hr>
								<.bar.spaced>
									<a.button.solid.primary data-icon='mclose'> "Archive"
									<a.button.solid data-icon='mclose'> "Undo"
									<a.button.solid data-icon='mclose'> "Archive"
									<a.button.solid> "Undo"

							<.tile>
								<.menu>
									<.item> "Edit item"
									<.item data-icon='mright'> "Remove item"
									<hr>
									<.item data-icon='mright'> "Edit item"
									<.item data-icon='mclose'> "Close menu"
				<section.section>
					<header>
						<.title> "Title"
						<.subtitle> "Subitle for section"
					<.grid.tiles> for item,i in ['sm','md','lg']
						<.tile .dark=(i == 2)>
							<div.{item} uxa:md=short>
							<LogForm.{item}>
						

				<section>
					<.grid.tiles> for item in items
						<TileTest[item]>
				<section.mb-xl>
					<.grid.tiles> for item in items
						<TileTest[item].dark>
				
			<.container.narrow uxa:md=long>
			<.container.narrow.sm uxa:md=long>
			
			<.container.narrow>
				<.tile.dark>
					<h2> "This is a tile!"


			# <section>
			# 	<h3> "Colors"
			# 	# <ColorScale tint='base'>
			# 	# <ColorScale tint='dark'>
			# 	# <ColorScale tint='pri'>
			# 	# <ColorScale tint='sec'>
			# <Palette tint='neutral'>
			# <Palette tint='light'>
			# <Palette tint='dark'>

			