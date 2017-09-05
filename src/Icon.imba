
export tag Icon < i
	prop data watch: yes
	
	def dataDidSet icon
		# console.log "Icon#dataDidSet",icon
		if icon isa String and icon.len == 1 and "xwvo*-=+><:.^".indexOf(icon) >= 0
			text = icon
			
	# def build
	#	<self> <i>
		