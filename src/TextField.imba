
export tag TextField
	prop label
	prop desc
	
	['disabled','placeholder','type','name','value','required','pattern'].map do |key|
		var setter = Imba.toCamelCase("set-{key}")
		self:prototype[key] = do |val| this.input[key]()
		self:prototype[setter] = do |val|
			this.input[setter](val)
			return this
	
	def input
		<input@input type='text'>
	
	def render
		<self.textfield>
			input
			<span.bar>
			<label> label
			<span.helper.desc data-desc=desc> desc