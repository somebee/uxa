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

	def show
		document:body.appendChild(dom)
		component.trigger('uxashow')
		reflow if @isMenu
		dom:offsetWidth
		flag('uxa-show')
		component.flag('uxa-show')
		self

	def hide
		flag('uxa-hide')
		component.flag('uxa-hide')
		unflag('uxa-show')
		component.unflag('uxa-show')

		setTimeout(&,200) do
			dom:parentNode.removeChild(dom)
			component.unflag('uxa-hide')
			# remove css positions as well
		self

	def onevent e
		# very experimental
		if @eventResponder and !contains(@eventResponder) and e.type.indexOf('uxa') == 0
			console.log "Overlay redirect event {e.type}"
			e.redirect(@eventResponder)
		self
		
	def autohide
		unless @isModal
			hide
			
	def onuxahide e
		e.halt
		hide
	
	def setup
		@isMenu = component isa Menu or component isa Popover
		@isModal = component.hasFlag('modal')
		@eventResponder = @options and @options:responder
		console.log 'setup', target
	
	def reflow
		unless target.dom:offsetParent
			hide unless hasFlag('hide')
			return self

		var box = target.dom.getBoundingClientRect

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

		console.log x,vw,y,vh,ax,ay
		component.css(css)


export class Stack
	def self.show item, rel, o = {}
		var overlay = <Overlay component=item target=rel options=o>
		overlay.show