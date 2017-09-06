import Stack from './Stack'
import Menu,MenuItem from './Menu'
import Button,IconButton from './Button'
import TextField from './TextField'
import ListItem from './ListItem'
import Popover from './Popover'
import Dialog from './Dialog'

var snarkdown = require 'snarkdown'

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

class UXA
	
	prop md watch: yes
	
	def initialize owner
		@owner = owner
		@options = {}
		self
		
	def open component
		Stack.show(component, @owner)
	
	def menu component
		self

	def confirm message
		var dialog = <Dialog markdown=message>
		open(dialog)
		
	def set key, value
		self[toSetter(key)](value)
		
	def mdDidSet value
		@owner.html = md2html(md)
		

# hello
extend tag element
	
	def uxa
		@uxa ||= UXA.new(self)
		
	def uxaSetAttribute key,value
		uxa.set(key,value)
		
export var Button = Button
export var IconButton = IconButton
export var Menu = Menu
export var TextField = TextField
export var ListItem = ListItem
export var MenuItem = MenuItem
export var Popover = Popover
export var Dialog = Dialog