
export tag TextField
	prop label
	prop desc
	prop multiline
	
	['disabled','placeholder','type','name','value','required','pattern','minlength','maxlength','autocomplete'].map do |key|
		var setter = Imba.toCamelCase("set-{key}")
		self:prototype[key] = do |val| this.input[key]()
		self:prototype[setter] = do |val|
			this.input[setter](val)
			return this

	def input
		<input@input placeholder=" " type='text'>
	
	def render
		<self.uxa>
			input
			<span.after>
			<hr.static>
			<hr.anim>
			<label> label
			<span.helper.desc data-desc=desc> desc



tag TextAreaProxy < textarea
	prop owner

	def onfocus e
		# console.log 'TextAreaProxy.onfocus',e
		owner.dom.focus
		
	def oninput e
		owner.dom:innerText = dom:value
		owner.dom.focus

tag Editable
	attr placeholder
	attr minlength
	attr maxlength
	attr required
	attr name

	def build
		tabindex = 0
		try
			dom:contentEditable = "plaintext-only"
		catch e
			dom:contentEditable = true

		@raw = <TextAreaProxy.input owner=self tabindex="-1">
		@raw:setValue = do |value| setValue(value)
		self
		
	def raw
		@raw
	
	def setAttribute key, value
		# console.log "Editable.setAttribute",key,value
		raw.setAttribute(key,value) if @raw
		super
		self
		
	def setValue value
		dom:innerText = value
		raw.dom:value = value
		self
		
	def value
		dom:innerText
		
	def oninput
		raw.dom:value = value
		self

export tag TextArea < TextField

	def input
		<Editable@input>
		
	def render
		<self.uxa>
			input.raw
			input
			<span.after>
			<hr.static>
			<hr.anim>
			<label> label
			<span.helper.desc data-desc=desc> desc
			
export tag SelectField < TextField

	def options= val
		var input = self.input
		<select@input>
			for item in val
				<option value=item[0]> item[1] or item[0]
		self
	
	def input
		<select@input>