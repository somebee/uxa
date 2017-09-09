import Form from './Form'
import Button from './Button'
import Indicator from './Indicator'

export tag Dialog < Form

	prop type
	prop submitLabel default: 'confirm'
	prop cancelLabel default: 'dismiss'
	
	def setContent content, type
		console.log "setting content for dialog"
		@content = Imba.static(content,type)
		self
		
	def onsubmit e
		e.cancel.halt # should it do this by default?

		if uxa.queue.busy
			console.log "cannot submit while busy!"
			return

		trigger('uxa:submit',formData)
		await uxa.queue

		if uxa.queue.failed
			console.log "failed?!?!",uxa.queue.error
			uxa.flash uxa.queue.error
			uxa.queue.reset
		else
			setTimeout(&,200) do
				hide

	def show
		uxa.open(self)
		
	def hide
		trigger 'uxa:hide'
	
	def submit
		self
		
	def tapDismiss e
		e.cancel.halt
		trigger('uxa:dismiss')

		if uxa.queue.idle
			return hide
		
		await uxa.queue
		setTimeout(&,200) do hide

	def header
		<header@header>
		
	def indicator
		<Indicator@indicator[uxa.queue] type='forward'>
	
	def body
		<section@body>
			if @content
				@content
			elif @template
				renderTemplate
		
	def footer
		<footer@footer.flat>
			<Button type='button' label=cancelLabel :tap='tapDismiss'>
			<Button.primary type='submit' label=submitLabel>
		
	def render
		<self.uxa>
			header
			body
			footer
			indicator

# ConfirmDialog

# AlertDialog
