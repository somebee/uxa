import Menu from './Menu'
import Popover from './Popover'
import Snackbar from './Snackbar'

export tag Overlay
	prop component
	prop target
	prop options
	
	prop isModal
	prop isMenu

	def render
		<self>
			component.flag('floating').flag('paper').end
			<div.backdrop :tap='autohide'>

	# TODO improve state transitioning to allow reusing overlays
	def show
		@activeElement = document:activeElement
		@autohider = do |e|
			hide if !e or !component.dom.contains(e:target)
		# also store the closest focusable parent?
		document:body.appendChild(dom)
		component.trigger('uxashow')
		reflow if @isMenu or @options:anchor
		dom:offsetWidth
		Imba.TagManager.insert(self,dom:parentNode)
		flag('uxa-show')
		flag('autohide',!!@options:autohide)
		component.flag('uxa-show')
		Imba.TagManager.refresh(yes)
		if target
			target?.flag('uxa-overlay-active')

		if @options:autohide
			window.addEventListener('click',@autohider,yes)
		self
	
	def mount
		schedule(events: yes)
	
	def unmount
		unschedule

	def hide
		return if hasFlag('uxa-hide')
		flag('uxa-hide')
		component.flag('uxa-hide')
		unflag('uxa-show')
		component.unflag('uxa-show')
		
		var refocus = @activeElement
		@activeElement = null

		if target
			target?.unflag('uxa-overlay-active')

		window.removeEventListener('click',@autohider,yes)
		
		setTimeout(&,20) do
			if refocus and refocus:offsetParent
				refocus.focus
			
		setTimeout(&,200) do
			var par = dom:parentNode
			par.removeChild(dom)
			Imba.TagManager.remove(self,par)
			component.unflag('uxa-hide')
			# remove css positions as well
			Imba.TagManager.refresh(yes)
		self

	def onevent e
		# If it is a custom event
		if @eventResponder and e.bubble and !contains(@eventResponder) and !(e.event isa Event)
			e.redirect(@eventResponder)
		self
		
	def autohide
		unless @isModal
			component.trigger('uxa:hide')
			
	def onuxahide e
		e.stop
		hide

	def onuxashow e
		e.stop
	
	def setup
		@isMenu = component isa Menu or component isa Popover or component.hasFlag('menu')
		@isModal = component.hasFlag('modal')
		@eventResponder = (@options and @options:responder) or (target)
	
	def reflow
		let box = @options:anchor
		if (!box or box == yes) and (target and target.@dom isa Element) # isa Imba.Tag 
			unless target.dom:offsetParent
				hide unless hasFlag('hide')
				return self
			box = target.dom.getBoundingClientRect
		
		# var box = target.dom.getBoundingClientRect
		return unless box

		var w = component.dom:offsetWidth
		var h = component.dom:offsetHeight

		var vw = window:innerWidth
		var vh = window:innerHeight

		var sx = 0 # window:scrollX
		var sy = 0 # window:scrollY

		var x = Math.round(box:left + sx + box:width * 0.5)
		var y = Math.round(box:top + sy + box:height * 0.5)

		var ax = x > vw * 0.5 ? 1 : 0
		var ay = y > vh * 0.5 ? 1 : 0

		var xmax = vw - 10
		var xmin = 10

		setFlag('ay',ay ? 'below' : 'above')
		setFlag('ax',x > (vw * 0.5) ? null : 'lft')
		
		var css = {
			maxWidth: 400
		}
		component.flag('abs')
		
		if ay < 0.5
			css:top = box:bottom
			css:maxHeight = vh - css:top
		else
			css:bottom = vh - box:top
			css:maxHeight = vh - css:bottom
		
		if ax < 0.5
			css:left = Math.max(box:left,10)
		else
			css:right = Math.max((vw - box:right),10)

		console.log x,vw,y,vh,ax,ay,box
		component.css(css)


export class Stack
	def self.show item, rel, o = {}
		var overlay = <Overlay component=item target=rel options=o>
		overlay.show