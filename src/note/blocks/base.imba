
import Sel,eventKeys from '../util'


export var types = {}

import Triggers,Schema,Actions from '../options'
import ActionsMenu from './menu'

export tag Entity < span
	prop data watch: yes
	prop spellcheck dom: yes
	
	def self.deserialize item
		return <Entity[item]>
		
	def self.serialize root, base
		var data = []
		var curr = data
		
		if base
			data = Object.assign({},base)
			data:body = curr = []
			
		var pluck-attrs = do |options,node,*attrs|
			# console.log "pluck",node,attrs
			for key in attrs
				let val = node.getAttribute(key)
				options[key] = val if val
			return options
			
		var allow = {
			a: ['href','target']
			b: []
			i: []
		}

		var traverse = do |node|
			if node isa NodeList
				for child in node
					traverse(child,node)
				return

			if node isa Text
				let text = node:textContent
				let last = curr[curr:length - 1]
				if last and last isa String
					curr[curr:length - 1] = last + text
				else
					curr.push(text)
				return
				
			if node isa Element and node.@tag and node.@tag:serialize
				let result = node.@tag.serialize
				return curr.push(result)
			
			var typ = node:nodeName.toLowerCase
			
			if typ == 'strong'
				typ = 'b'
			elif typ == 'em'
				typ = 'i'
			elif typ == 'br'
				return traverse(document.createTextNode('\n'))
			
			unless allow[typ]
				return traverse(node:childNodes)
			
			
			var el = {type: typ, body: []}
			
			if typ == 'a'
				pluck-attrs(el,node,'href','target')
			
			var prev = curr	
			prev.push(el)
			curr = el:body
			traverse(node:childNodes)
			curr = prev
		
		traverse(base ? root:childNodes : root)
		return data
		
	def self.deserialize root, config
		var curr = root

		var traverse = do |data|
			let el
			if data isa String
				el = document.createTextNode(data)
				return curr.appendChild(el)
				
			elif data isa Array
				traverse(item) for item in data

			elif data isa Object
				var typ = data:type
				var prev = curr
				# should extract this - make intelligent
				curr = document.createElement(typ)
				if typ == 'a'
					curr:href = data:href if data:href
					curr:target = data:target if data:target

				traverse(data:body)
				prev.appendChild(curr)
				curr = prev
		
		# root:innerHTML = '' # remove textElement as well
		while root:firstChild
			root:removeChild(root:firstChild)
		traverse(config)
		return root

	def selection
		var sel = window.getSelection
		return null unless sel and dom.contains(sel:anchorNode)
		return Sel.new(dom,sel)
		
	def body
		dom
		
	def clear
		while dom:firstChild
			dom:removeChild(dom:firstChild)
		self
	
	def select start, end
		Sel.select(body,start,end)
		
	def range start, end
		Sel.range(body,start,end)
	
	def plaintext
		body:innerText.replace(/(\&nbsp;| )/g,' ')

	def deserialize data
		clear
		Entity.deserialize(body,data:body or data)
		deserialized
	
	def deserialized
		self

	def serialize root = body, options = data
		Entity.serialize(root,options)
	
	def reformat
		var raw = serialize(body:childNodes)
		var sel = selection?.serialize
		deserialize(raw)
		select(sel:start,sel:start + sel:length) if sel


export tag Content < Entity
	@nodeType = 'div'
	prop editable watch: yes

	def editableDidSet bool
		dom:contentEditable = bool
		flag('editable',bool)

	def dataDidSet data
		deserialize(data)
	
	# should only return the body from serialize
	def serialize
		Entity.serialize(body:childNodes)

	def block
		parent.parent
	
	# should happen on block-leven instead?
	def onkeydown e
		let key = eventKeys(e)

		let sel = selection
		# let index = sel and sel.start
		# let prefix = sel.prefix
		# let postfix = sel.postfix
		key:selection = sel
		key:text = sel.raw.toString
		key:textBefore = sel.prefix
		key:textAfter = sel.postfix

		e.data = key
		return
		
	def onpaste e
		@pasting = yes
			
	def oninput e
		if let paste = @pasting
			@pasting = null
			reformat

