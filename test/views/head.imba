import Button,IconButton,TextField,ListItem,Menu,MenuItem,Popover from 'uxa'

export tag Head
	def render
		<self.header.lg.bar.base-bg.flat>
			<.masthead> "Scrimba"
			<a href="#forms"> 'forms'
			<a href="#articles"> 'articles'
			<a href="#panels"> 'panels'
			<a href="#alerts"> 'alerts'
			<a href="#buttons"> 'buttons'
			<Button.primary :tap='showCreate' label='create'>
			<Button@avatar.primary :tap='menu' label='profile'>
			<IconButton.primary :tap='showMenu2' icon=':' uxa-anchor=[1,1,1,1]>
			
	def menu
		log "tap menu!",self
		@avatar.uxa.open <Popover.list.inset>
			<ListItem.header label='Sindre Aarsaether' subtext='hello@scrimba.com'>
			<ListItem label='Profile photo' subtext='Change your profile photo'>
			<ListItem label='Sign out'>
			<hr.sm>

			<Menu.inset>
				<MenuItem icon='w' label='Open'>
				<MenuItem icon='v' label='Paste in place'>
				<MenuItem icon='v' label='Research'>
				<MenuItem label='Go to site...'>
				<hr.sm>
				<MenuItem icon='>' label='Home'>
				<MenuItem icon='>' label='Back'>
				<MenuItem icon='>' label='Sign out' disabled=yes>

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
			<MenuItem icon='>' label='Home'>
			<MenuItem icon='>' label='Back'>
			<MenuItem icon='>' label='Sign out' disabled=yes>
		
	def showCreate e
		e.target.uxa.open <div.dialog>
			<section>
				<h2> "Create new screencast"
				<hr>
				<TextField label='Title'>
				<TextField label='Last name'>

			<footer.flat>
				<Button.muted label="dismiss" icon='x'>
				<Button.primary label="archive" icon='v'>
		