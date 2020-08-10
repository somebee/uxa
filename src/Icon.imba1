
export tag Icon < i
	prop data watch: yes

	def build
		flag('uxa')
	
	def dataDidSet icon
		# console.log "Icon#dataDidSet",icon
		if icon isa String
			if icon.len == 1 # and "xwvo*-=+><:.^".indexOf(icon) >= 0
				text = icon
			elif icon.indexOf('<svg') >= 0
				flag('svg')
				dom:innerHTML = icon
		self