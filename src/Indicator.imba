
export tag Indicator

	prop progress
	prop type default: 'indeterminate'
	prop busy watch: yes
	prop state watch: yes
	prop time default: 2100

	def busyDidSet bool
		bool ? start : stop

	def setup
		if $web$ and type == 'forward'
			dom.addEventListener('transitionend') do |e|
				transitioned(e)

	def start
		state = 'prep'
		dom:offsetParent
		state = 'start'

	def stop
		state = 'done'
		self

	def run
		if state == 'done'
			start
			setTimeout(&,30) do stop
		self

	def transitioned e
		if state == 'start'
			state = 'busy'

	def stateDidSet state
		setFlag('state',state)

	def render
		<self> <div@ind .{type}>