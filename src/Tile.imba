
export tag Tile
	
	# list of actions [ [action, icon], ... ]
	prop actions
	prop md default: "# Hello\n## Subtitle\nSome random text right here"

	def main
		<@main uxa:md=md>
		
	def footer
		<@footer> "This is the footer"
	
	def render
		<self>
			main
			footer