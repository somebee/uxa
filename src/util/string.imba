
export def matchFuzzy needle, haystack
	var nl = needle:length
	var idx = 0
	var ni = 0
	while ni < nl
		let chr = needle[ni++]
		idx = haystack.indexOf(chr,idx)
		return false if idx == -1
	return true