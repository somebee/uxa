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
	{name: "Code", action: 'block', params: [{type: 'code',language: 'txt'}] }
	{name: "JavaScript", action: 'block', params: [{type: 'code',language: 'javascript'}] }
	{name: "Imba", action: 'block', params: [{type: 'code',language: 'imba'}] }
	{name: "HTML", action: 'block', params: [{type: 'code',language: 'html'}] }
	{name: "CSS", action: 'block', params: [{type: 'code',language: 'css'}] }
]

Actions.map do |action|
	action:find = [action:name,action:desc or ''].join(' ').toLowerCase