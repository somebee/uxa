import Head from './views/head'
import Nav from './views/nav'
import Home from './views/home'
import Note from './views/note'
import Typography from './views/typography'

export tag App
	
	prop size default: 'md'
	prop tint default: 'light'
	
	def render
		<self .{size} .{tint}>
			<#head.masthead.lg.bar.base-bg.flat.dark>
				<.brand> "UXA"
				<.flexer>
				<select[size]>
					<option value='light'> "light"
					<option value='dark'> "dark"
					
				<select[size]>
					<option value='xs'> "xs"
					<option value='sm'> "sm"
					<option value='md'> "md"
					<option value='lg'> "lg"

				<a.tab route-to="/"> 'Home'
				<a.tab route-to="/typygraphy"> 'Typography'
				<a.tab route-to="/elements"> 'Elements'
				<a.tab route-to="/form"> 'Form'
				<a.tab route-to="/note"> 'Note'
			
			<Home route='/'>
			<Note route='/note'>
			<Typography route='/typygraphy'>
			# <#main>