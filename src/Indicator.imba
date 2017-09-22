import Queue from './Queue'

export tag Indicator

	prop progress default: 0, watch: yes
	prop type default: 'indeterminate'
	prop busy watch: yes
	prop state default: 'idle',  watch: yes
	prop time default: 2100
	prop threshold default: 0
	

	def busyDidSet bool
		bool ? start : stop

	def setup
		@items = []
		@starter = null

		if data isa Queue
			@queue = data
			# console.log "setting up Indicator for queue"
			@handler = self:refresh.bind(self)
			data.on('incr',@handler)
			data.on('decr',@handler)
		self

	def refresh
		var end = expectedEndAt
		# console.log "Indicator.refresh",end - Date.now,state
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
		busy = yes
		if state == 'done' or state == 'idle'
			@startAt = Date.now
			state = 'prep'
		self

	def stop
		# what if this happens too soon?
		busy = no
		# still not started -- stop it before
		if state == 'prep'
			state = 'done'
			
		elif state == 'busy' or state == 'stalled'
			state = 'finish'
		self

	def calculatedProgress
		var now = Date.now
		(now - @startAt) / (@endAt - @startAt)

	def step
		# console.log 'step to next state from',state
		if state == 'prep'
			state = 'start'

		elif state == 'start'
			# if we have requested stopping - move to finish
			if busy
				state = 'busy'
			else
				state = 'finish'

		elif state == 'busy'
			if @queue and !@queue.idle
				state = 'stalled'
			else
				state = 'finish'
		elif state == 'finish'
			state = 'done'

		elif state == 'done'
			state = 'idle'

	def stateDidSet state, prev
		setFlag('state',state)
		# console.log "Indicator.state",state,prev
		clearTimeout(@stateTimeout)

		let ms = 2
		let ease
		let x = 0

		if state == 'prep'
			unflag('running')
			ms = threshold or 2
			@ind.css(transition: "none", transform: "scaleX(0)")
			dom:offsetParent
			flag('running')

		elif state == 'start'
			@startedAt = Date.now
			ms = 240
			x = 0.12
			ease = "cubic-bezier(0.250, 1.190, 0.300, 0.865)"
			@ind.css(transition: "transform {ms}ms {ease}", transform: "scaleX(0.1)")

		elif state == 'busy'
			ms = expectedEndAt - Date.now
			x = 0.85
			ease = "cubic-bezier(0.225, 0.710, 0.565, 0.985)"
			@ind.css(transition: "transform {ms}ms {ease}", transform: "scaleX(0.85)")

		elif state == 'stalled'
			@ind.css(transition: "transform 3s linear", transform: "scaleX(0.95)")

		elif state == 'finish'
			var dur = (Date.now - @startedAt)
			ms = Math.max(200, 600 - dur)
			# console.log "finish now -- have been animating for {dur}"
			ease = "cubic-bezier(0.260, 0.025, 0.000, 0.995)"
			ease = "cubic-bezier(0.4, 0.0, 0.2, 1)"
			x = 1
			@ind.css(transition: "transform {ms}ms {ease}", transform: "scaleX(1)")

		elif state == 'done'
			unflag('running')
			ms = 200

		@stateTimeout = setTimeout(&,ms) do step

	def render
		<self.uxa .{type}> <div@ind .{type}>