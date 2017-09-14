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
		var action = self.action

		if action isa String
			e.halt.silence
			trigger(action,contextData)
			
		elif action isa Array
			e.halt.silence
			trigger(action[0],action.slice(1))
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