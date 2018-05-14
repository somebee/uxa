var long = """
# Heading 1

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec cursus elit at
odio congue, ac varius massa tincidunt. Nulla blandit odio vel bibendum 
condimentum. In hac habitasse [platea](#platea) dictumst. Nam eu nisl ut erat 
sollicitudin tincidunt.

## Heading 2

Nullam eget urna vitae ex ullamcorper dictum ac ullamcorper nisl. Mauris a
quam non ante ullamcorper ultrices quis quis libero. Quisque ultrices lorem
metus. Duis mi est, elementum nec egestas a, luctus et lacus.

* List item one
* Another item
* Testing this list here

### Heading 3

Nullam eget urna vitae ex ullamcorper dictum ac ullamcorper nisl. Mauris a
quam non ante ullamcorper ultrices quis quis libero. Quisque ultrices lorem
metus.

Mauris a
quam non ante ullamcorper ultrices quis quis libero. Quisque ultrices lorem
metus. Duis mi est, elementum nec egestas a, luctus et lacus.

```javascript
var Hello = [1,2,3,4,5,6,7,8,9]
```

Adipiscing elit. Donec cursus elit at
odio congue, ac varius massa tincidunt. Nulla blandit odio vel bibendum 
condimentum. In hac habitasse [platea](#platea) dictumst. Nam eu nisl ut erat 
sollicitudin tincidunt.

> This is a blockquote right here!

"""

tag Size
	
	def render
		<self.bullets.legend>
			<a :tap.setSize('xs')> 'xs'
			<a :tap.setSize('sm')> 'sm'
			<a :tap.setSize('md')> 'md'
			<a :tap.setSize('lg')> 'lg'
		
	def setSize size
		parent.setFlag('size',size)

export tag Typography

	def render
		<self>
			<.container.mt-xl.narrow>
				<aside uxa:md=long>
				# <div.doc.sm uxa:md=long>
				<blockquote>
					<p> "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante."
					<footer>
						"Someone famous in "
						<cite> "Source Title"
					