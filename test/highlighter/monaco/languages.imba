# add javascript as well

export var imba = {
	id: 'imba'
	extensions: ['.imba']
	aliases: ['Imba', 'imba']
	mimetypes: ['application/imba']
	language: require('./imba')
}

export var ruby = {
	id: 'ruby'
	extensions: ['.rb', '.rbx', '.rjs', '.gemspec', '.pp'],
	filenames: ['rakefile'],
	aliases: ['Ruby', 'rb'],
	language: require('./ruby')
}

export var javascript = {
	id: 'javascript'
	extensions: ['.js', '.jsx'],
	aliases: ['JavaScript', 'js'],
	mimetypes: ['text/javascript','application/javascript'],
	language: require('./javascript')
}

export var css = {
	id: 'css',
	extensions: ['.css','.scss'],
	aliases: ['CSS', 'css'],
	mimetypes: ['text/css'],
	language: require('./css')
}

export var python = {
	id: 'python',
	extensions: ['.py', '.rpy', '.pyw', '.cpy', '.gyp', '.gypi'],
	aliases: ['Python', 'py'],
	firstLine: '^#!/.*\\bpython[0-9.-]*\\b',
	language: require('./python')
}

export var html = {
	id: 'html',
	extensions: ['.html', '.htm', '.shtml', '.xhtml', '.mdoc', '.jsp', '.asp', '.aspx', '.jshtm'],
	aliases: ['HTML', 'htm', 'html', 'xhtml'],
	mimetypes: ['text/html', 'text/x-jshtm', 'text/template', 'text/ng-template'],
	language: require('./html')
}

export var less = {
	id: 'less',
	extensions: ['.less'],
	aliases: ['Less', 'less'],
	mimetypes: ['text/x-less', 'text/less'],	
	language: require('./less')
}

export var xml = {
	id: 'xml',
	extensions: ['.xml', '.dtd', '.ascx', '.csproj', '.config', '.wxi', '.wxl', '.wxs', '.xaml', '.svg', '.svgz'],
	firstLine: '(\\<\\?xml.*)|(\\<svg)|(\\<\\!doctype\\s+svg)',
	aliases: ['XML', 'xml'],
	mimetypes: ['text/xml', 'application/xml', 'application/xaml+xml', 'application/xml-dtd'],
	language: require('./xml')
}

export var java = {
	id: 'java',
	extensions: ['.java', '.jav'],
	aliases: ['Java', 'java'],
	mimetypes: ['text/x-java-source', 'text/x-java'],
	language: require('./java')
}