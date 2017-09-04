import Stack from './Stack'
import Menu,MenuItem from './Menu'
import Button,IconButton from './Button'
import TextField from './TextField'
import ListItem from './ListItem'
import Popover from './Popover'

var snarkdown = require 'snarkdown'

var MarkdownCache = {}

class UXA
	
	def initialize owner
		@owner = owner
		self
		
	def open component
		Stack.show(component, @owner)
	
	def menu component
		self
		
	def md str
		MarkdownCache[str] ||= snarkdown(str)

# hello
extend tag element
	
	def uxa
		@uxa ||= UXA.new(self)
	
	prop uxa-markdown watch: yes
	
	def uxaMarkdownDidSet text
		dom:innerHTML = uxa.md(text)
		
export var Button = Button
export var IconButton = IconButton
export var Menu = Menu
export var TextField = TextField
export var ListItem = ListItem
export var MenuItem = MenuItem
export var Popover = Popover