
export tag Field
	prop label
	prop desc
	prop multiline
	
	['disabled','placeholder','type','name','value','required','pattern','minlength','maxlength','autocomplete','formatter','autofocus'].map do |key|
		var setter = Imba.toCamelCase("set-{key}")
		self:prototype[key] = do |val| this.input[key]()
		self:prototype[setter] = do |val|
			if key == 'type'
				this.setFlag('type',val)
			this.input[setter](val)
			return this
			
	def bindData target, path, args
		input.bindData(target,path,args)
		return self

	def input
		<input@input placeholder=" " type='text'>
	
	def render
		<self.field .has-label=(!!label)>
			input
			if label
				<label> label
			<hr>
			<.help.desc> desc

import TagInput from './TagInput'

export tag TextField < Field

export tag TagField < Field
	
	def input
		<TagInput@in>


tag TextAreaProxy < textarea
	prop owner

	def onfocus e
		owner.dom.focus

tag Editable
	attr placeholder
	attr minlength
	attr maxlength
	attr required
	attr name
	attr autofocus

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
		if !@syncing and dom:innerText != value
			dom:innerText = value
		raw.dom:value = value
		self
		
	def value
		dom:innerText
		
	def oninput e
		e.stop
		raw.dom:value = value
		@syncing = yes
		raw.oninput(e)
		@syncing = no
		self
	
	def commit
		if @raw.@data
			let val = @raw.@data.getFormValue(@raw)
			if val != @proxyVal
				setValue(@proxyVal = val)
		self

export tag TextArea < Field

	def input
		<Editable@input>
		
	def bindData target, path, args
		input.raw.bindData(target,path,args)
		return self
		
	def oninput e
		input.setValue(input.raw.value)
		e.stop

	def render
		<self.field .has-label=(!!label)>
			input.raw
			@input
			if label
				<label> label
			<hr>
			<.help.desc> desc

export tag CheckBox < Field
	
	prop content

	def input
		<input@input type='checkbox'>

	def bindData target, path, args
		(@input or input).bindData(target,path,args)
		return self

	def render
		<self.field>
			input
			@content


export tag SelectField < Field

	def options= val
		var input = self.input
		<select@input>
			for item in val
				<option value=item[0]> item[1] or item[0]
		self
	
	def input
		<select@input>