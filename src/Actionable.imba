
export tag Actionable
	
	@flagName = null

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
			e.halt.silence
			trigger(action,contextData)
			
		elif action isa Array
			e.halt.silence
			trigger(action[0],action.slice(1))
		else
			e.@responder = null
		self