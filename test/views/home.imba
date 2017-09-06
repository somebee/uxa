var mdart = require '!raw-loader!../md/article.md'

import Button,TextField,Dialog,Menu,MenuItem from 'uxa'

var short = """

# Main heading

This is a short paragraph with a [link](#link) and some text.

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
				<Button.primary icon='v' label="Menu" :menu='menu'>
				
			<section>
				<div uxa:md=long>
				<hr>
				<TextField label="Title" placeholder="Descriptive title" desc="Some description of this">
				<TextField label="Secret word" placeholder="What is the secret?" required=yes pattern="uxauxa" desc="Can you guess it?">
				<TextField label="Alias" desc="This field is disabled" disabled=yes>

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