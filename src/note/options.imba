export var Triggers = {
	'#': 'h1'
	'##': 'h2'
	'###': 'h3'
	'*': 'li'
	'-': 'li'
	'/code': 'code'
	'/js': {type: 'code', language: 'javascript'}
	'/imba': {type: 'code', language: 'imba'}
	'/html': {type: 'code', language: 'html'}
	'/css': {type: 'code', language: 'css'}
}

var Languages = {
	javascript: "JavaScript"
	imba: "Imba"
	html: "HTML"
	css: "CSS"
}

var Types = {}
var Presets = [{
	type: 'h1'
},{
	type: 'h2'
}]

export var STATE = {
	editable: false
}

export var Schema = {
	h1: {next: 'p'}
	h2: {next: 'p'}
	h3: {next: 'p'}
	li: {next: 'li'}
	code: {next: 'p'}
	default: {}
}

export var Actions = [
	{name: "Text", desc: "Plain text.", action: 'block', params: [{type: 'p'}]}
	{name: "Header", desc: "A large header with margin.", action: 'block', params: [{type: 'h1'}], shortcut: '#' }
	{name: "Sub Header", desc: "A smaller header", action: 'block', params: [{type: 'h2'}], shortcut: '##' }
	{name: "Bulleted List", desc: "Create a simple bulleted list", shortcut: '*', action: 'block', params: [{type: 'li'}] }
	{name: "Quote", desc: "Capture a quote.", action: 'block', params: [{type: 'quote'}]}
	{name: "Separator", desc: "Start new section.", action: 'block', params: [{type: 'hr'}]}

	{name: "Code", category: 'code', action: 'block', params: [{type: 'code',language: 'txt'}] }
	# {name: "JavaScript", action: 'block', params: [{type: 'code',language: 'javascript'}] }
	# {name: "Imba", action: 'block', params: [{type: 'code',language: 'imba'}] }
	# {name: "HTML", action: 'block', params: [{type: 'code',language: 'html'}] }
	# {name: "CSS", action: 'block', params: [{type: 'code',language: 'css'}] }
]

for key,val of Languages
	var action = {name: val, type: 'code', action: 'block', params: [{type: 'code',language: key}] }
	Actions.push(action)

Actions.map do |action|
	action:find = [action:name].join(' ').toLowerCase