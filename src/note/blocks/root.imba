import Block from './base'

export tag Root
	prop editable default: false, watch: yes
	prop value watch: yes
	prop data watch: yes
	prop format default: 'json' # what about markdown?
	
	def build
		flag('uxa-note')

	def clear
		while dom:firstChild
			dom:removeChild(dom:firstChild)
		self

	def render
		self

	def rerender
		for item,i in children
			item.render
		self

	def setup
		deserialize(@data || {})
		@setup = yes
		@history = []
		@redo = []
		@mutations = []
		self

	def dataDidSet data
		@history = []
		@redo = []
		deserialize(data) if data and @setup

	def editableDidSet bool, prev
		deserialize(@data) if @setup # hmm

		if $web$
			if bool
				@observer ||= MutationObserver.new do |muts|
					trigger('mutated',muts) if @setup
				@observer.observe(dom, {childList: true, subtree: true, characterData: true})
			elif @observer
				@observer.disconnect
		self

	def serialize overrides = {}
		var params = {body: []}
		for item,i in children
			params:body.push(item.serialize)
			if i == 0
				params:title = item.plaintext
		Object.assign({},data,params,overrides)

	def block data
		Block.deserialize(data,self)

	def deserialize data = {}
		clear
		data:type = 'root'
		data:body ||= []

		flag('editable',editable)

		if data:body:length == 0
			data:body.push({type: 'p', body: []})

		@value = value

		for item in data:body
			dom.appendChild Block.deserialize(item,self).dom

		@observer.takeRecords if @observer
		deserializeCaret(data:caret) if data:caret
		return self

	def serializeCaret
		# adhoc
		var focus = document:activeElement
		var block = focus and focus.closest('.Block')
		let sel = {block: []:indexOf.call(@dom:children,block)}
		try Object.assign(sel,block.@tag.selection.serialize)
		return sel

	def deserializeCaret caret
		if let block = dom:children[caret:block]
			block.@tag.select(caret:start,caret:start + caret:length)
		return self


	def markHistoryEntry force = no
		var time = Date.now
		var prev = @history[0]
		var delta = prev ? (time - prev:ts) : 0

		var snapshot = serialize
		snapshot:caret = serializeCaret
		snapshot:ts = time

		if force or !prev or delta > 400 or !@history[1]
			@history.unshift(snapshot) # :length = @historyIndex
		else
			@history[0] = snapshot
		@redo = []
		@mutations = []
		# log 'mark',snapshot
		self

	def onselectstart e
		# log 'onselectstart',e
		unless @history[0]
			setTimeout(&,50) do markHistoryEntry(yes)

	def onmutated e, muts
		@mutations = @mutations.concat(muts)
		clearTimeout(@mutator)
		@mutator = setTimeout(&,30) do markHistoryEntry

	def onundo e
		let state = @history.shift
		console.log "undo state",@history[0]
		if let prev = @history[0]
			@redo.unshift(state)
			deserialize(prev)
		else
			# at first state in history
			@history.unshift(state)
		self

	def onredo e
		log 'redo'
		if let state = @redo.shift
			@history.unshift(state)
			deserialize(state)
		self


	# onchange
	# update the value