
export tag Form < form

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
	
	def setFormData dict = {}
		var fields = formElements

		for field in fields
			let typ = field:type
			let val = dict[field:name]

			continue if val == undefined

			if typ == 'radio' or typ == 'checked'
				field:checked = field:value == val
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
				o[field:name] = (field.@tag ? field.@tag.value : field:value)
		return o