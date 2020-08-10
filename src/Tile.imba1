import IconButton from './Button'

export tag Tile
	
	# list of actions [ [action, icon], ... ]
	prop actions
	prop md default: "# Hello\n## Subtitle\nSome random text right here"

	def main
		<@main>
			<.actions> <IconButton icon='*'>
			<span.p1 uxa:md=md>
					
		
	def footer
		<@footer>
			<.p1> "By Some author"
			<.c1> "This is the footer"
	
	def render
		<self>
			main
			footer