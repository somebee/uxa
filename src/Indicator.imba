import Queue from './Queue'

export tag Indicator

	prop progress default: 0, watch: yes
	prop type default: 'indeterminate'
	prop busy watch: yes
	prop state default: 'idle',  watch: yes
	prop time default: 2100

	def busyDidSet bool
		bool ? start : stop

	def setup
		@items = []

		if data isa Queue
			@queue = data
			console.log "setting up Indicator for queue"
			@handler = self:refresh.bind(self)
			data.on('incr',@handler)
			data.on('decr',@handler)
		self

	def refresh
		var end = expectedEndAt
		console.log "Indicator.refresh",end - Date.now,state

		if @queue.len
			start
		else
			stop

		self

	def expectedEndAt
		if @queue
			var times = @queue.map(|item| item.@uxa:endAt or 0)
			# console.log "times",times,@queue.@pending[0]
			var time = Math.max(*times)
			return Math.max(time,Date.now)

		return Date.now

	# TODO should allow recalculation when more promises come in?
	def start
		if state == 'done' or state == 'idle'
			state = 'prep'

	def stop
		unless state == 'done'
			state = 'finish'
		self

	def calculatedProgress
		var now = Date.now
		(now - @startAt) / (@endAt - @startAt)

	def step
		console.log 'step to next state from',state
		if state == 'prep'
			state = 'start'
		elif state == 'start'
			state = 'busy'
		elif state == 'busy'
			state = 'finish'
		elif state == 'finish'
			state = 'done'

	def stateDidSet state, prev
		setFlag('state',state)
		console.log "Indicator.state",state,prev
		clearTimeout(@stateTimeout)

		let ms = 2

		if state == 'prep'
			unflag('running')
			@ind.css(transition: "none", transform: "scale(0)")
			dom:offsetParent

		elif state == 'start'
			ms = 800
			let ease = "cubic-bezier(0.250, 1.190, 0.300, 0.865)"
			@ind.css(transition: "transform {ms}ms {ease}", transform: "scaleX(0.15)")
			flag('running')

		elif state == 'busy'
			console.log "state to busy"
			ms = expectedEndAt - Date.now
			@ind.css(transition: "transform {ms}ms linear", transform: "scaleX(0.85)")

		elif state == 'finish'
			ms = 200
			let ease = "cubic-bezier(0.260, 0.025, 0.000, 0.995)"
			@ind.css(transition: "transform {ms}ms {ease}", transform: "scaleX(1)")
		elif state == 'done'
			unflag('running')

		@stateTimeout = setTimeout(&,ms) do step

	def render
		<self.uxa .{type}> <div@ind .{type}>