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
					<.text uxa:md=label>
				if subtext
					<.subtext.muted uxa:md=subtext>
			if right-icon
				<Icon[right-icon].right>
			