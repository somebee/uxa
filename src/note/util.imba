var keyCodes = {
	esc: 27,
	tab: 9,
	enter: 13,
	space: 32,
	up: 38,
	down: 40
	left: 37
	right: 39
}

var KeyMap =
	9: 'tab'
	13: 'enter'
	32: 'space'
	38: 'up'
	40: 'down'
	37: 'left'
	39: 'right'
	8: 'del'
	46: 'del'

import Triggers from './options'

export def eventKeys e
	# var Keys = do |e|
	var obj = {}
	var str = KeyMap[e.keyCode]
	var chr = String.fromCharCode(e.keyCode) or ""
	obj[str] = yes if str
	obj:meta = yes if e.event:metaKey
	obj:shift = yes if e.event:shiftKey
	obj:ctrl = yes if e.event:ctrlKey
	obj:alt = yes if e.event:altKey
	obj[chr] = yes
	obj[chr.toLowerCase] = yes
	return obj
	
export def fuzzyMatch needle, haystack
	var nl = needle:length
	# var hl = haystack:length
	var idx = 0
	var ni = 0
	while ni < nl
		let chr = needle[ni++]
		idx = haystack.indexOf(chr,idx)
		# idx = haystack.indexOf(chr,idx)
		return false if idx == -1
	
	return true

export class ComposeurRange

export class Sel
	prop raw
	def initialize root, raw = window.getSelection
		@root = root
		@raw = raw
		
	def range
		@raw.getRangeAt(0)
	
	def prefix
		let range = range.cloneRange
		range.collapse
		range.setStart(@root,0)
		range.toString
	
	def postfix
		let range = range.cloneRange
		range.collapse(no)
		range.setEnd(@root,@root:childNodes:length)
		range.toString

	def surround node
		if node isa String
			node = document.createElement(node)
		elif node isa Imba.Tag
			node = node.dom

		range.surroundContents(node)
		
		raw.removeAllRanges # remove any selections already made
		var r2 = Range.new
		r2.selectNodeContents(node)
		raw.addRange(r2)
		return self
		
	def start
		return prefix:length
		
	def atStart
		return raw:isCollapsed and start == 0
		
	def atEnd
		return raw:isCollapsed and postfix:length == 0

	def atTop
		var bounds = range.getBoundingClientRect
		var box = @root.getBoundingClientRect
		Math.abs(box:top - bounds:top) < 6 or atStart
		
	def atBottom
		var bounds = range.getBoundingClientRect
		var box = @root.getBoundingClientRect
		Math.abs(box:bottom - bounds:bottom) < 6 or atEnd
		
	def insert content
		if content isa String
			content = document.createTextNode(content)
		
		var range = range
		range.insertNode(content)
		return range
		
	def serialize
		{
			start: start
			length: raw.toString:length
			text: raw.toString
			before: prefix
			after: postfix
		}

	def self.setCaret element, offset
		var range = document.createRange # //Create a range (a range is a like the selection but invisible)
		range.selectNodeContents(element.@dom or element) # Select the entire contents of the element with the range
		range.collapse(offset == -1 ? false : true) # collapse the range to the end point. false means collapse to end rather than the start
		var selection = window.getSelection # get the selection object (allows you to change selection)
		selection.removeAllRanges # remove any selections already made
		selection.addRange(range) # make the range you have just created the visible selection
		return selection
		
	def self.range node, start, end, range
		if start < 0
			start = Math.max(node:textContent:length + (start + 1),0)

		if end == undefined
			end = start
		
		if end < 0
			end = Math.max(node:textContent:length + (end + 1),0)
			
		# console.log "range",node,start,end,node:textContent:length
			
		var range = document.createRange
		var walk = document.createTreeWalker(node,NodeFilter.SHOW_TEXT)
		var text
		var currOffset = 0
		var starter
		var ender
		var prevNode
		
		if start == 0
			range.setStart(node,0)

		while text = walk.nextNode
			prevNode = text
			let textStart = currOffset
			let textEnd = textStart + text:length
			currOffset += text:length			

			if start >= textStart and start <= textEnd
				# console.log "inside text",text
				range.setStart(starter = text,start - textStart)
			
			if end >= textStart and end < textEnd
				range.setEnd(ender = text,end - textStart)
				break
		
		if !ender and prevNode
			# console.log "no ender",prevNode
			range.setEnd(prevNode,prevNode:length)
		return range
		
	def self.select node, start, end
		var range = Sel.range(node,start,end)
		var selection = window.getSelection # get the selection object (allows you to change selection)
		selection.removeAllRanges # remove any selections already made
		selection.addRange(range) # make the range you have just created the visible selection
		return selection

		