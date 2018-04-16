import fuzzyMatch from '../util'

import Menu from '../../Menu'

export tag ActionsMenu < Menu

	prop actions
	prop query default: "", watch: yes
	prop activeIndex default: 0

	def onkeydown e,o
		# log 'ActionsMenu.onkeydown',e,o,o:selection
		if o:down
			activeIndex++
			e.stop.prevent
		elif o:up
			activeIndex -= 1
			e.stop.prevent
		elif o:left or o:right
			hide
		# otherwise - search?
		elif o:enter
			let action = filtered[activeIndex]
			log 'trigger action',action
			e.stop.prevent
			data.trigger('action',action)
			hide
		render
		self
		
	def filtered
		@filtered or actions

	def queryDidSet query
		let q = query.toLowerCase
		@matcher = do |item| fuzzyMatch(q,item:find)
		@filtered = actions.filter(@matcher)
		activeIndex = 0
		render
		self

	def match item
		@matcher ? @matcher(item) : yes
		
	def unmount
		if data
			data.@menu = null
			data.@completion = null
		self
	
	def hide
		# data.@menu = null
		# data.@completion = null
		trigger('uxahide')
		# data.@menu = null
		# data.@completion = null
		# orphanize

	def render
		let ai = activeIndex + 1
		let i = 0
		<self.menu>
			<.header> "Blocks"
			for action in actions when match(action)
				<.item.double .hover=(++i == ai) data-shortcut=action:shortcut> <.body>
					<.name> action:name
					<.legend> action:desc