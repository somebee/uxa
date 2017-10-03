
export tag TextField
	prop label
	prop desc
	prop multiline
	
	['disabled','placeholder','type','name','value','required','pattern','minlength','maxlength'].map do |key|
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
	
	def onfocus e
		# console.log 'TextAreaProxy.onfocus',e
		data.dom.focus
		
	def oninput e
		data.dom:innerText = dom:value
		data.dom.focus

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

		@raw = <TextAreaProxy[self].input tabindex="-1">
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
		# console.log "set options(!)",val
		var input = self.input
		# hacky
		<select@input>
			for item in val
				<option value=item[0]> item[1] or item[0]
				# input.dom.appendChild(opt.dom)
		self
	
	def input
		<select@input>
		# 	<option> "First option"
		# 	<option> "Second option"