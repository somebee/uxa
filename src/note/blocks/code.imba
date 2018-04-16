import Block,Content from './base'
import Sel,eventKeys from '../util'
# import highlight from '../highlighter'
import UXA from '../../uxa'
import Code from '../../Code'

class Selection
	prop root

	def initialize root
		@root = root
		
	def start
		@root:selectionStart
		
	def end
		@root:selectionEnd
		
	def toString
		@root:value.slice(start,end)
		
	def atStart
		
		start == 0
		
	def atEnd
		end == @root:value:length
		
	def atTop
		textBefore.indexOf('\n') == -1
		
	def atBottom
		textAfter.indexOf('\n') == -1
	
	def serialize
		{
			start: start
			length: end - start
			text: toString
			before: @root:value.substr(0,start)
			after: @root:value.substr(end)
		}
		
	def textBefore
		@root:value.substr(0,start)
		
	def textAfter
		@root:value.substr(end)
		
	def insert text
		
		var start = self.start
		var offset = textBefore:length + text:length
		var value = textBefore + text + textAfter
		console.log "insert",text,start,offset,JSON.stringify(value)
		@root:value = value
		@root:selectionStart = @root:selectionEnd = offset
		self
		
	def collapse
		if start != end
			@root:selectionEnd = start
		self

tag PlainContent < textarea
	prop data watch: yes
	prop spellcheck dom: yes
	
	def selection
		Selection.new(dom)
		
	def dataDidSet data
		deserialize(data:body)
	
	def plaintext
		dom:value
		
	def serialize
		[dom:value]
		
	def deserialize value
		value = value:body or value
		console.log "deserialize",value
		dom:value = value isa Array ? value[0] : value
		self
		
	def onkeydown e
		let key = eventKeys(e)
		let sel = selection
		let selData = sel.serialize
		key:selection = sel
		key:text = selData:text
		key:textBefore = selData:before
		key:textAfter = selData:after

		e.data = key
		return
	
	def select start, end
		console.log "select",start,end
		start = plaintext:length + start + 1 if start < 0
		end = start if end == undefined
		end = plaintext:length + end + 1 if end < 0
		@dom.focus
		@dom:selectionStart = start
		@dom:selectionEnd = end
		self
		
	# def render
	# 	self
		
	# def onkeydown e
	# 	let key = (e.data ||= eventKeys(e))

export tag CodeBlock < Block
	register 'code'

	def isRich
		no
	
	def oninput
		# @highlighted.update(plaintext,data:language)
		refresh
		
	def onkeydown e, o
		return super if !o
			
		if o:tab
			o:selection.insert("\t").collapse
			refresh
			return e.prevent

		if o:enter and !o:meta
			return
			if o:selection.atEnd
				o:selection.insert("\n\n").collapse
			else
				o:selection.insert("\n").collapse
			refresh
			return e.prevent

		super
		
	
		
	def oninput e
		# let raw = body.dom:textContent
		# let text = body.dom:innerText
		
		# if raw !== text
		# 	console.log "difference between text and raw"
		
		refresh
		self
		
	def ondirty
		refresh

	def ondelstart e
		if prevBlock and prevBlock.matches('.CodeBlock')
			return trigger('joinabove')
		elif plaintext:length == 0
			super
			
		e.stop
		
	def plaintext
		@body.dom:value
		
	def refresh
		data:body = plaintext
		# console.log "raw",JSON.stringify(plaintext)
		var html = Code.highlight(plaintext,data:language or 'imba')
		@rich.dom:innerHTML = html
		return self
		
	def setup
		render
		refresh
		
	def body
		# <Content@body[data] editable=context.editable spellcheck=false>
		<PlainContent@body[data:body] spellcheck=false>
	
	def render
		<self .{type}>
			<.lines>
			<.content>
				body
				<pre@rich.block-overlay>