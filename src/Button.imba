import Icon from './Icon'

export tag Button < button
	prop icon
	prop label
	prop uxa-anchor


	def ontap e
		e.halt
		if self[:onmenu]
			var menu = onmenu(e)
			if menu
				uxa.open(menu)
		self


	def render
		<self.uxa>
			if icon
				<Icon[icon]>
			if label
				<b uxa:md=label>
			
export tag IconButton < Button