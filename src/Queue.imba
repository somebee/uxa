

export class Queue
	prop error
	prop errors
	prop state watch: yes
	
	def initialize(owner, parent)
		@parent = parent
		@owner = owner
		@commit = owner:commit
		@pending = []
		@errors = []
		@state = 'idle'
		self

	def emit name, *params
		Imba.emit(self,name,params)

	def on name, *params
		Imba.listen(self,name,*params)

	def un name, *params
		Imba.unlisten(self,name,*params)

	def map &cb
		@pending.map(cb)

	def len
		@pending:length

	def busy
		len > 0

	def idle
		len == 0

	def failed
		@errors.len

	def reset
		@errors = []
		self

	def error
		@errors[0] and @errors[0].@uxa:error

	def add o = {}, &callback
		# return self if failed
		# incr

		if o isa Number
			o = {duration: o}

		o:duration ||= 1000
		o:startAt = Date.now
		o:state = 'pending'

		if o:duration
			o:endAt = o:startAt + o:duration

		var res = callback
		if res isa Function
			res = res()

		if res and res:then
			res.@uxa = o
			incr(res)
			return res.then((do |ok| decr(res,ok)), (do |err| fail(res,err)))
			
		return self
		

	def incr promise
		@pending.push(promise)

		if @pending.len == 1
			state = 'busy'
		Imba.emit(self,'incr',[self,promise])
		@parent.incr(promise) if @parent

	def decr promise, res
		var idx = @pending.indexOf(promise)

		if idx >= 0
			# should we remove immediately?
			@pending.splice(idx,1)
			promise.@uxa:endedAt = Date.now

			# how do we deal with errors?
			if promise.@uxa:error
				console.log "decr promise with error"
				@errors.push(promise)

			Imba.emit(self,'decr',[self,promise])

			if @pending.len == 0
				state = 'idle'

			@parent.decr(promise,res) if @parent

	def fail promise, err
		console.log "promise.fail",WP =promise
		promise.@uxa:error = err
		return decr(promise)

	def stateDidSet state, prev
		console.log "Queue {prev} -> {state}"
		
		if state == 'busy'
			@owner?.trigger('uxa:busy')
		elif state == 'idle'
			@owner?.trigger('uxa:idle')
			@owner?.commit # really?
		
		Imba.emit(self,state,[])

	def then &cb
		if state == 'idle'
			return cb()
		else
			Imba.once(self,'idle',cb)