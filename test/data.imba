
export var blocks = [
	{name: "Header", desc: "A large header with margin"}
	{name: "Sub Header", desc: "A smaller header"}
	{name: "Bulleted List", desc: "Create a simple bulleted list"}
	{name: "Numbered List", desc: "Create a list with numbering"}
]

export var md = """
	# Header
	
	## Sub Header
	
	Paragraph of text
	
	```imba
	var hello = 100
	```
"""

export var post = {
	markdown: md
	json: {
		type: 'root',
		body: [
			{type: 'h1', body: ["Header"]}
			{type: 'h2', body: ["Sub header"]}
			{type: 'code', language: "imba", body: ["var hello = 100"]}
			{type: 'p', body: ["Paragraph of text"]}
			{type: 'code', language: "imba", body: ["var hello = 100\nvar other = 200"]}
		]
	}
}

export var note = {type: 'root', body: [
	{type: 'h1', body: ["Heading 1"]}
	{type: 'h2', body: ["Heading 2"]}
	{type: 'p', body: ["A paragraph ",{type: 'b', body: ["bolded"]}," here"]}
	{type: 'code', body: ["var hello = 100"]}
	{type: 'p', body: ["A paragraph ",{type: 'b', body: ["bolded"]}," here"]}
	{type: 'code', language: "imba", body: ["var hello = 100\nvar other = 200"]}
]}