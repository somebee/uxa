import Icon from './Icon'

export tag MenuItem < a
	prop action
	prop icon
	prop right-icon
	prop label
	prop subtext
	attr disabled

	def ontap e
		if href
			trigger('uxa:hide')
			return super(e)

		e.cancel.halt

		var action = self.action

		if action isa String
			action = [action,closest('.Menu').data]
		if action isa Array
			trigger(action[0],action.slice(1))
		else
			trigger('activate')

		trigger('uxa:hide')

	def render
		<self>
			if icon
				<Icon[icon].left>
			if label
				<.text uxa:md=label>
			if subtext
				<.subtext.muted uxa:md=subtext>
			if right-icon
				<Icon[right-icon].right>
			