import Block,Content from './base'

# import highlight from '../highlighter'
import UXA from '../../uxa'
import Code from '../../Code'
		
export tag CodeBlock < Block
	register 'code'

	def isRich
		no
	
	def oninput
		# @highlighted.update(plaintext,data:language)
		refresh
		
	def onkeydown e, o
		if o:tab
			o:selection.insert("  ").collapse
			refresh
			return e.prevent

		if o:enter and !o:meta
			return

		super
		
	def ondirty
		refresh

	def ondelstart e
		if prevBlock and prevBlock.matches('.CodeBlock')
			return trigger('joinabove')
		elif plaintext:length == 0
			super
			
		e.stop
		
	def refresh
		var html = Code.highlight(plaintext,data:language or 'imba')
		@rich.dom:innerHTML = html
		return self
		
	def setup
		render
		refresh
		
	def body
		<Content@body[data] editable=context.editable spellcheck=false>
	
	def render
		<self .{type}>
			<.content>
				body
				<@rich.block-overlay>