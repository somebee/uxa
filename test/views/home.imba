var mdart = require '!raw-loader!../md/article.md'

import Button,TextField from 'uxa'

export tag Home

	def render
		<self>
			<div.section markdown=mdart> 
			<TextField label="Something" placeholder="Nothing to see">