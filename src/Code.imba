export tag Code
	
	def self.highlight code, lang
		if code.indexOf('"') >= 0
			code = code.replace(/\"/g,"&quot;")
		if code.indexOf('<') >= 0
			code = code.replace(/\</g,"&lt;")
		if code.indexOf('>') >= 0
			code = code.replace(/\>/g,"&gt;")
		return code