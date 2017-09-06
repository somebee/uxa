import Icon from './Icon'

export tag Button < button
	prop icon
	prop label
	prop uxa-anchor

	def ontap e
		if self[:onmenu]
			e.halt
			var menu = onmenu(e)
			if menu
				uxa.open(menu)
		else
			# Imba hack
			e.@responder = null
		self


	def render
		<self.uxa>
			if icon
				<Icon[icon]>
			if label
				<b uxa:md=label>
			
export tag IconButton < Button