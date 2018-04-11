import Button,IconButton,TextField,ListItem,Menu,MenuItem,Popover,Dialog from 'uxa'

export tag Head
	def render
		<self.masthead.lg.bar.base-bg.flat>
			<.brand> "Scrimba"
			<.flexer>
			<a.tab href="#forms"> 'forms'
			<a.tab.active href="#articles"> 'articles'
			<a.tab href="#panels"> 'panels'
			<a.tab href="#alerts"> 'alerts'
			<a.tab href="#buttons"> 'buttons'
			# <Button.primary :tap='showCreate' label='create'>
			# <Button@avatar.primary :tap='menu' label='profile'>
			# <IconButton.primary :tap='showMenu2' icon=':' uxa-anchor=[1,1,1,1]>
			
	def menu
		log "tap menu!",self
		@avatar.uxa.open <Popover.list.inset>
			# <ListItem.header label='Sindre Aarsaether' subtext='hello@scrimba.com'>
			# <ListItem label='Profile photo' subtext='Change your profile photo'>
			<hr.sm>
			<Menu.inset>
				<MenuItem icon='w' label='Open'>
				<MenuItem icon='v' label='Paste in place'>
				<MenuItem icon='v' label='Research'>
				<MenuItem icon='.' label='Go to site...'>
				<hr.sm>
				<MenuItem.pos icon='>' label='Home'>
				<MenuItem.pri icon='>' label='Back'>
				<MenuItem.neg icon='>' label='Sign out' disabled=yes>

			# <Button label="My channel">
			# <Button label="Sign out">
			# <Button label="Settings">
			# <Button label="Help">
			# <hr>
			# <Button label="Come back">
		self
		
	def showMenu2 e
		e.target.uxa.open <Menu.inset.paper>
			<MenuItem icon='w' label='Open'>
			<MenuItem icon='v' label='Paste in place'>
			<MenuItem icon='v' label='Research'>
			<MenuItem label='Go to site...'>
			<hr.sm>
			<MenuItem.pos icon='>' label='Home'>
			<MenuItem.pri icon='>' label='Back'>
			<MenuItem.neg icon='>' label='Sign out' disabled=yes>
		
	def showCreate e
		e.target.uxa.open <Dialog submitLabel='archive'>
			<h2> "Create new screencast"
			<p> "Some basic text explaining this dialog right here."
			<TextField label='Title'>
			<TextField label='Last name'>
	