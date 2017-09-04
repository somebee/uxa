import Menu from './Menu'
import Popover from './Popover'

export tag Overlay
	prop component
	prop target

	def render
		<self>
			component.flag('floating').end
			<div.curtain :tap='hide'>
			
	def show
		flag('hidden')
		reflow if @isMenu
		document:body.appendChild(dom)
		dom:offsetWidth
		unflag('hidden')
		flag('visible')
		self

	def hide
		flag('hidden')
		unflag('visible')
		setTimeout(&,200) do
			dom:parentNode.removeChild(dom)
		self
	
	def setup
		@isMenu = component isa Menu or component isa Popover
		console.log 'setup', target
	
	def reflow
		unless target.dom:offsetParent
			hide unless hasFlag('hide')
			return self

		var box = target.dom.getBoundingClientRect

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
			css:bottom = box:top
			css:maxHeight = vh - css:bottom
		
		if ax < 0.5
			css:left = Math.max(box:left,10)
		else
			css:right = Math.max((vw - box:right),10)

		console.log x,vw,y,vh,ax,ay
		
		component.css(css)

		# css
		# 	padding-top: Math.round((box:bottom + sx) + 10)
		# 	bottom: (vh - (box:top - 10 + sy))
		# 	left: x
		# 	max-width: Math.min( (xmax - x) * 2, (x - xmin) * 2)

	def calculateLabelPosition
		var box = dom.getBoundingClientRect
		var ax = box:left / document:body:offsetWidth
		var ay = box:top / document:body:offsetHeight

		setFlag('ax',ax > 0.7 ? 'axr' : (ax < 0.3 ? 'axl' : 'axc'))
		setFlag('ay',ay > 0.7 ? 'ayb' : (ay < 0.3 ? 'ayt' : 'ayc'))
		self
		

export class Stack
	def self.show item, rel
		var overlay = <Overlay component=item target=rel>
		overlay.show