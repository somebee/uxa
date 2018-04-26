import {Note as Article} from '../../src/note/index'
import note from '../data'

export tag Note
	
	def render
		<self>
			<.container.narrow>
				<div> "Hello there"
				<hr>
				<Article[note] editable=yes>