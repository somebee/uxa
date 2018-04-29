import Form from './Form'
import Button from './Button'
import Indicator from './Indicator'

export tag Dialog < Form

	prop type
	prop submitLabel default: 'confirm'
	prop cancelLabel default: 'dismiss'
	
	def setContent content, type
		log "setting content for dialog"
		@content = Imba.static(content,type)
		self
		
	def onsubmit e
		e.prevent.stop # should it do this by default?

		if uxa.queue.busy
			return

		var uxaev = trigger('uxa:submit',formData)
		await uxa.queue

		if uxa.queue.failed
			log "failed?!?!",uxa.queue.error
			uxa.flash uxa.queue.error
			uxa.queue.reset
		elif !uxaev.isPrevented
			setTimeout(&,200) do hide

	def show
		uxa.open(self)
		
	def hide
		trigger 'uxa:hide'
	
	def submit
		self
		
	def mount
		schedule(events: yes)
	
	def unmount
		unschedule
		
	def tapDismiss e
		e.prevent.stop
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
		<footer@footer> <.spaced.bar.justify-end>
			<Button type='button' label=cancelLabel :tap='tapDismiss'>
			<Button.primary type='submit' label=submitLabel>
		
	def render
		<self.dialog>
			header
			body
			footer
			indicator

# ConfirmDialog

# AlertDialog
