import Form from './Form'
import Button from './Button'
import Indicator from './Indicator'

export tag Dialog < Form

	prop type
	prop markdown
	prop submitLabel default: 'confirm'
	prop cancelLabel default: 'dismiss'
	
	def setContent content, type
		console.log "setting content for dialog"
		@content = Imba.static(content,type)
		self
		
	def onsubmit e
		e.cancel.halt
		submit
		var res = trigger('uxa:submit')
		console.log "triggered uxa:submit",res
		var afterQueue = await uxa.queue
		console.log "returned after queue",afterQueue
		if uxa.queue.failed
			console.log "failed?!?!",uxa.queue.error
			uxa.flash uxa.queue.error
		else
			setTimeout(&,200) do hide
		
	def hide
		trigger 'uxa:hide'
	
	def submit
		self
		
	def cancel
		hide
		self

	def header
		<header@header>
		
	def indicator
		<Indicator@indicator[uxa.queue] type='forward'>
	
	def body
		<section@body>
			if markdown
				<span uxa:md=markdown>
			elif @content
				@content
			elif @template
				renderTemplate
		
	def footer
		<footer@footer.flat>
			<Button type='button' label=cancelLabel :tap='cancel'>
			<Button.primary type='submit' label=submitLabel>
		
	def render
		<self.uxa>
			header
			body
			footer
			indicator

# ConfirmDialog

# AlertDialog
