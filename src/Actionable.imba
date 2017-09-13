
export tag Actionable
	
	prop action

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
			trigger(action,contextData)
			e.halt

		elif action isa Array
			trigger(action[0],action.slice(1))
			e.halt
		else
			e.@responder = null
		self