import Icon from './Icon'

export tag Button < button

	prop action
	prop icon
	prop label
	prop href
	prop uxa-anchor

	def build
		# buttons should be of type button by default
		dom.setAttribute('type','button')

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

		if action
			trigger("uxa:action",action)

		if action isa String
			e.halt.silence
			trigger(action,contextData)
			
		elif action isa Array
			e.halt.silence
			trigger(action[0],action.slice(1))
		else
			e.@responder = null
		self
	
	# by default we want to capture the touch fully
	def ontouchstart t
		flag('_touch')
	
	def ontouchend
		unflag('_touch')
	
	def ontouchcancel
		unflag('_touch')
		
	def render
		<self.button>
			if icon
				<Icon[icon]>
			if label
				if href
					<b> <a href=href uxa:md=label>
				else
					<b uxa:md=label>
			
export tag IconButton < Button