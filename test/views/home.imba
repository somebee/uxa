var mdart = require '!raw-loader!../md/article.md'

export tag Home

	def render
		<self>
			<div.section markdown=mdart> 