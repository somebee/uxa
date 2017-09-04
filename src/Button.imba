import Icon from './Icon'

export tag Button < button
	prop icon
	prop label
	prop uxa-anchor

	def render
		<self.button>
			if icon
				<Icon[icon]>
			if label
				<b uxa-markdown=label>
			
export tag IconButton < Button