import Icon from './Icon'

export tag Menu

export tag MenuItem
	prop icon
	prop right-icon
	prop label
	prop subtext
	attr disabled
	
	def render
		<self>
			if icon
				<Icon[icon].left>
			if label
				<.text uxa-markdown=label>
			if subtext
				<.subtext.muted uxa-markdown=subtext>
			if right-icon
				<Icon[right-icon].right>
			