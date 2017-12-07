import Stack from './Stack'
import Menu from './Menu'
import MenuItem from './MenuItem'
import Button,IconButton,LinkButton from './Button'
import TextField,TextArea,SelectField from './TextField'
import ListItem from './ListItem'
import Popover from './Popover'
import Dialog from './Dialog'
import Indicator from './Indicator'
import Form from './Form'
import Snackbar from './Snackbar'
import Tile from './Tile'
import Icon from './Icon'
import Queue from './Queue'
import Actionable from './Actionable'

var marked = require('marked')
# var mdconverter = showdown.Converter.new(noHeaderId: yes, tables: yes)

var MarkdownCache = {}
var SetterCache = {}

def mdclean md, out
	if md.indexOf('\n') == -1 and out.indexOf('<p>') == 0
		return out.slice(3,out.lastIndexOf('</p>'))
	else
		out

def md2html md
	MarkdownCache[md] ||= mdclean(md,marked(md))
	
def toSetter key
	SetterCache[key] ||= Imba.toCamelCase('set-'+key)

var ActionHandler = do |e|
	let target = this
	let action = target.uxa.action
	
	if action
		target.trigger("uxa:action",action)

	if action isa String
		e.halt.silence
		target.trigger(action,target.uxa.contextData)
	elif action isa Array
		e.halt.silence
		target.trigger(action[0],action.slice(1))
	elif action isa Function
		e.halt.silence
		action.call(target,e)
	else
		e.@responder = null

class UXAWrapper
	
	prop md watch: yes
	prop action watch: yes
	
	def initialize owner
		@owner = owner
		@options = {}
		self
		
	def open component, options = {}
		Stack.show(component, @owner, options)

	def menu component
		self

	def confirm message
		Promise.new do |resolve,reject|
			var ok = do resolve(yes)
			var cancel = do resolve(no)
			var dialog = <Dialog :uxadismiss=cancel :uxasubmit=ok> <span uxa:md=message>
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
		@owner.dom:innerHTML = md2html(value)
		
	def actionDidSet action, prev
		@owner:ontap = ActionHandler
		self
		
	def contextData
		var data = null
		var el = @owner
		while el
			if data = el.data
				return data
			el = el.parent
		return null

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
export var LinkButton = LinkButton
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
export var Icon = Icon
export var Actionable = Actionable

if $web$
	window.UXA = UXA
