
tag Editable
	attr placeholder default: " "
	
	def atStartModifier
		if let sel = selection
			if sel:isCollapsed and sel:baseOffset == 0
				return true
		return false

	def build
		tabindex = 0
		dom:textContent = ""

		try
			dom:contentEditable = "plaintext-only"
		catch e
			dom:contentEditable = true
			
		<self
			:keydown.left.atStart.stop.focusPrev
			:keydown.del.atStart.stop.focusPrev
			:keydown.enter.stop.prevent.submit>
		
	def focusPrev
		try dom:previousElementSibling.focus
		
	def value
		dom:innerText or ""
		
	def selection
		var sel = window.getSelection
		return null unless sel and dom.contains(sel:anchorNode)
		return sel
		
	def oninput e
		log 'input',e
		
	def onkeydown e
		e.stop
	
	def clear
		dom:textContent = ""
		self

	def submit
		let e = trigger('add',value)
		log 'submitted',e
		unless e.isPrevented
			clear
			
	def render
		flagIf('empty',value.trim == "")

tag Value
	prop index
	
	def build
		tabindex = -1

	def gotoNext
		try dom:nextElementSibling.focus
		self
		
	def gotoPrev
		try dom:previousElementSibling.focus
		self
		
	def removeItem
		let next = dom:nextElementSibling
		# dom:previousElementSibling ? gotoPrev : gotoNext
		gotoNext if next and next.matches('.Editable')
		trigger('remove',index: index)

	def render
		<self data-value=data :keydown.left.gotoPrev :keydown.right.prevent.gotoNext  :keydown.del.prevent.removeItem>
			<span.value> data

export tag TagInput
	
	prop pattern
	prop formatter
	prop placeholder default: "Add..."
	prop minlength default: 0
	prop maxlength default: 0
	
	def build
		@values = ['one','two']
		
	def bindData data, key, args
		@proxy = [data,key,args]
		self

	def values
		if @proxy
			let val = @proxy[0][@proxy[1]] ||= []
			return @proxy[2] ? val.apply(@proxy[0],@proxy[2]) : val
		else
			@values
	
	def onadd e, value
		var values = self.values
		var val = @formatter ? @formatter(value or '',values) : value
		
		if maxlength and values:length >= maxlength
			return self

		unless values.indexOf(val) >= 0
			values.push(val)
		e.stop

	def onremove e, index: null
		if index != null
			values.splice(index,1)
		self

	def render
		<self>
			for value,i in values
				<Value[value] index=i>
			<Editable placeholder=placeholder>