
export tag Form < form

	prop formData watch: yes

	def formDataDidSet data
		applyFormData(data) if @commited

	def loadFormData
		applyFormData(@formData) if @formData

	def commit
		super
		if !@commited
			loadFormData
			@commited = yes
		self

	def formElements
		var o = []

		for field in dom:elements
			let node = field # field.@tag
			let name = field:name

			if name
				o.push(node)

			if o[name]
				o[name] = [o[name]] unless o[name] isa Array
				o[name].push(node)
			else
				o[name] = node
		return o
	
	def applyFormData dict = {}
		var fields = formElements

		for field in fields
			let typ = field:type
			let val = dict[field:name]
			console.log "apply",field:name,val,typ

			continue if val == undefined

			if typ == 'radio' or typ == 'checked'
				field:checked = field:value == val
			else
				if field.@tag
					field.@tag.setValue(val)
				else
					field:value = val
		self
		
	def formData
		var o = {}
		for field in dom:elements
			if field:type == 'checkbox'
				continue unless field:checked
			elif field:type == 'radio'
				continue unless field:checked
			if field:name
				o[field:name] = (field.@tag and field.@tag:value ? field.@tag.value : field:value)
		return o

	def onuxabusy e
		e.halt
		flag('uxa-busy')

	def onuxaidle e
		e.halt
		setTimeout(&,200) do unflag('uxa-busy')
		