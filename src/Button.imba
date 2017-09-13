import Icon from './Icon'

export tag Button < button

	prop action
	prop icon
	prop label
	prop href
	prop uxa-anchor

	def contextData
		var data = null
		var el = self
		while el
			if data = el.data
				return data
			el = el.parent
		return null

	def ontap e
		if self[:onmenu]
			e.halt
			var menu = onmenu(e)
			if menu
				uxa.open(menu)
			return

		var action = self.action

		if action isa String
			# find closest data
			trigger(action,contextData)
			e.halt

		elif action isa Array
			trigger(action[0],action.slice(1))
			e.halt
		else
			e.@responder = null
		self

	def render
		<self.uxa>
			if icon
				<Icon[icon]>
			if label
				if href
					<b> <a href=href uxa:md=label>
				else
					<b uxa:md=label>
			
export tag IconButton < Button