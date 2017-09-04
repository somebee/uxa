
export tag TextField
	prop label
	prop desc
	
	['disabled','placeholder'].map do |key|
		var setter = Imba.toCamelCase("set-{key}")
		self:prototype[key] = do |val| this.input[key]()
		self:prototype[setter] = do |val|
			this.input[setter](val)
			return this
	
	def input
		<input@input type='text' required=yes pattern="Sindre" placeholder=" ">
	
	def render
		<self.textfield>
			input
			<span.bar>
			<label> label
			<span.helper.desc data-desc=desc> desc