export tag Block

	prop context

	@options = {}
	
	def self.register type, options = {}
		types[type] = self
		options:type = type
		self.@options = options

	def self.buildNode
		if let type = @options:nodeType
			var node = Imba.document.createElement(type)
			node:classList.add('Block')
			return node

		return Imba.Tag:buildNode.call(self)

	def self.deserialize data, owner
		if data isa Block
			return data
			
		data:body ||= []

		let type = types[data:type] or Block
		type.build(owner).setData(data).end
		
	def build
		tabindex = -1

	def context
		@owner_

	def isEditable
		context?.editable

	def isRich
		yes
		
	def isEmpty
		plaintext:length == 0
		
	def isOutlineMode
		document:activeElement and document:activeElement.matches('.Block')

	def type
		data:type
		
	def selection
		body.selection
	
	def plaintext
		body.plaintext
		
	def select start, end
		start == undefined ? focus : body.select(start,end)
		
	def range start, end
		body.range(start,end)
		
	def prevBlock
		try dom:previousElementSibling.@tag
	
	def nextBlock
		try dom:nextElementSibling.@tag
			
	def replaceWithBlock block
		block = Block.deserialize(block,context)
		var sel = selection?.serialize
		parent.dom.replaceChild(block.dom,self.dom)
		block.select(sel:start,sel:start + sel:length) if sel
		return block
			
	def schema
		Schema[type] or Schema:default
			
	def focus
		dom.focus
		# start ? select(0) : select(-1)
		
	def onpaste e
		@pasting = e
		var data = e.event:clipboardData
		try
			var code = JSON.parse(data.getData('scrimba/code'))
			var block = JSON.parse(data.getData('uxa/block'))
			console.log "found code",block
			if block
				e.prevent.stop
				isEmpty ? trigger('morph',block) : trigger('addafter',block)
		catch e
			log 'error',e
			
	def ondel e
		e.stop

		let next = nextBlock
		let prev = prevBlock
		# let outlined = isOutlineMode		
		next ? trigger('focusafter') : trigger('focusbefore')
		orphanize
		


	def onfocusafter
		if let block = nextBlock
			isOutlineMode ? block.focus : block.select(0)
	
	def onfocusbefore
		if let block = prevBlock
			isOutlineMode ? block.focus : block.select(-1)

	def onmorph e, to
		if to isa String
			to = Object.assign({},data,type: to)
		return e.@block = replaceWithBlock(to)
		
	def onadd e
		var clone = serialize
		clone:body = []
		let next = context.block(clone) # (<Block[clone]>)
		dom.insertAdjacentElement('afterend',next.dom)
		next.edit
	
	def onaddbefore e, data
		
		data ||= {type: schema:above or 'p', body: []}
		var block = context.block(data)
		# (<Block[{type: schema:above or 'p', body: []}]>)
		dom.insertAdjacentElement('beforeBegin',block.dom)
		
	def onaddafter e, fragment
		unless fragment
			fragment = {type: schema:next or type, body: []}

		# console.log "add after",fragment,schema
		fragment:type = schema:next or fragment:type or 'p'
		let next = context.block(fragment) # (<Block[fragment]>)
		dom.insertAdjacentElement('afterend',next.dom)
		next.select(0)

	def onmoveup e
		if prevBlock
			dom.insertAdjacentElement('afterend',prevBlock.dom)
			e.stop
		
	def onmovedown e
		if nextBlock
			dom.insertAdjacentElement('beforeBegin',nextBlock.dom)
			e.stop
		
	def onjoinabove e
		if let above = prevBlock
			if above isa HRBlock
				above.orphanize
				return

			if plaintext:length == 0
				trigger('focusbefore')
				# if there is no prev block - focus on next?
				orphanize
				return # above.focus(false)

			let data = above.serialize
			let offset = above.plaintext:length
			data:body = [].concat(data:body,serialize:body)
			var block = above.replaceWithBlock(data)
			block.select(offset)
			orphanize
		self
	
	def ondelstart e
		trigger('morph',serialize(type: 'p'))
		e.stop
		
	def onduplicate e
		e.stop
		var block = context.block(serialize)
		dom.insertAdjacentElement('beforeBegin',block.dom)
		
	def onkeydown e
		let key = (e.data ||= eventKeys(e))
		let sel = key:selection
		let tabtrigger = Triggers[key:textBefore]

		@keydownSel = sel

		if @menu
			@menu?.onkeydown(e,key)
			if !e.bubble
				return 
		
		# keydown directly at target
		var call = do |action, params|
			e.@command = self.trigger(action,params)
			e.prevent
			return e.@command
		
		if tabtrigger and (key:space or key:enter)
			# if let trigger = Triggers[key:textBefore]
			select(0,key:textBefore:length).getRangeAt(0).deleteContents
			tabtrigger = {type: tabtrigger} if tabtrigger isa String
			let item = serialize(tabtrigger)
			return call('morph',item) # trigger('input',e)

		if key:meta and key:d
			call('duplicate')

		elif key:meta and key:z
			key:shift ? call('redo') : call('undo')

		elif key:meta and key:l
			e.prevent
			# what if we are inside link already?
			if key:text
				if let url = window.prompt("Link:")
					let a = document.createElement('a')
					a:href = url
					a:target = 'blank'
					# sel.range.surroundContents(a)
					document.execCommand('createLink',yes,url)

		elif key:meta and key:b and isRich and key:text
				e.prevent
				document.execCommand('bold')
				# sel.surround(<b>)

		elif key:meta and key:i and isRich and key:text
				e.prevent
				document.execCommand('italic')
				# sel.surround(<i>)

		elif key:down
			if key:meta
				return call('movedown')
			if !sel or sel.atBottom
				return call('focusafter')

		elif key:up
			if key:meta
				return call('moveup')
			if !sel or sel.atTop
				return call('focusbefore')
					
		elif key:left
			unless key:textBefore
				return call('focusbefore')
		
		elif key:right
			if nextBlock and !key:textAfter
				return call('focusafter')

		elif key:del and !key:textBefore
			if !sel
				return call('del',key)
			else
				return call('delstart',key)

		elif key:enter
			e.prevent
			
			# isEmpty
			if plaintext:length == 0 and data:type != 'p'
				call('morph',serialize(type: 'p'))
			elif !key:textAfter or key:textAfter == '\n'
				call('addafter',{body: []})
			elif !key:textBefore
				call('addbefore')
			else
				let range = sel.range.cloneRange
				range.setEnd(body.dom,body.dom:childNodes:length)
				let contents = range.extractContents # cloneContents
				let fragment = serialize(
					body: Entity.serialize(contents:childNodes)
				)
				call('addafter',fragment)
				trigger('dirty')
		self
		
	def oninput e
		let text = e.event:data
		let sel = selection.serialize
		let typ = e.event:inputType or 'input'
		
		# unless @keydownSel
		# 	log "keydown did not happen here?!?",e,text
		# log 'oninput',e,text

		if text == '/'
			log sel
			showActionsMenu
			@completion = {
				start: sel:start - 1
				end: sel:end
				value: "/"
			}
		
		# input trigger for hr?

		if let c = @completion
			if typ.match(/delete/)
				c:end = sel:start
			else
				c:end = sel:start
			
			c:value = plaintext.slice(c:start,c:end)
			console.log 'completion',c:value,c
			
			if @menu
				@menu.query = c:value.slice(1)
				
			# if typ == 'deleteWordBackward'
			# 	yes
			# elif typ == 'deleteContentBackward'
			# 	yes

		# if @menu
		# 	# no room for selections?
		# 	@menu.query += text
	
	def clearCompletion
		if @completion
			range(@completion:start,@completion:end).deleteContents
			@completion = null
		self

	def onaction e, data
		let action = data:action
		let params = data:params
		log 'onaction',data
		if action == 'block'
			clearCompletion
			let block = params[0]
			console.log "adding block",block
			
			if block:type == 'hr'
				trigger('addbefore',block)
			# turn into?
			elif plaintext:length == 0
				trigger('morph',serialize(block))
			else
				trigger('addafter',block)
		self

	def showActionsMenu
		unless @menu
			let pos = selection.rect # range.getBoundingClientRect
			console.log "range!!!",pos
			uxa.open(@menu = <ActionsMenu[self] actions=Actions>, anchor: pos)
			# Imba.mount(@menu = <ActionsMenu[self] actions=Actions>)

	def serialize overrides = {}
		Object.assign({},data,{body: @body.serialize},overrides)
		
	def deserialize data
		@data = data
		render
		
	def edit
		@body.dom.focus

	def body
		<Content@body[data] editable=isEditable>
		
	# can contain links
	def render
		<self .{data:type}>
			body

tag H1Block < Block
	register 'h1', nodeType: 'h1'

tag H2Block < Block
	register 'h2', nodeType: 'h2'

tag H3Block < Block
	register 'h3', nodeType: 'h3'
	
tag PBlock < Block
	register 'p', nodeType: 'p'
	
	def ondelstart e
		let prev = prevBlock
		if prev and prev.matches('.CodeBlock')
			prev.focus
		else
			trigger('joinabove')

		e.stop
		
tag QuoteBlock < Block
	register 'quote', nodeType: 'blockquote'
	
tag HRBlock < Block
	register 'hr' # , nodeType: 'div', flag: 'hr'
	
	def serialize
		{type: 'hr'}
		
	def deserialize
		self
	
	def render
		<self.hr>
		
	def focus start = yes
		try
			if start
				nextBlock.select(0)
			else
				prevBlock.select(-1)
			
