import Icon from './Icon'

export tag ListItem
	prop icon
	prop right-icon
	prop label
	prop subtext
	
	def render
		<self>
			<.gutter>
				if icon
					<Icon[icon].left>
			<div.main>
				if label
					<.text uxa-markdown=label>
				if subtext
					<.subtext.muted uxa-markdown=subtext>
			if right-icon
				<Icon[right-icon].right>
			