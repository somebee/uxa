import Stack from './Stack'
import Menu from './Menu'
import MenuItem from './MenuItem'
import Button,IconButton from './Button'
import TextField,TextArea,SelectField from './TextField'
import ListItem from './ListItem'
import Popover from './Popover'
import Dialog from './Dialog'
import Indicator from './Indicator'
import Form from './Form'
import Snackbar from './Snackbar'
import Tile from './Tile'
import Queue from './Queue'

var showdown  = require('showdown')
var mdconverter = showdown.Converter.new(noHeaderId: yes, tables: yes)

var MarkdownCache = {}
var SetterCache = {}

def mdclean md, out
	if md.indexOf('\n') == -1 and out.indexOf('<p>') == 0
		return out.slice(3,-4)
	else
		out

def md2html md
	MarkdownCache[md] ||= mdclean(md,mdconverter.makeHtml(md))
	
def toSetter key
	SetterCache[key] ||= Imba.toCamelCase('set-'+key)

class UXAWrapper
	
	prop md watch: yes
	
	def initialize owner
		@owner = owner
		@options = {}
		self
		
	def open component, options = {}
		Stack.show(component, @owner, options)

	def menu component
		self

	def confirm message
		var dialog = <Dialog markdown=message>
		open(dialog)

	def flash item, typ
		if item isa Error
			item = item:message
			typ = 'dark' # Error

		if item isa String
			item = <Snackbar .{typ or 'dark'} uxa:md=item>
		
		if item isa Snackbar
			open(item)
		self

	def set key, value
		self[toSetter(key)](value)
		
	def mdDidSet value
		@owner.dom:innerHTML = md2html(md)

	def queue
		@queue ||= Queue.new(@owner)


# hello
extend tag element
	
	def uxa
		@uxa ||= UXAWrapper.new(self)
		
	def uxaSetAttribute key,value
		uxa.set(key,value)
		
extend class Imba.Event

	def uxa
		target.uxa

export var UXA = UXAWrapper.new(null)
export var Button = Button
export var IconButton = IconButton
export var Menu = Menu
export var MenuItem = MenuItem
export var TextField = TextField
export var TextArea = TextArea
export var SelectField = SelectField
export var ListItem = ListItem
export var MenuItem = MenuItem
export var Popover = Popover
export var Dialog = Dialog
export var Form = Form
export var Indicator = Indicator
export var Snackbar = Snackbar
export var Tile = Tile

if $web$
	window.UXA = UXA
