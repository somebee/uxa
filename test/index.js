/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/assets/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 15);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(16);


/***/ }),
/* 1 */
/***/ (function(module, exports) {



var Imba = {VERSION: '1.4.0-beta.1'};



Imba.setTimeout = function (delay,block){
	return setTimeout(function() {
		block();
		return Imba.commit();
	},delay);
};



Imba.setInterval = function (interval,block){
	return setInterval(block,interval);
};



Imba.clearInterval = function (id){
	return clearInterval(id);
};



Imba.clearTimeout = function (id){
	return clearTimeout(id);
};


Imba.subclass = function (obj,sup){
	for (let k in sup){
		let v;
		v = sup[k];if (sup.hasOwnProperty(k)) { obj[k] = v };
	};
	
	obj.prototype = Object.create(sup.prototype);
	obj.__super__ = obj.prototype.__super__ = sup.prototype;
	obj.prototype.initialize = obj.prototype.constructor = obj;
	return obj;
};



Imba.iterable = function (o){
	return o ? ((o.toArray ? o.toArray() : o)) : [];
};



Imba.await = function (value){
	if (value instanceof Array) {
		console.warn("await (Array) is deprecated - use await Promise.all(Array)");
		return Promise.all(value);
	} else if (value && value.then) {
		return value;
	} else {
		return Promise.resolve(value);
	};
};

var dashRegex = /-./g;
var setterCache = {};

Imba.toCamelCase = function (str){
	if (str.indexOf('-') >= 0) {
		return str.replace(dashRegex,function(m) { return m.charAt(1).toUpperCase(); });
	} else {
		return str;
	};
};

Imba.toSetter = function (str){
	return setterCache[str] || (setterCache[str] = Imba.toCamelCase('set-' + str));
};

Imba.indexOf = function (a,b){
	return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
};

Imba.len = function (a){
	return a && ((a.len instanceof Function) ? a.len.call(a) : a.length) || 0;
};

Imba.prop = function (scope,name,opts){
	if (scope.defineProperty) {
		return scope.defineProperty(name,opts);
	};
	return;
};

Imba.attr = function (scope,name,opts){
	if(opts === undefined) opts = {};
	if (scope.defineAttribute) {
		return scope.defineAttribute(name,opts);
	};
	
	let getName = Imba.toCamelCase(name);
	let setName = Imba.toCamelCase('set-' + name);
	let proto = scope.prototype;
	
	if (opts.dom) {
		proto[getName] = function() { return this.dom()[name]; };
		proto[setName] = function(value) {
			if (value != this[name]()) {
				this.dom()[name] = value;
			};
			return this;
		};
	} else {
		proto[getName] = function() { return this.getAttribute(name); };
		proto[setName] = function(value) {
			this.setAttribute(name,value);
			return this;
		};
	};
	return;
};

Imba.propDidSet = function (object,property,val,prev){
	let fn = property.watch;
	if (fn instanceof Function) {
		fn.call(object,val,prev,property);
	} else if ((typeof fn=='string'||fn instanceof String) && object[fn]) {
		object[fn](val,prev,property);
	};
	return;
};



var emit__ = function(event,args,node) {
	// var node = cbs[event]
	var prev,cb,ret;
	
	while ((prev = node) && (node = node.next)){
		if (cb = node.listener) {
			if (node.path && cb[node.path]) {
				ret = args ? cb[node.path].apply(cb,args) : cb[node.path]();
			} else {
				// check if it is a method?
				ret = args ? cb.apply(node,args) : cb.call(node);
			};
		};
		
		if (node.times && --node.times <= 0) {
			prev.next = node.next;
			node.listener = null;
		};
	};
	return;
};


Imba.listen = function (obj,event,listener,path){
	var cbs,list,tail;
	cbs = obj.__listeners__ || (obj.__listeners__ = {});
	list = cbs[event] || (cbs[event] = {});
	tail = list.tail || (list.tail = (list.next = {}));
	tail.listener = listener;
	tail.path = path;
	list.tail = tail.next = {};
	return tail;
};


Imba.once = function (obj,event,listener){
	var tail = Imba.listen(obj,event,listener);
	tail.times = 1;
	return tail;
};


Imba.unlisten = function (obj,event,cb,meth){
	var node,prev;
	var meta = obj.__listeners__;
	if (!meta) { return };
	
	if (node = meta[event]) {
		while ((prev = node) && (node = node.next)){
			if (node == cb || node.listener == cb) {
				prev.next = node.next;
				
				node.listener = null;
				break;
			};
		};
	};
	return;
};


Imba.emit = function (obj,event,params){
	var cb;
	if (cb = obj.__listeners__) {
		if (cb[event]) { emit__(event,params,cb[event]) };
		if (cb.all) { emit__(event,[event,params],cb.all) }; 
	};
	return;
};

Imba.observeProperty = function (observer,key,trigger,target,prev){
	if (prev && typeof prev == 'object') {
		Imba.unlisten(prev,'all',observer,trigger);
	};
	if (target && typeof target == 'object') {
		Imba.listen(target,'all',observer,trigger);
	};
	return this;
};

module.exports = Imba;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

function len$(a){
	return a && (a.len instanceof Function ? a.len() : a.length) || 0;
};
var Imba = __webpack_require__(0);

var Icon = Imba.defineTag('Icon', 'i', function(tag){
	tag.prototype.__data = {watch: 'dataDidSet',name: 'data'};
	tag.prototype.data = function(v){ return this._data; }
	tag.prototype.setData = function(v){
		var a = this.data();
		if(v != a) { this._data = v; }
		if(v != a) { this.dataDidSet && this.dataDidSet(v,a,this.__data) }
		return this;
	};
	
	tag.prototype.build = function (){
		return this.flag('uxa');
	};
	
	tag.prototype.dataDidSet = function (icon){
		// console.log "Icon#dataDidSet",icon
		if ((typeof icon=='string'||icon instanceof String)) {
			if (len$(icon) == 1) { // and "xwvo*-=+><:.^".indexOf(icon) >= 0
				this.setText(icon);
			} else if (icon.indexOf('<svg') >= 0) {
				this.flag('svg');
				this.dom().innerHTML = icon;
			};
		};
		return this;
	};
})
exports.Icon = Icon;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
var Icon = __webpack_require__(2).Icon;

var Button = Imba.defineTag('Button', 'button', function(tag){
	
	tag.prototype.action = function(v){ return this._action; }
	tag.prototype.setAction = function(v){ this._action = v; return this; };
	tag.prototype.icon = function(v){ return this._icon; }
	tag.prototype.setIcon = function(v){ this._icon = v; return this; };
	tag.prototype.label = function(v){ return this._label; }
	tag.prototype.setLabel = function(v){ this._label = v; return this; };
	tag.prototype.href = function(v){ return this._href; }
	tag.prototype.setHref = function(v){ this._href = v; return this; };
	tag.prototype.uxaAnchor = function(v){ return this._uxaAnchor; }
	tag.prototype.setUxaAnchor = function(v){ this._uxaAnchor = v; return this; };
	
	tag.prototype.build = function (){
		// buttons should be of type button by default
		return this.dom().setAttribute('type','button');
	};
	
	tag.prototype.contextData = function (){
		var data = null;
		var el = this;
		while (el){
			if (data = el.data()) {
				return data;
			};
			el = el.parent();
		};
		return null;
	};
	
	tag.prototype.ontap = function (e){
		var action = this.action();
		
		if (action) {
			this.trigger("uxa:action",action);
		};
		
		if ((typeof action=='string'||action instanceof String)) {
			e.halt().silence();
			this.trigger(action,this.contextData());
		} else if (action instanceof Array) {
			e.halt().silence();
			this.trigger(action[0],action.slice(1));
		} else {
			e._responder = null;
		};
		return this;
	};
	
	
	tag.prototype.ontouchstart = function (t){
		return this.flag('_touch');
	};
	
	tag.prototype.ontouchend = function (){
		return this.unflag('_touch');
	};
	
	tag.prototype.ontouchcancel = function (){
		return this.unflag('_touch');
	};
	
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).flag('uxa').setChildren([
			this.icon() ? (
				($[0] || _1(Icon,$,0,this)).bindData(this,'icon',[]).end()
			) : void(0),
			this.label() ? (
				this.href() ? (
					($[1] || _1('b',$,1,this).setContent($[2] || _1('a',$,2,1),2)).end((
						$[2].setHref(this.href()).setNestedAttr('uxa','md',this.label()).end()
					,true))
				) : (
					($[3] || _1('b',$,3,this)).setNestedAttr('uxa','md',this.label()).end()
				)
			) : void(0)
		],1).synced();
	};
})
exports.Button = Button;

var IconButton = Imba.defineTag('IconButton', Button)
exports.IconButton = IconButton;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(1);

Imba.Pointer = function Pointer(){
	this._button = -1;
	this._event = {x: 0,y: 0,type: 'uninitialized'};
	return this;
};

Imba.Pointer.prototype.button = function (){
	return this._button;
};

Imba.Pointer.prototype.touch = function (){
	return this._touch;
};

Imba.Pointer.prototype.update = function (e){
	this._event = e;
	this._dirty = true;
	return this;
};


Imba.Pointer.prototype.process = function (){
	var e1 = this._event;
	
	if (this._dirty) {
		this._prevEvent = e1;
		this._dirty = false;
		
		
		if (e1.type == 'mousedown') {
			this._button = e1.button;
			
			if ((this._touch && this._button != 0)) {
				return;
			};
			
			
			if (this._touch) { this._touch.cancel() };
			this._touch = new Imba.Touch(e1,this);
			this._touch.mousedown(e1,e1);
		} else if (e1.type == 'mousemove') {
			if (this._touch) { this._touch.mousemove(e1,e1) };
		} else if (e1.type == 'mouseup') {
			this._button = -1;
			
			if (this._touch && this._touch.button() == e1.button) {
				this._touch.mouseup(e1,e1);
				this._touch = null;
			};
			
		};
	} else if (this._touch) {
		this._touch.idle();
	};
	return this;
};

Imba.Pointer.prototype.x = function (){
	return this._event.x;
};
Imba.Pointer.prototype.y = function (){
	return this._event.y;
};


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
var Stack = __webpack_require__(26).Stack;
var Menu = __webpack_require__(6).Menu;
var MenuItem = __webpack_require__(27).MenuItem;
var Button$ = __webpack_require__(3), Button = Button$.Button, IconButton = Button$.IconButton;
var TextField$ = __webpack_require__(9), TextField = TextField$.TextField, TextArea = TextField$.TextArea, SelectField = TextField$.SelectField;
var ListItem = __webpack_require__(28).ListItem;
var Popover = __webpack_require__(7).Popover;
var Dialog = __webpack_require__(29).Dialog;
var Indicator = __webpack_require__(11).Indicator;
var Form = __webpack_require__(10).Form;
var Snackbar = __webpack_require__(8).Snackbar;
var Tile = __webpack_require__(30).Tile;
var Icon = __webpack_require__(2).Icon;
var Queue = __webpack_require__(12).Queue;
var Actionable = __webpack_require__(31).Actionable;

var marked = __webpack_require__(13);


var MarkdownCache = {};
var SetterCache = {};

var mdclean = function(md,out) {
	if (md.indexOf('\n') == -1 && out.indexOf('<p>') == 0) {
		return out.slice(3,out.lastIndexOf('</p>'));
	} else {
		return out;
	};
};

var md2html = function(md) {
	var MarkdownCache_;
	return MarkdownCache[md] || (MarkdownCache[md] = mdclean(md,marked(md)));
};

var toSetter = function(key) {
	var SetterCache_;
	return SetterCache[key] || (SetterCache[key] = Imba.toCamelCase('set-' + key));
};

var ActionHandler = function(e) {
	let target = this;
	let action = target.uxa().action();
	
	if (action) {
		target.trigger("uxa:action",action);
	};
	
	if ((typeof action=='string'||action instanceof String)) {
		e.halt().silence();
		return target.trigger(action,target.uxa().contextData());
	} else if (action instanceof Array) {
		e.halt().silence();
		return target.trigger(action[0],action.slice(1));
	} else if (action instanceof Function) {
		e.halt().silence();
		return action.call(target,e);
	} else {
		return e._responder = null;
	};
};

function UXAWrapper(owner){
	this._owner = owner;
	this._options = {};
	this;
};

UXAWrapper.prototype.__md = {watch: 'mdDidSet',name: 'md'};
UXAWrapper.prototype.md = function(v){ return this._md; }
UXAWrapper.prototype.setMd = function(v){
	var a = this.md();
	if(v != a) { this._md = v; }
	if(v != a) { this.mdDidSet && this.mdDidSet(v,a,this.__md) }
	return this;
};
UXAWrapper.prototype.__action = {watch: 'actionDidSet',name: 'action'};
UXAWrapper.prototype.action = function(v){ return this._action; }
UXAWrapper.prototype.setAction = function(v){
	var a = this.action();
	if(v != a) { this._action = v; }
	if(v != a) { this.actionDidSet && this.actionDidSet(v,a,this.__action) }
	return this;
};

UXAWrapper.prototype.open = function (component,options){
	if(options === undefined) options = {};
	return Stack.show(component,this._owner,options);
};

UXAWrapper.prototype.menu = function (component){
	return this;
};

UXAWrapper.prototype.confirm = function (message){
	var self = this;
	return new Promise(function(resolve,reject) {
		var t0;
		var ok = function() { return resolve(true); };
		var cancel = function() { return resolve(false); };
		var dialog = (t0 = (t0=_1(Dialog)).setContent(t0.$.A || _1('span',t0.$,'A',t0),2)).on$(0,['uxadismiss',cancel],self).on$(1,['uxasubmit',ok],self).end((
			t0.$.A.setNestedAttr('uxa','md',message).end()
		,true));
		return self.open(dialog);
	});
};

UXAWrapper.prototype.flash = function (item,typ){
	if (item instanceof Error) {
		item = item.message;
		typ = 'dark'; 
	};
	
	if ((typeof item=='string'||item instanceof String)) {
		item = (_1(Snackbar)).setFlag(0,typ || 'dark').setNestedAttr('uxa','md',item).end();
	};
	
	if (item instanceof Snackbar) {
		this.open(item);
	};
	return this;
};

UXAWrapper.prototype.set = function (key,value){
	return this[toSetter(key)](value);
};

UXAWrapper.prototype.mdDidSet = function (value){
	return this._owner.dom().innerHTML = md2html(value);
};

UXAWrapper.prototype.actionDidSet = function (action,prev){
	this._owner.ontap = ActionHandler;
	return this;
};

UXAWrapper.prototype.contextData = function (){
	var data = null;
	var el = this._owner;
	while (el){
		if (data = el.data()) {
			return data;
		};
		el = el.parent();
	};
	return null;
};

UXAWrapper.prototype.queue = function (){
	return this._queue || (this._queue = new Queue(this._owner));
};



Imba.extendTag('element', function(tag){
	
	tag.prototype.uxa = function (){
		return this._uxa || (this._uxa = new UXAWrapper(this));
	};
	
	tag.prototype.uxaSetAttribute = function (key,value){
		return this.uxa().set(key,value);
	};
});


	
	Imba.Event.prototype.uxa = function (){
		return this.target().uxa();
	};


var UXA = exports.UXA = new UXAWrapper(null);
var Button = exports.Button = Button;
var IconButton = exports.IconButton = IconButton;
var Menu = exports.Menu = Menu;
var MenuItem = exports.MenuItem = MenuItem;
var TextField = exports.TextField = TextField;
var TextArea = exports.TextArea = TextArea;
var SelectField = exports.SelectField = SelectField;
var ListItem = exports.ListItem = ListItem;
MenuItem = exports.MenuItem = MenuItem;
var Popover = exports.Popover = Popover;
var Dialog = exports.Dialog = Dialog;
var Form = exports.Form = Form;
var Indicator = exports.Indicator = Indicator;
var Snackbar = exports.Snackbar = Snackbar;
var Tile = exports.Tile = Tile;
var Icon = exports.Icon = Icon;
var Actionable = exports.Actionable = Actionable;

if (true) {
	window.UXA = UXA;
};


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);


var Menu = Imba.defineTag('Menu', function(tag){
	
	tag.prototype.build = function (){
		return this.flag('menu');
	};
	
	tag.prototype.ontap = function (e){
		return this.trigger('uxahide');
	};
})
exports.Menu = Menu;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);
var Popover = Imba.defineTag('Popover')
exports.Popover = Popover;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);

var Snackbar = Imba.defineTag('Snackbar')
exports.Snackbar = Snackbar;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0), _2 = Imba.createTagList, _1 = Imba.createElement;

var TextField = Imba.defineTag('TextField', function(tag){
	tag.prototype.label = function(v){ return this._label; }
	tag.prototype.setLabel = function(v){ this._label = v; return this; };
	tag.prototype.desc = function(v){ return this._desc; }
	tag.prototype.setDesc = function(v){ this._desc = v; return this; };
	tag.prototype.multiline = function(v){ return this._multiline; }
	tag.prototype.setMultiline = function(v){ this._multiline = v; return this; };
	
	['disabled','placeholder','type','name','value','required','pattern','minlength','maxlength','autocomplete'].map(function(key) {
		var setter = Imba.toCamelCase(("set-" + key));
		tag.prototype[key] = function(val) { return this.input()[key](); };
		return tag.prototype[setter] = function(val) {
			this.input()[setter](val);
			return this;
		};
	});
	
	tag.prototype.bindData = function (target,path,args){
		this.input().bindData(target,path,args);
		return this;
	};
	
	tag.prototype.input = function (){
		let $ = this.$$ || (this.$$ = {});
		return (this._input = this._input||_1('input',this).flag('input').setPlaceholder(" ").setType('text')).end();
	};
	
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).flag('uxa').setChildren([
			this.input(),
			$[0] || _1('span',$,0,this).flag('after'),
			$[1] || _1('hr',$,1,this).flag('static'),
			$[2] || _1('hr',$,2,this).flag('anim'),
			$[3] || _1('label',$,3,this),
			$[4] || _1('span',$,4,this).flag('helper').flag('desc')
		],1).synced((
			$[3].setContent(this.label(),3),
			$[4].dataset('desc',this.desc()).setContent(this.desc(),3).end()
		,true));
	};
})
exports.TextField = TextField;



var TextAreaProxy = Imba.defineTag('TextAreaProxy', 'textarea', function(tag){
	tag.prototype.owner = function(v){ return this._owner; }
	tag.prototype.setOwner = function(v){ this._owner = v; return this; };
	
	tag.prototype.onfocus = function (e){
		return this.owner().dom().focus();
	};
});

var Editable = Imba.defineTag('Editable', function(tag){
	tag.prototype.placeholder = function(v){ return this.getAttribute('placeholder'); }
	tag.prototype.setPlaceholder = function(v){ this.setAttribute('placeholder',v); return this; };
	tag.prototype.minlength = function(v){ return this.getAttribute('minlength'); }
	tag.prototype.setMinlength = function(v){ this.setAttribute('minlength',v); return this; };
	tag.prototype.maxlength = function(v){ return this.getAttribute('maxlength'); }
	tag.prototype.setMaxlength = function(v){ this.setAttribute('maxlength',v); return this; };
	tag.prototype.required = function(v){ return this.getAttribute('required'); }
	tag.prototype.setRequired = function(v){ this.setAttribute('required',v); return this; };
	tag.prototype.name = function(v){ return this.getAttribute('name'); }
	tag.prototype.setName = function(v){ this.setAttribute('name',v); return this; };
	
	tag.prototype.build = function (){
		var self = this;
		self.setTabindex(0);
		try {
			self.dom().contentEditable = "plaintext-only";
		} catch (e) {
			self.dom().contentEditable = true;
		};
		
		self._raw = (_1(TextAreaProxy).flag('input').setTabindex("-1")).setOwner(self).end();
		self._raw.setValue = function(value) { return self.setValue(value); };
		return self;
	};
	
	tag.prototype.raw = function (){
		return this._raw;
	};
	
	tag.prototype.setAttribute = function (key,value){
		// console.log "Editable.setAttribute",key,value
		if (this._raw) { this.raw().setAttribute(key,value) };
		tag.prototype.__super__.setAttribute.apply(this,arguments);
		return this;
	};
	
	tag.prototype.setValue = function (value){
		if (!this._syncing && this.dom().innerText != value) {
			this.dom().innerText = value;
		};
		this.raw().dom().value = value;
		return this;
	};
	
	tag.prototype.value = function (){
		return this.dom().innerText;
	};
	
	tag.prototype.oninput = function (e){
		this.raw().dom().value = this.value();
		this._syncing = true;
		this.raw().oninput(e);
		this._syncing = false;
		return this;
	};
});

var TextArea = Imba.defineTag('TextArea', TextField, function(tag){
	
	tag.prototype.input = function (){
		let $ = this.$$ || (this.$$ = {});
		return (this._input = this._input||_1(Editable,this).flag('input')).end();
	};
	
	tag.prototype.bindData = function (target,path,args){
		this.input().raw().bindData(target,path,args);
		return this;
	};
	
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).flag('uxa').setChildren([
			this.input().raw(),
			this.input(),
			$[0] || _1('span',$,0,this).flag('after'),
			$[1] || _1('hr',$,1,this).flag('static'),
			$[2] || _1('hr',$,2,this).flag('anim'),
			$[3] || _1('label',$,3,this),
			$[4] || _1('span',$,4,this).flag('helper').flag('desc')
		],1).synced((
			$[3].setContent(this.label(),3),
			$[4].dataset('desc',this.desc()).setContent(this.desc(),3).end()
		,true));
	};
})
exports.TextArea = TextArea;

var SelectField = Imba.defineTag('SelectField', TextField, function(tag){
	
	tag.prototype.setOptions = function (val){
		let $ = this.$$ || (this.$$ = {}), t0;
		var input = this.input();
		(t0 = this._input = this._input||(t0=_1('select',this)).flag('input')).setContent(
			(function tagLoop($0) {
				for (let i = 0, items = iter$(val), len = $0.taglen = items.length, item; i < len; i++) {
					item = items[i];
					($0[i] || _1('option',$0,i)).setValue(item[0],1).setContent(item[1] || item[0],3).end();
				};return $0;
			})(t0.$['A'] || _2(t0.$,'A',this._input))
		,4).end();
		this;
		return this;
	};
	
	tag.prototype.input = function (){
		let $ = this.$$ || (this.$$ = {});
		return (this._input = this._input||_1('select',this).flag('input')).end();
	};
})
exports.SelectField = SelectField;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0);

var Form = Imba.defineTag('Form', 'form', function(tag){
	
	tag.prototype.__formData = {watch: 'formDataDidSet',name: 'formData'};
	tag.prototype.formData = function(v){ return this._formData; }
	tag.prototype.setFormData = function(v){
		var a = this.formData();
		if(v != a) { this._formData = v; }
		if(v != a) { this.formDataDidSet && this.formDataDidSet(v,a,this.__formData) }
		return this;
	};
	
	tag.prototype.formDataDidSet = function (data){
		if (this._commited) { return this.applyFormData(data) };
	};
	
	tag.prototype.loadFormData = function (){
		if (this._formData) { return this.applyFormData(this._formData) };
	};
	
	tag.prototype.commit = function (){
		tag.prototype.__super__.commit.apply(this,arguments);
		if (!this._commited) {
			this.loadFormData();
			this._commited = true;
		};
		return this;
	};
	
	tag.prototype.formElements = function (){
		var o = [];
		
		for (let i = 0, items = iter$(this.dom().elements), len = items.length, field; i < len; i++) {
			field = items[i];
			let node = field; 
			let name = field.name;
			
			if (name) {
				o.push(node);
			};
			
			if (o[name]) {
				if (!((o[name] instanceof Array))) { o[name] = [o[name]] };
				o[name].push(node);
			} else {
				o[name] = node;
			};
		};
		return o;
	};
	
	tag.prototype.applyFormData = function (dict){
		if(dict === undefined) dict = {};
		var fields = this.formElements();
		
		for (let i = 0, items = iter$(fields), len = items.length, field; i < len; i++) {
			field = items[i];
			let typ = field.type;
			let val = dict[field.name];
			
			if (val == undefined) { continue; };
			
			if (typ == 'radio' || typ == 'checked') {
				field.checked = field.value == val;
			} else {
				if (field._tag) {
					field._tag.setValue(val);
				} else {
					field.value = val;
				};
			};
		};
		return this;
	};
	
	tag.prototype.formData = function (){
		var o = {};
		for (let i = 0, items = iter$(this.dom().elements), len = items.length, field; i < len; i++) {
			field = items[i];
			if (field.type == 'checkbox') {
				if (!field.checked) { continue; };
			} else if (field.type == 'radio') {
				if (!field.checked) { continue; };
			};
			if (field.name) {
				o[field.name] = ((field._tag && field._tag.value) ? field._tag.value() : field.value);
			};
		};
		return o;
	};
	
	tag.prototype.onsubmit = async function (e){
		e.cancel().halt(); 
		
		if (this.uxa().queue().busy()) {
			return;
		};
		
		this.trigger('uxa:submit',this.formData());
		
		await this.uxa().queue();
		
		if (this.uxa().queue().failed()) {
			this.log("failed?!?!",this.uxa().queue().error());
			this.uxa().flash(this.uxa().queue().error());
			this.uxa().queue().reset();
		};
		
		return this;
		
		
		
	};
	
	tag.prototype.onuxabusy = function (e){
		e.halt();
		return this.flag('uxa-busy');
	};
	
	tag.prototype.onuxaidle = function (e){
		var self = this;
		e.halt();
		return setTimeout(function() {
			if (self.uxa().queue().idle()) {
				return self.unflag('uxa-busy');
			};
		},200);
	};
})
exports.Form = Form;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

function len$(a){
	return a && (a.len instanceof Function ? a.len() : a.length) || 0;
};
var Imba = __webpack_require__(0), _1 = Imba.createElement;
var Queue = __webpack_require__(12).Queue;

var Indicator = Imba.defineTag('Indicator', function(tag){
	
	tag.prototype.__progress = {'default': 0,watch: 'progressDidSet',name: 'progress'};
	tag.prototype.progress = function(v){ return this._progress; }
	tag.prototype.setProgress = function(v){
		var a = this.progress();
		if(v != a) { this._progress = v; }
		if(v != a) { this.progressDidSet && this.progressDidSet(v,a,this.__progress) }
		return this;
	}
	tag.prototype._progress = 0;
	tag.prototype.__type = {'default': 'indeterminate',name: 'type'};
	tag.prototype.type = function(v){ return this._type; }
	tag.prototype.setType = function(v){ this._type = v; return this; }
	tag.prototype._type = 'indeterminate';
	tag.prototype.__busy = {watch: 'busyDidSet',name: 'busy'};
	tag.prototype.busy = function(v){ return this._busy; }
	tag.prototype.setBusy = function(v){
		var a = this.busy();
		if(v != a) { this._busy = v; }
		if(v != a) { this.busyDidSet && this.busyDidSet(v,a,this.__busy) }
		return this;
	};
	tag.prototype.__state = {'default': 'idle',watch: 'stateDidSet',name: 'state'};
	tag.prototype.state = function(v){ return this._state; }
	tag.prototype.setState = function(v){
		var a = this.state();
		if(v != a) { this._state = v; }
		if(v != a) { this.stateDidSet && this.stateDidSet(v,a,this.__state) }
		return this;
	}
	tag.prototype._state = 'idle';
	tag.prototype.__time = {'default': 2100,name: 'time'};
	tag.prototype.time = function(v){ return this._time; }
	tag.prototype.setTime = function(v){ this._time = v; return this; }
	tag.prototype._time = 2100;
	tag.prototype.__threshold = {'default': 0,name: 'threshold'};
	tag.prototype.threshold = function(v){ return this._threshold; }
	tag.prototype.setThreshold = function(v){ this._threshold = v; return this; }
	tag.prototype._threshold = 0;
	
	
	tag.prototype.busyDidSet = function (bool){
		return bool ? this.start() : this.stop();
	};
	
	tag.prototype.setup = function (){
		this._items = [];
		this._starter = null;
		this._endAt = 0;
		
		if (this.data() instanceof Queue) {
			this._queue = this.data();
			
			this._handler = this.refresh.bind(this);
			this.data().on('incr',this._handler);
			this.data().on('decr',this._handler);
		};
		return this;
	};
	
	tag.prototype.refresh = function (){
		var end = this.expectedEndAt();
		
		if (len$(this._queue)) {
			this.start();
		} else {
			this.stop();
		};
		return this;
	};
	
	tag.prototype.expectedEndAt = function (){
		var Math_;
		if (this._queue) {
			var times = this._queue.map(function(item) { return item._uxa.endAt || 0; });
			
			var time = Math.max.apply(Math,times);
			return Math.max(time,Date.now());
		};
		
		return Math.max(this._endAt,Date.now());
	};
	
	
	tag.prototype.start = function (dur){
		if(dur === undefined) dur = 1000;
		this.setBusy(true);
		if (this.state() == 'done' || this.state() == 'idle') {
			this._startAt = Date.now();
			this._endAt = this._startAt + dur;
			this.setState('prep');
		};
		return this;
	};
	
	tag.prototype.stop = function (){
		// what if this happens too soon?
		this.setBusy(false);
		
		if (this.state() == 'prep') {
			this.setState('done');
		} else if (this.state() == 'busy' || this.state() == 'stalled') {
			this.setState('finish');
		};
		return this;
	};
	
	tag.prototype.calculatedProgress = function (){
		var now = Date.now();
		return (now - this._startAt) / (this._endAt - this._startAt);
	};
	
	tag.prototype.step = function (){
		// console.log 'step to next state from',state
		var v_;
		if (this.state() == 'prep') {
			return (this.setState(v_ = 'start'),v_);
		} else if (this.state() == 'start') {
			// if we have requested stopping - move to finish
			if (this.busy()) {
				return (this.setState(v_ = 'busy'),v_);
			} else {
				return (this.setState(v_ = 'finish'),v_);
			};
		} else if (this.state() == 'busy') {
			if (this._queue && !this._queue.idle()) {
				return (this.setState(v_ = 'stalled'),v_);
			} else {
				return (this.setState(v_ = 'finish'),v_);
			};
		} else if (this.state() == 'finish') {
			return (this.setState(v_ = 'done'),v_);
		} else if (this.state() == 'done') {
			return (this.setState(v_ = 'idle'),v_);
		};
	};
	
	tag.prototype.stateDidSet = function (state,prev){
		var self = this;
		self.setFlag('state',state);
		
		clearTimeout(self._stateTimeout);
		
		let ms = 2;
		let ease;
		let x = 0;
		
		if (state == 'prep') {
			self.unflag('running');
			ms = self.threshold() || 2;
			self._ind.css({transition: "none",transform: "scaleX(0)"});
			self.dom().offsetParent;
			self.flag('running');
		} else if (state == 'start') {
			self._startedAt = Date.now();
			ms = 240;
			x = 0.12;
			ease = "cubic-bezier(0.250, 1.190, 0.300, 0.865)";
			self._ind.css({transition: ("transform " + ms + "ms " + ease),transform: "scaleX(0.1)"});
		} else if (state == 'busy') {
			ms = self.expectedEndAt() - Date.now();
			x = 0.85;
			ease = "cubic-bezier(0.225, 0.710, 0.565, 0.985)";
			self._ind.css({transition: ("transform " + ms + "ms " + ease),transform: "scaleX(0.85)"});
		} else if (state == 'stalled') {
			self._ind.css({transition: "transform 3s linear",transform: "scaleX(0.95)"});
		} else if (state == 'finish') {
			var dur = (Date.now() - self._startedAt);
			ms = Math.max(200,600 - dur);
			
			ease = "cubic-bezier(0.260, 0.025, 0.000, 0.995)";
			ease = "cubic-bezier(0.4, 0.0, 0.2, 1)";
			x = 1;
			self._ind.css({transition: ("transform " + ms + "ms " + ease),transform: "scaleX(1)"});
		} else if (state == 'done') {
			self.unflag('running');
			ms = 200;
		};
		
		return self._stateTimeout = setTimeout(function() { return self.step(); },ms);
	};
	
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).flag('uxa').setFlag(-1,this.type()).setChildren(this._ind = this._ind||_1('div',this).flag('ind'),2).synced((
			this._ind.setFlag(0,this.type())
		,true));
	};
})
exports.Indicator = Indicator;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

function len$(a){
	return a && (a.len instanceof Function ? a.len() : a.length) || 0;
};
var Imba = __webpack_require__(0);


function Queue(owner,parent){
	this._parent = parent;
	this._owner = owner;
	this._commit = owner.commit;
	this._pending = [];
	this._errors = [];
	this._state = 'idle';
	this;
};

exports.Queue = Queue; // export class 
Queue.prototype.error = function(v){ return this._error; }
Queue.prototype.setError = function(v){ this._error = v; return this; };
Queue.prototype.errors = function(v){ return this._errors; }
Queue.prototype.setErrors = function(v){ this._errors = v; return this; };
Queue.prototype.__state = {watch: 'stateDidSet',name: 'state'};
Queue.prototype.state = function(v){ return this._state; }
Queue.prototype.setState = function(v){
	var a = this.state();
	if(v != a) { this._state = v; }
	if(v != a) { this.stateDidSet && this.stateDidSet(v,a,this.__state) }
	return this;
};

Queue.prototype.emit = function (name){
	var $0 = arguments, i = $0.length;
	var params = new Array(i>1 ? i-1 : 0);
	while(i>1) params[--i - 1] = $0[i];
	return Imba.emit(this,name,params);
};

Queue.prototype.on = function (name){
	var Imba_;
	var $0 = arguments, i = $0.length;
	var params = new Array(i>1 ? i-1 : 0);
	while(i>1) params[--i - 1] = $0[i];
	return Imba.listen.apply(Imba,[].concat([this,name], [].slice.call(params)));
};

Queue.prototype.un = function (name){
	var Imba_;
	var $0 = arguments, i = $0.length;
	var params = new Array(i>1 ? i-1 : 0);
	while(i>1) params[--i - 1] = $0[i];
	return Imba.unlisten.apply(Imba,[].concat([this,name], [].slice.call(params)));
};

Queue.prototype.map = function (cb){
	return this._pending.map(cb);
};

Queue.prototype.len = function (){
	return this._pending.length;
};

Queue.prototype.busy = function (){
	return len$(this) > 0;
};

Queue.prototype.idle = function (){
	return len$(this) == 0;
};

Queue.prototype.failed = function (){
	return len$(this._errors);
};

Queue.prototype.reset = function (){
	this._errors = [];
	return this;
};

Queue.prototype.error = function (){
	return this._errors[0] && this._errors[0]._uxa.error;
};

Queue.prototype.add = function (o,callback){
	// return self if failed
	// incr
	
	var self = this;
	if(callback==undefined && typeof o == 'function') callback = o,o = {};
	if(o==undefined) o = {};
	if ((typeof o=='number'||o instanceof Number)) {
		o = {duration: o};
	};
	
	o.duration || (o.duration = 1000);
	o.startAt = Date.now();
	o.state = 'pending';
	
	if (o.duration) {
		o.endAt = o.startAt + o.duration;
	};
	
	var res = callback;
	if (res instanceof Function) {
		res = res();
	};
	
	if (res && res.then) {
		res._uxa = o;
		self.incr(res);
		return res.then(function(ok) { return self.decr(res,ok); },function(err) { return self.fail(res,err); });
	};
	
	return self;
};


Queue.prototype.incr = function (promise){
	this._pending.push(promise);
	
	if (len$(this._pending) == 1) {
		this.setState('busy');
	};
	Imba.emit(this,'incr',[this,promise]);
	if (this._parent) { return this._parent.incr(promise) };
};

Queue.prototype.decr = function (promise,res){
	var idx = this._pending.indexOf(promise);
	
	if (idx >= 0) {
		// should we remove immediately?
		this._pending.splice(idx,1);
		promise._uxa.endedAt = Date.now();
		
		
		if (promise._uxa.error) {
			this._errors.push(promise);
		};
		
		Imba.emit(this,'decr',[this,promise]);
		
		if (len$(this._pending) == 0) {
			this.setState('idle');
		};
		
		if (this._parent) { return this._parent.decr(promise,res) };
	};
};

Queue.prototype.fail = function (promise,err){
	// console.log "promise.fail",WP =promise
	promise._uxa.error = err;
	return this.decr(promise);
};

Queue.prototype.stateDidSet = function (state,prev){
	// console.log "Queue {prev} -> {state}"
	
	if (state == 'busy') {
		this._owner && this._owner.trigger  &&  this._owner.trigger('uxa:busy');
	} else if (state == 'idle') {
		this._owner && this._owner.trigger  &&  this._owner.trigger('uxa:idle');
		this._owner && this._owner.commit  &&  this._owner.commit(); 
	};
	
	return Imba.emit(this,state,[]);
};

Queue.prototype.then = function (cb){
	if (this.state() == 'idle') {
		return cb();
	} else {
		return Imba.once(this,'idle',cb);
	};
};


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/**
 * marked - a markdown parser
 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 */

;(function() {

/**
 * Block-Level Grammar
 */

var block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: noop,
  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  nptable: noop,
  lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
  blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
  list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  html: /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
  table: noop,
  paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
  text: /^[^\n]+/
};

block.bullet = /(?:[*+-]|\d+\.)/;
block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
block.item = replace(block.item, 'gm')
  (/bull/g, block.bullet)
  ();

block.list = replace(block.list)
  (/bull/g, block.bullet)
  ('hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')
  ('def', '\\n+(?=' + block.def.source + ')')
  ();

block.blockquote = replace(block.blockquote)
  ('def', block.def)
  ();

block._tag = '(?!(?:'
  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';

block.html = replace(block.html)
  ('comment', /<!--[\s\S]*?-->/)
  ('closed', /<(tag)[\s\S]+?<\/\1>/)
  ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
  (/tag/g, block._tag)
  ();

block.paragraph = replace(block.paragraph)
  ('hr', block.hr)
  ('heading', block.heading)
  ('lheading', block.lheading)
  ('blockquote', block.blockquote)
  ('tag', '<' + block._tag)
  ('def', block.def)
  ();

/**
 * Normal Block Grammar
 */

block.normal = merge({}, block);

/**
 * GFM Block Grammar
 */

block.gfm = merge({}, block.normal, {
  fences: /^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]*?)\s*\1 *(?:\n+|$)/,
  paragraph: /^/,
  heading: /^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/
});

block.gfm.paragraph = replace(block.paragraph)
  ('(?!', '(?!'
    + block.gfm.fences.source.replace('\\1', '\\2') + '|'
    + block.list.source.replace('\\1', '\\3') + '|')
  ();

/**
 * GFM + Tables Block Grammar
 */

block.tables = merge({}, block.gfm, {
  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
});

/**
 * Block Lexer
 */

function Lexer(options) {
  this.tokens = [];
  this.tokens.links = {};
  this.options = options || marked.defaults;
  this.rules = block.normal;

  if (this.options.gfm) {
    if (this.options.tables) {
      this.rules = block.tables;
    } else {
      this.rules = block.gfm;
    }
  }
}

/**
 * Expose Block Rules
 */

Lexer.rules = block;

/**
 * Static Lex Method
 */

Lexer.lex = function(src, options) {
  var lexer = new Lexer(options);
  return lexer.lex(src);
};

/**
 * Preprocessing
 */

Lexer.prototype.lex = function(src) {
  src = src
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/\u00a0/g, ' ')
    .replace(/\u2424/g, '\n');

  return this.token(src, true);
};

/**
 * Lexing
 */

Lexer.prototype.token = function(src, top, bq) {
  var src = src.replace(/^ +$/gm, '')
    , next
    , loose
    , cap
    , bull
    , b
    , item
    , space
    , i
    , l;

  while (src) {
    // newline
    if (cap = this.rules.newline.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[0].length > 1) {
        this.tokens.push({
          type: 'space'
        });
      }
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      cap = cap[0].replace(/^ {4}/gm, '');
      this.tokens.push({
        type: 'code',
        text: !this.options.pedantic
          ? cap.replace(/\n+$/, '')
          : cap
      });
      continue;
    }

    // fences (gfm)
    if (cap = this.rules.fences.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'code',
        lang: cap[2],
        text: cap[3] || ''
      });
      continue;
    }

    // heading
    if (cap = this.rules.heading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[1].length,
        text: cap[2]
      });
      continue;
    }

    // table no leading pipe (gfm)
    if (top && (cap = this.rules.nptable.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i].split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // lheading
    if (cap = this.rules.lheading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[2] === '=' ? 1 : 2,
        text: cap[1]
      });
      continue;
    }

    // hr
    if (cap = this.rules.hr.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'hr'
      });
      continue;
    }

    // blockquote
    if (cap = this.rules.blockquote.exec(src)) {
      src = src.substring(cap[0].length);

      this.tokens.push({
        type: 'blockquote_start'
      });

      cap = cap[0].replace(/^ *> ?/gm, '');

      // Pass `top` to keep the current
      // "toplevel" state. This is exactly
      // how markdown.pl works.
      this.token(cap, top, true);

      this.tokens.push({
        type: 'blockquote_end'
      });

      continue;
    }

    // list
    if (cap = this.rules.list.exec(src)) {
      src = src.substring(cap[0].length);
      bull = cap[2];

      this.tokens.push({
        type: 'list_start',
        ordered: bull.length > 1
      });

      // Get each top-level item.
      cap = cap[0].match(this.rules.item);

      next = false;
      l = cap.length;
      i = 0;

      for (; i < l; i++) {
        item = cap[i];

        // Remove the list item's bullet
        // so it is seen as the next token.
        space = item.length;
        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

        // Outdent whatever the
        // list item contains. Hacky.
        if (~item.indexOf('\n ')) {
          space -= item.length;
          item = !this.options.pedantic
            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
            : item.replace(/^ {1,4}/gm, '');
        }

        // Determine whether the next list item belongs here.
        // Backpedal if it does not belong in this list.
        if (this.options.smartLists && i !== l - 1) {
          b = block.bullet.exec(cap[i + 1])[0];
          if (bull !== b && !(bull.length > 1 && b.length > 1)) {
            src = cap.slice(i + 1).join('\n') + src;
            i = l - 1;
          }
        }

        // Determine whether item is loose or not.
        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
        // for discount behavior.
        loose = next || /\n\n(?!\s*$)/.test(item);
        if (i !== l - 1) {
          next = item.charAt(item.length - 1) === '\n';
          if (!loose) loose = next;
        }

        this.tokens.push({
          type: loose
            ? 'loose_item_start'
            : 'list_item_start'
        });

        // Recurse.
        this.token(item, false, bq);

        this.tokens.push({
          type: 'list_item_end'
        });
      }

      this.tokens.push({
        type: 'list_end'
      });

      continue;
    }

    // html
    if (cap = this.rules.html.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: this.options.sanitize
          ? 'paragraph'
          : 'html',
        pre: !this.options.sanitizer
          && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
        text: cap[0]
      });
      continue;
    }

    // def
    if ((!bq && top) && (cap = this.rules.def.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.links[cap[1].toLowerCase()] = {
        href: cap[2],
        title: cap[3]
      };
      continue;
    }

    // table (gfm)
    if (top && (cap = this.rules.table.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i]
          .replace(/^ *\| *| *\| *$/g, '')
          .split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // top-level paragraph
    if (top && (cap = this.rules.paragraph.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'paragraph',
        text: cap[1].charAt(cap[1].length - 1) === '\n'
          ? cap[1].slice(0, -1)
          : cap[1]
      });
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      // Top-level should never reach here.
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'text',
        text: cap[0]
      });
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return this.tokens;
};

/**
 * Inline-Level Grammar
 */

var inline = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
  autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
  url: noop,
  tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
  link: /^!?\[(inside)\]\(href\)/,
  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
  br: /^ {2,}\n(?!\s*$)/,
  del: noop,
  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
};

inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = replace(inline.link)
  ('inside', inline._inside)
  ('href', inline._href)
  ();

inline.reflink = replace(inline.reflink)
  ('inside', inline._inside)
  ();

/**
 * Normal Inline Grammar
 */

inline.normal = merge({}, inline);

/**
 * Pedantic Inline Grammar
 */

inline.pedantic = merge({}, inline.normal, {
  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
});

/**
 * GFM Inline Grammar
 */

inline.gfm = merge({}, inline.normal, {
  escape: replace(inline.escape)('])', '~|])')(),
  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
  del: /^~~(?=\S)([\s\S]*?\S)~~/,
  text: replace(inline.text)
    (']|', '~]|')
    ('|', '|https?://|')
    ()
});

/**
 * GFM + Line Breaks Inline Grammar
 */

inline.breaks = merge({}, inline.gfm, {
  br: replace(inline.br)('{2,}', '*')(),
  text: replace(inline.gfm.text)('{2,}', '*')()
});

/**
 * Inline Lexer & Compiler
 */

function InlineLexer(links, options) {
  this.options = options || marked.defaults;
  this.links = links;
  this.rules = inline.normal;
  this.renderer = this.options.renderer || new Renderer;
  this.renderer.options = this.options;

  if (!this.links) {
    throw new
      Error('Tokens array requires a `links` property.');
  }

  if (this.options.gfm) {
    if (this.options.breaks) {
      this.rules = inline.breaks;
    } else {
      this.rules = inline.gfm;
    }
  } else if (this.options.pedantic) {
    this.rules = inline.pedantic;
  }
}

/**
 * Expose Inline Rules
 */

InlineLexer.rules = inline;

/**
 * Static Lexing/Compiling Method
 */

InlineLexer.output = function(src, links, options) {
  var inline = new InlineLexer(links, options);
  return inline.output(src);
};

/**
 * Lexing/Compiling
 */

InlineLexer.prototype.output = function(src) {
  var out = ''
    , link
    , text
    , href
    , cap;

  while (src) {
    // escape
    if (cap = this.rules.escape.exec(src)) {
      src = src.substring(cap[0].length);
      out += cap[1];
      continue;
    }

    // autolink
    if (cap = this.rules.autolink.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[2] === '@') {
        text = cap[1].charAt(6) === ':'
          ? this.mangle(cap[1].substring(7))
          : this.mangle(cap[1]);
        href = this.mangle('mailto:') + text;
      } else {
        text = escape(cap[1]);
        href = text;
      }
      out += this.renderer.link(href, null, text);
      continue;
    }

    // url (gfm)
    if (!this.inLink && (cap = this.rules.url.exec(src))) {
      src = src.substring(cap[0].length);
      text = escape(cap[1]);
      href = text;
      out += this.renderer.link(href, null, text);
      continue;
    }

    // tag
    if (cap = this.rules.tag.exec(src)) {
      if (!this.inLink && /^<a /i.test(cap[0])) {
        this.inLink = true;
      } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
        this.inLink = false;
      }
      src = src.substring(cap[0].length);
      out += this.options.sanitize
        ? this.options.sanitizer
          ? this.options.sanitizer(cap[0])
          : escape(cap[0])
        : cap[0]
      continue;
    }

    // link
    if (cap = this.rules.link.exec(src)) {
      src = src.substring(cap[0].length);
      this.inLink = true;
      out += this.outputLink(cap, {
        href: cap[2],
        title: cap[3]
      });
      this.inLink = false;
      continue;
    }

    // reflink, nolink
    if ((cap = this.rules.reflink.exec(src))
        || (cap = this.rules.nolink.exec(src))) {
      src = src.substring(cap[0].length);
      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
      link = this.links[link.toLowerCase()];
      if (!link || !link.href) {
        out += cap[0].charAt(0);
        src = cap[0].substring(1) + src;
        continue;
      }
      this.inLink = true;
      out += this.outputLink(cap, link);
      this.inLink = false;
      continue;
    }

    // strong
    if (cap = this.rules.strong.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.strong(this.output(cap[2] || cap[1]));
      continue;
    }

    // em
    if (cap = this.rules.em.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.em(this.output(cap[2] || cap[1]));
      continue;
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.codespan(escape(cap[2], true));
      continue;
    }

    // br
    if (cap = this.rules.br.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.br();
      continue;
    }

    // del (gfm)
    if (cap = this.rules.del.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.del(this.output(cap[1]));
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.text(escape(this.smartypants(cap[0])));
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return out;
};

/**
 * Compile Link
 */

InlineLexer.prototype.outputLink = function(cap, link) {
  var href = escape(link.href)
    , title = link.title ? escape(link.title) : null;

  return cap[0].charAt(0) !== '!'
    ? this.renderer.link(href, title, this.output(cap[1]))
    : this.renderer.image(href, title, escape(cap[1]));
};

/**
 * Smartypants Transformations
 */

InlineLexer.prototype.smartypants = function(text) {
  if (!this.options.smartypants) return text;
  return text
    // em-dashes
    .replace(/---/g, '\u2014')
    // en-dashes
    .replace(/--/g, '\u2013')
    // opening singles
    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
    // closing singles & apostrophes
    .replace(/'/g, '\u2019')
    // opening doubles
    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
    // closing doubles
    .replace(/"/g, '\u201d')
    // ellipses
    .replace(/\.{3}/g, '\u2026');
};

/**
 * Mangle Links
 */

InlineLexer.prototype.mangle = function(text) {
  if (!this.options.mangle) return text;
  var out = ''
    , l = text.length
    , i = 0
    , ch;

  for (; i < l; i++) {
    ch = text.charCodeAt(i);
    if (Math.random() > 0.5) {
      ch = 'x' + ch.toString(16);
    }
    out += '&#' + ch + ';';
  }

  return out;
};

/**
 * Renderer
 */

function Renderer(options) {
  this.options = options || {};
}

Renderer.prototype.code = function(code, lang, escaped) {
  if (this.options.highlight) {
    var out = this.options.highlight(code, lang);
    if (out != null && out !== code) {
      escaped = true;
      code = out;
    }
  }

  if (!lang) {
    return '<pre><code>'
      + (escaped ? code : escape(code, true))
      + '\n</code></pre>';
  }

  return '<pre><code class="'
    + this.options.langPrefix
    + escape(lang, true)
    + '">'
    + (escaped ? code : escape(code, true))
    + '\n</code></pre>\n';
};

Renderer.prototype.blockquote = function(quote) {
  return '<blockquote>\n' + quote + '</blockquote>\n';
};

Renderer.prototype.html = function(html) {
  return html;
};

Renderer.prototype.heading = function(text, level, raw) {
  return '<h'
    + level
    + ' id="'
    + this.options.headerPrefix
    + raw.toLowerCase().replace(/[^\w]+/g, '-')
    + '">'
    + text
    + '</h'
    + level
    + '>\n';
};

Renderer.prototype.hr = function() {
  return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
};

Renderer.prototype.list = function(body, ordered) {
  var type = ordered ? 'ol' : 'ul';
  return '<' + type + '>\n' + body + '</' + type + '>\n';
};

Renderer.prototype.listitem = function(text) {
  return '<li>' + text + '</li>\n';
};

Renderer.prototype.paragraph = function(text) {
  return '<p>' + text + '</p>\n';
};

Renderer.prototype.table = function(header, body) {
  return '<table>\n'
    + '<thead>\n'
    + header
    + '</thead>\n'
    + '<tbody>\n'
    + body
    + '</tbody>\n'
    + '</table>\n';
};

Renderer.prototype.tablerow = function(content) {
  return '<tr>\n' + content + '</tr>\n';
};

Renderer.prototype.tablecell = function(content, flags) {
  var type = flags.header ? 'th' : 'td';
  var tag = flags.align
    ? '<' + type + ' style="text-align:' + flags.align + '">'
    : '<' + type + '>';
  return tag + content + '</' + type + '>\n';
};

// span level renderer
Renderer.prototype.strong = function(text) {
  return '<strong>' + text + '</strong>';
};

Renderer.prototype.em = function(text) {
  return '<em>' + text + '</em>';
};

Renderer.prototype.codespan = function(text) {
  return '<code>' + text + '</code>';
};

Renderer.prototype.br = function() {
  return this.options.xhtml ? '<br/>' : '<br>';
};

Renderer.prototype.del = function(text) {
  return '<del>' + text + '</del>';
};

Renderer.prototype.link = function(href, title, text) {
  if (this.options.sanitize) {
    try {
      var prot = decodeURIComponent(unescape(href))
        .replace(/[^\w:]/g, '')
        .toLowerCase();
    } catch (e) {
      return '';
    }
    if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
      return '';
    }
  }
  var out = '<a href="' + href + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += '>' + text + '</a>';
  return out;
};

Renderer.prototype.image = function(href, title, text) {
  var out = '<img src="' + href + '" alt="' + text + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += this.options.xhtml ? '/>' : '>';
  return out;
};

Renderer.prototype.text = function(text) {
  return text;
};

/**
 * Parsing & Compiling
 */

function Parser(options) {
  this.tokens = [];
  this.token = null;
  this.options = options || marked.defaults;
  this.options.renderer = this.options.renderer || new Renderer;
  this.renderer = this.options.renderer;
  this.renderer.options = this.options;
}

/**
 * Static Parse Method
 */

Parser.parse = function(src, options, renderer) {
  var parser = new Parser(options, renderer);
  return parser.parse(src);
};

/**
 * Parse Loop
 */

Parser.prototype.parse = function(src) {
  this.inline = new InlineLexer(src.links, this.options, this.renderer);
  this.tokens = src.reverse();

  var out = '';
  while (this.next()) {
    out += this.tok();
  }

  return out;
};

/**
 * Next Token
 */

Parser.prototype.next = function() {
  return this.token = this.tokens.pop();
};

/**
 * Preview Next Token
 */

Parser.prototype.peek = function() {
  return this.tokens[this.tokens.length - 1] || 0;
};

/**
 * Parse Text Tokens
 */

Parser.prototype.parseText = function() {
  var body = this.token.text;

  while (this.peek().type === 'text') {
    body += '\n' + this.next().text;
  }

  return this.inline.output(body);
};

/**
 * Parse Current Token
 */

Parser.prototype.tok = function() {
  switch (this.token.type) {
    case 'space': {
      return '';
    }
    case 'hr': {
      return this.renderer.hr();
    }
    case 'heading': {
      return this.renderer.heading(
        this.inline.output(this.token.text),
        this.token.depth,
        this.token.text);
    }
    case 'code': {
      return this.renderer.code(this.token.text,
        this.token.lang,
        this.token.escaped);
    }
    case 'table': {
      var header = ''
        , body = ''
        , i
        , row
        , cell
        , flags
        , j;

      // header
      cell = '';
      for (i = 0; i < this.token.header.length; i++) {
        flags = { header: true, align: this.token.align[i] };
        cell += this.renderer.tablecell(
          this.inline.output(this.token.header[i]),
          { header: true, align: this.token.align[i] }
        );
      }
      header += this.renderer.tablerow(cell);

      for (i = 0; i < this.token.cells.length; i++) {
        row = this.token.cells[i];

        cell = '';
        for (j = 0; j < row.length; j++) {
          cell += this.renderer.tablecell(
            this.inline.output(row[j]),
            { header: false, align: this.token.align[j] }
          );
        }

        body += this.renderer.tablerow(cell);
      }
      return this.renderer.table(header, body);
    }
    case 'blockquote_start': {
      var body = '';

      while (this.next().type !== 'blockquote_end') {
        body += this.tok();
      }

      return this.renderer.blockquote(body);
    }
    case 'list_start': {
      var body = ''
        , ordered = this.token.ordered;

      while (this.next().type !== 'list_end') {
        body += this.tok();
      }

      return this.renderer.list(body, ordered);
    }
    case 'list_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.token.type === 'text'
          ? this.parseText()
          : this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'loose_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'html': {
      var html = !this.token.pre && !this.options.pedantic
        ? this.inline.output(this.token.text)
        : this.token.text;
      return this.renderer.html(html);
    }
    case 'paragraph': {
      return this.renderer.paragraph(this.inline.output(this.token.text));
    }
    case 'text': {
      return this.renderer.paragraph(this.parseText());
    }
  }
};

/**
 * Helpers
 */

function escape(html, encode) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function unescape(html) {
	// explicitly match decimal, hex, and named HTML entities 
  return html.replace(/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/g, function(_, n) {
    n = n.toLowerCase();
    if (n === 'colon') return ':';
    if (n.charAt(0) === '#') {
      return n.charAt(1) === 'x'
        ? String.fromCharCode(parseInt(n.substring(2), 16))
        : String.fromCharCode(+n.substring(1));
    }
    return '';
  });
}

function replace(regex, opt) {
  regex = regex.source;
  opt = opt || '';
  return function self(name, val) {
    if (!name) return new RegExp(regex, opt);
    val = val.source || val;
    val = val.replace(/(^|[^\[])\^/g, '$1');
    regex = regex.replace(name, val);
    return self;
  };
}

function noop() {}
noop.exec = noop;

function merge(obj) {
  var i = 1
    , target
    , key;

  for (; i < arguments.length; i++) {
    target = arguments[i];
    for (key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        obj[key] = target[key];
      }
    }
  }

  return obj;
}


/**
 * Marked
 */

function marked(src, opt, callback) {
  if (callback || typeof opt === 'function') {
    if (!callback) {
      callback = opt;
      opt = null;
    }

    opt = merge({}, marked.defaults, opt || {});

    var highlight = opt.highlight
      , tokens
      , pending
      , i = 0;

    try {
      tokens = Lexer.lex(src, opt)
    } catch (e) {
      return callback(e);
    }

    pending = tokens.length;

    var done = function(err) {
      if (err) {
        opt.highlight = highlight;
        return callback(err);
      }

      var out;

      try {
        out = Parser.parse(tokens, opt);
      } catch (e) {
        err = e;
      }

      opt.highlight = highlight;

      return err
        ? callback(err)
        : callback(null, out);
    };

    if (!highlight || highlight.length < 3) {
      return done();
    }

    delete opt.highlight;

    if (!pending) return done();

    for (; i < tokens.length; i++) {
      (function(token) {
        if (token.type !== 'code') {
          return --pending || done();
        }
        return highlight(token.text, token.lang, function(err, code) {
          if (err) return done(err);
          if (code == null || code === token.text) {
            return --pending || done();
          }
          token.text = code;
          token.escaped = true;
          --pending || done();
        });
      })(tokens[i]);
    }

    return;
  }
  try {
    if (opt) opt = merge({}, marked.defaults, opt);
    return Parser.parse(Lexer.lex(src, opt), opt);
  } catch (e) {
    e.message += '\nPlease report this to https://github.com/chjj/marked.';
    if ((opt || marked.defaults).silent) {
      return '<p>An error occured:</p><pre>'
        + escape(e.message + '', true)
        + '</pre>';
    }
    throw e;
  }
}

/**
 * Options
 */

marked.options =
marked.setOptions = function(opt) {
  merge(marked.defaults, opt);
  return marked;
};

marked.defaults = {
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  sanitizer: null,
  mangle: true,
  smartLists: false,
  silent: false,
  highlight: null,
  langPrefix: 'lang-',
  smartypants: false,
  headerPrefix: '',
  renderer: new Renderer,
  xhtml: false
};

/**
 * Expose
 */

marked.Parser = Parser;
marked.parser = Parser.parse;

marked.Renderer = Renderer;

marked.Lexer = Lexer;
marked.lexer = Lexer.lex;

marked.InlineLexer = InlineLexer;
marked.inlineLexer = InlineLexer.output;

marked.parse = marked;

if (true) {
  module.exports = marked;
} else if (typeof define === 'function' && define.amd) {
  define(function() { return marked; });
} else {
  this.marked = marked;
}

}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global);
}());

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(32)))

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(5);

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
__webpack_require__(5);

var socket = new WebSocket('ws://localhost:3002/socket');

var marked = __webpack_require__(13);

Imba.extendTag('element', function(tag){
	tag.prototype.__markdown = {watch: 'markdownDidSet',name: 'markdown'};
	tag.prototype.markdown = function(v){ return this._markdown; }
	tag.prototype.setMarkdown = function(v){
		var a = this.markdown();
		if(v != a) { this._markdown = v; }
		if(v != a) { this.markdownDidSet && this.markdownDidSet(v,a,this.__markdown) }
		return this;
	};
	
	tag.prototype.markdownDidSet = function (text){
		return this.dom().innerHTML = marked(text);
	};
});


var Head = __webpack_require__(33).Head;
var Nav = __webpack_require__(34).Nav;
var Home = __webpack_require__(35).Home;

socket.onmessage = function(e) {
	var v_;
	console.log('got message!!!',e);
	return (Imba.getTagSingleton('uxa-css').setHref(v_ = ("style.css?" + (Math.random()))),v_);
};


var App = Imba.defineTag('App', function(tag){
	
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).setChildren($.$ = $.$ || [
			_1(Head,$,0,this).setId('head').flag('dark'),
			_1(Nav,$,1,this).setId('nav').flag('panel').flag('drawer'),
			_1('div',$,2,this).setId('main').setContent(
				$[3] || _1(Home,$,3,2)
			,2)
		],2).synced((
			$[0].end(),
			$[1].end(),
			$[3].end()
		,true));
	};
});

Imba.mount((_1(App)).end());


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(1);
var activate = false;
if (typeof window !== 'undefined') {
	if (window.Imba) {
		console.warn(("Imba v" + (window.Imba.VERSION) + " is already loaded."));
		Imba = window.Imba;
	} else {
		window.Imba = Imba;
		activate = true;
		if (window.define && window.define.amd) {
			window.define("imba",[],function() { return Imba; });
		};
	};
};

module.exports = Imba;

if (true) {
	__webpack_require__(17);
	__webpack_require__(18);
};

if (true && activate) {
	Imba.EventManager.activate();
};

if (false) {};


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);

var requestAnimationFrame; 
var cancelAnimationFrame;

if (false) {};

if (true) {
	cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitRequestAnimationFrame;
	requestAnimationFrame = window.requestAnimationFrame;
	requestAnimationFrame || (requestAnimationFrame = window.webkitRequestAnimationFrame);
	requestAnimationFrame || (requestAnimationFrame = window.mozRequestAnimationFrame);
	requestAnimationFrame || (requestAnimationFrame = function(blk) { return setTimeout(blk,1000 / 60); });
};

function Ticker(){
	var self = this;
	self._queue = [];
	self._stage = -1;
	self._scheduled = false;
	self._ticker = function(e) {
		self._scheduled = false;
		return self.tick(e);
	};
	self;
};

Ticker.prototype.stage = function(v){ return this._stage; }
Ticker.prototype.setStage = function(v){ this._stage = v; return this; };
Ticker.prototype.queue = function(v){ return this._queue; }
Ticker.prototype.setQueue = function(v){ this._queue = v; return this; };

Ticker.prototype.add = function (item,force){
	if (force || this._queue.indexOf(item) == -1) {
		this._queue.push(item);
	};
	
	if (!this._scheduled) { return this.schedule() };
};

Ticker.prototype.tick = function (timestamp){
	var items = this._queue;
	if (!this._ts) { this._ts = timestamp };
	this._dt = timestamp - this._ts;
	this._ts = timestamp;
	this._queue = [];
	this._stage = 1;
	this.before();
	if (items.length) {
		for (let i = 0, ary = iter$(items), len = ary.length, item; i < len; i++) {
			item = ary[i];
			if (item instanceof Function) {
				item(this._dt,this);
			} else if (item.tick) {
				item.tick(this._dt,this);
			};
		};
	};
	this._stage = 2;
	this.after();
	this._stage = this._scheduled ? 0 : (-1);
	return this;
};

Ticker.prototype.schedule = function (){
	if (!this._scheduled) {
		this._scheduled = true;
		if (this._stage == -1) {
			this._stage = 0;
		};
		requestAnimationFrame(this._ticker);
	};
	return this;
};

Ticker.prototype.before = function (){
	return this;
};

Ticker.prototype.after = function (){
	if (Imba.TagManager) {
		Imba.TagManager.refresh();
	};
	return this;
};

Imba.TICKER = new Ticker();
Imba.SCHEDULERS = [];

Imba.ticker = function (){
	return Imba.TICKER;
};

Imba.requestAnimationFrame = function (callback){
	return requestAnimationFrame(callback);
};

Imba.cancelAnimationFrame = function (id){
	return cancelAnimationFrame(id);
};




var commitQueue = 0;

Imba.commit = function (params){
	commitQueue++;
	
	Imba.emit(Imba,'commit',(params != undefined) ? [params] : undefined);
	if (--commitQueue == 0) {
		Imba.TagManager && Imba.TagManager.refresh();
	};
	return;
};



Imba.Scheduler = function Scheduler(target){
	var self = this;
	self._id = counter++;
	self._target = target;
	self._marked = false;
	self._active = false;
	self._marker = function() { return self.mark(); };
	self._ticker = function(e) { return self.tick(e); };
	
	self._dt = 0;
	self._frame = {};
	self._scheduled = false;
	self._timestamp = 0;
	self._ticks = 0;
	self._flushes = 0;
	
	self.onevent = self.onevent.bind(self);
	self;
};

var counter = 0;

Imba.Scheduler.event = function (e){
	return Imba.emit(Imba,'event',e);
};



Imba.Scheduler.prototype.__raf = {watch: 'rafDidSet',name: 'raf'};
Imba.Scheduler.prototype.raf = function(v){ return this._raf; }
Imba.Scheduler.prototype.setRaf = function(v){
	var a = this.raf();
	if(v != a) { this._raf = v; }
	if(v != a) { this.rafDidSet && this.rafDidSet(v,a,this.__raf) }
	return this;
};
Imba.Scheduler.prototype.__interval = {watch: 'intervalDidSet',name: 'interval'};
Imba.Scheduler.prototype.interval = function(v){ return this._interval; }
Imba.Scheduler.prototype.setInterval = function(v){
	var a = this.interval();
	if(v != a) { this._interval = v; }
	if(v != a) { this.intervalDidSet && this.intervalDidSet(v,a,this.__interval) }
	return this;
};
Imba.Scheduler.prototype.__events = {watch: 'eventsDidSet',name: 'events'};
Imba.Scheduler.prototype.events = function(v){ return this._events; }
Imba.Scheduler.prototype.setEvents = function(v){
	var a = this.events();
	if(v != a) { this._events = v; }
	if(v != a) { this.eventsDidSet && this.eventsDidSet(v,a,this.__events) }
	return this;
};
Imba.Scheduler.prototype.marked = function(v){ return this._marked; }
Imba.Scheduler.prototype.setMarked = function(v){ this._marked = v; return this; };

Imba.Scheduler.prototype.rafDidSet = function (bool){
	if (bool && this._active) this.requestTick();
	return this;
};

Imba.Scheduler.prototype.intervalDidSet = function (time){
	clearInterval(this._intervalId);
	this._intervalId = null;
	if (time && this._active) {
		this._intervalId = setInterval(this.oninterval.bind(this),time);
	};
	return this;
};

Imba.Scheduler.prototype.eventsDidSet = function (new$,prev){
	if (this._active && new$ && !prev) {
		return Imba.listen(Imba,'commit',this,'onevent');
	} else if (!(new$) && prev) {
		return Imba.unlisten(Imba,'commit',this,'onevent');
	};
};



Imba.Scheduler.prototype.active = function (){
	return this._active;
};



Imba.Scheduler.prototype.dt = function (){
	return this._dt;
};



Imba.Scheduler.prototype.configure = function (options){
	var v_;
	if(options === undefined) options = {};
	if (options.raf != undefined) { (this.setRaf(v_ = options.raf),v_) };
	if (options.interval != undefined) { (this.setInterval(v_ = options.interval),v_) };
	if (options.events != undefined) { (this.setEvents(v_ = options.events),v_) };
	return this;
};



Imba.Scheduler.prototype.mark = function (){
	this._marked = true;
	if (!this._scheduled) {
		this.requestTick();
	};
	return this;
};



Imba.Scheduler.prototype.flush = function (){
	this._flushes++;
	this._target.tick(this);
	this._marked = false;
	return this;
};



Imba.Scheduler.prototype.tick = function (delta,ticker){
	this._ticks++;
	this._dt = delta;
	
	if (ticker) {
		this._scheduled = false;
	};
	
	this.flush();
	
	if (this._raf && this._active) {
		this.requestTick();
	};
	return this;
};

Imba.Scheduler.prototype.requestTick = function (){
	if (!this._scheduled) {
		this._scheduled = true;
		Imba.TICKER.add(this);
	};
	return this;
};



Imba.Scheduler.prototype.activate = function (immediate){
	if(immediate === undefined) immediate = true;
	if (!this._active) {
		this._active = true;
		this._commit = this._target.commit;
		this._target.commit = function() { return this; };
		this._target && this._target.flag  &&  this._target.flag('scheduled_');
		Imba.SCHEDULERS.push(this);
		
		if (this._events) {
			Imba.listen(Imba,'commit',this,'onevent');
		};
		
		if (this._interval && !this._intervalId) {
			this._intervalId = setInterval(this.oninterval.bind(this),this._interval);
		};
		
		if (immediate) {
			this.tick(0);
		} else if (this._raf) {
			this.requestTick();
		};
	};
	return this;
};



Imba.Scheduler.prototype.deactivate = function (){
	if (this._active) {
		this._active = false;
		this._target.commit = this._commit;
		let idx = Imba.SCHEDULERS.indexOf(this);
		if (idx >= 0) {
			Imba.SCHEDULERS.splice(idx,1);
		};
		
		if (this._events) {
			Imba.unlisten(Imba,'commit',this,'onevent');
		};
		
		if (this._intervalId) {
			clearInterval(this._intervalId);
			this._intervalId = null;
		};
		
		this._target && this._target.unflag  &&  this._target.unflag('scheduled_');
	};
	return this;
};

Imba.Scheduler.prototype.track = function (){
	return this._marker;
};

Imba.Scheduler.prototype.oninterval = function (){
	this.tick();
	Imba.TagManager.refresh();
	return this;
};

Imba.Scheduler.prototype.onevent = function (event){
	if (!this._events || this._marked) { return this };
	
	if (this._events instanceof Function) {
		if (this._events(event,this)) this.mark();
	} else if (this._events instanceof Array) {
		if (this._events.indexOf((event && event.type) || event) >= 0) {
			this.mark();
		};
	} else {
		this.mark();
	};
	return this;
};


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(1);

__webpack_require__(19);
__webpack_require__(20);

Imba.TagManager = new Imba.TagManagerClass();

__webpack_require__(21);
__webpack_require__(22);
__webpack_require__(4);
__webpack_require__(23);
__webpack_require__(24);

if (true) {
	__webpack_require__(25);
};

if (false) {};


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);

Imba.TagManagerClass = function TagManagerClass(){
	this._inserts = 0;
	this._removes = 0;
	this._mounted = [];
	this._mountables = 0;
	this._unmountables = 0;
	this;
};

Imba.TagManagerClass.prototype.mounted = function (){
	return this._mounted;
};

Imba.TagManagerClass.prototype.insert = function (node,parent){
	this._inserts++;
	if (node && node.mount) {
		if (!(node.FLAGS & Imba.TAG_MOUNTABLE)) {
			node.FLAGS |= Imba.TAG_MOUNTABLE;
			this._mountables++;
		};
	};
	return;
};

Imba.TagManagerClass.prototype.remove = function (node,parent){
	return this._removes++;
};


Imba.TagManagerClass.prototype.changes = function (){
	return this._inserts + this._removes;
};

Imba.TagManagerClass.prototype.mount = function (node){
	return;
};

Imba.TagManagerClass.prototype.refresh = function (force){
	if(force === undefined) force = false;
	if (false) {};
	if (!force && this.changes() == 0) { return };
	
	if ((this._inserts && this._mountables > this._mounted.length) || force) {
		this.tryMount();
	};
	
	if ((this._removes || force) && this._mounted.length) {
		this.tryUnmount();
	};
	
	this._inserts = 0;
	this._removes = 0;
	return this;
};

Imba.TagManagerClass.prototype.unmount = function (node){
	return this;
};

Imba.TagManagerClass.prototype.tryMount = function (){
	var count = 0;
	var root = document.body;
	var items = root.querySelectorAll('.__mount');
	
	for (let i = 0, ary = iter$(items), len = ary.length, el; i < len; i++) {
		el = ary[i];
		if (el && el._tag) {
			if (this._mounted.indexOf(el._tag) == -1) {
				this.mountNode(el._tag);
			};
		};
	};
	return this;
};

Imba.TagManagerClass.prototype.mountNode = function (node){
	if (this._mounted.indexOf(node) == -1) {
		this._mounted.push(node);
		node.FLAGS |= Imba.TAG_MOUNTED;
		if (node.mount) { node.mount() };
		
		let el = node.dom().parentNode;
		while (el && el._tag && !el._tag.mount && !(el._tag.FLAGS & Imba.TAG_MOUNTABLE)){
			el._tag.FLAGS |= Imba.TAG_MOUNTABLE;
			el = el.parentNode;
		};
	};
	
	return;
};

Imba.TagManagerClass.prototype.tryUnmount = function (){
	var count = 0;
	var root = document.body;
	for (let i = 0, items = iter$(this._mounted), len = items.length, item; i < len; i++) {
		item = items[i];
		if (!document.documentElement.contains(item._dom)) {
			item.FLAGS = item.FLAGS & ~Imba.TAG_MOUNTED;
			if (item.unmount && item._dom) {
				item.unmount();
			} else if (item._scheduler) {
				// MAYBE FIX THIS?
				item.unschedule();
			};
			this._mounted[i] = null;
			count++;
		};
	};
	
	if (count) {
		this._mounted = this._mounted.filter(function(item) { return item; });
	};
	return this;
};


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);
__webpack_require__(4);

var native$ = [
	'keydown','keyup','keypress',
	'textInput','input','change','submit',
	'focusin','focusout','focus','blur',
	'contextmenu','selectstart','dblclick',
	'mousewheel','wheel','scroll',
	'beforecopy','copy','beforepaste','paste','beforecut','cut',
	'dragstart','drag','dragend','dragenter','dragover','dragleave','dragexit','drop',
	'mouseup','mousedown','mouseenter','mouseleave','mouseout','mouseover','mousemove'
];



Imba.EventManager = function EventManager(node,pars){
	var self = this;
	if(!pars||pars.constructor !== Object) pars = {};
	var events = pars.events !== undefined ? pars.events : [];
	self._shimFocusEvents = true && window.netscape && node.onfocusin === undefined;
	self.setRoot(node);
	self.setListeners([]);
	self.setDelegators({});
	self.setDelegator(function(e) {
		self.delegate(e);
		return true;
	});
	
	for (let i = 0, items = iter$(events), len = items.length; i < len; i++) {
		self.register(items[i]);
	};
	
	return self;
};

Imba.EventManager.prototype.root = function(v){ return this._root; }
Imba.EventManager.prototype.setRoot = function(v){ this._root = v; return this; };
Imba.EventManager.prototype.count = function(v){ return this._count; }
Imba.EventManager.prototype.setCount = function(v){ this._count = v; return this; };
Imba.EventManager.prototype.__enabled = {'default': false,watch: 'enabledDidSet',name: 'enabled'};
Imba.EventManager.prototype.enabled = function(v){ return this._enabled; }
Imba.EventManager.prototype.setEnabled = function(v){
	var a = this.enabled();
	if(v != a) { this._enabled = v; }
	if(v != a) { this.enabledDidSet && this.enabledDidSet(v,a,this.__enabled) }
	return this;
}
Imba.EventManager.prototype._enabled = false;
Imba.EventManager.prototype.listeners = function(v){ return this._listeners; }
Imba.EventManager.prototype.setListeners = function(v){ this._listeners = v; return this; };
Imba.EventManager.prototype.delegators = function(v){ return this._delegators; }
Imba.EventManager.prototype.setDelegators = function(v){ this._delegators = v; return this; };
Imba.EventManager.prototype.delegator = function(v){ return this._delegator; }
Imba.EventManager.prototype.setDelegator = function(v){ this._delegator = v; return this; };

var initialBind = [];

Imba.EventManager.prototype.enabledDidSet = function (bool){
	bool ? this.onenable() : this.ondisable();
	return this;
};

Imba.EventManager.bind = function (name){
	if (Imba.Events) {
		return Imba.Events.autoregister(name);
	} else if (initialBind.indexOf(name) == -1 && native$.indexOf(name) >= 0) {
		return initialBind.push(name);
	};
};

Imba.EventManager.activate = function (){
	var Imba_;
	if (Imba.Events) { return Imba.Events };
	if (false) {};
	
	Imba.POINTER || (Imba.POINTER = new Imba.Pointer());
	Imba.Events = new Imba.EventManager(Imba.document(),{events: []});
	
	var hasTouchEvents = window && window.ontouchstart !== undefined;
	
	if (hasTouchEvents) {
		Imba.Events.listen('touchstart',function(e) {
			return Imba.Touch.ontouchstart(e);
		});
		
		Imba.Events.listen('touchmove',function(e) {
			return Imba.Touch.ontouchmove(e);
		});
		
		Imba.Events.listen('touchend',function(e) {
			return Imba.Touch.ontouchend(e);
		});
		
		Imba.Events.listen('touchcancel',function(e) {
			return Imba.Touch.ontouchcancel(e);
		});
	};
	
	Imba.Events.register('click',function(e) {
		// Only for main mousebutton, no?
		if ((e.timeStamp - Imba.Touch.LastTimestamp) > Imba.Touch.TapTimeout) {
			e._imbaSimulatedTap = true;
			var tap = new Imba.Event(e);
			tap.setType('tap');
			tap.process();
			if (tap._responder && tap.defaultPrevented) {
				return e.preventDefault();
			};
		};
		
		return Imba.Events.delegate(e);
	});
	
	Imba.Events.listen('mousedown',function(e) {
		if ((e.timeStamp - Imba.Touch.LastTimestamp) > Imba.Touch.TapTimeout) {
			if (Imba.POINTER) { return Imba.POINTER.update(e).process() };
		};
	});
	
	Imba.Events.listen('mouseup',function(e) {
		if ((e.timeStamp - Imba.Touch.LastTimestamp) > Imba.Touch.TapTimeout) {
			if (Imba.POINTER) { return Imba.POINTER.update(e).process() };
		};
	});
	
	Imba.Events.register(['mousedown','mouseup']);
	Imba.Events.register(initialBind);
	Imba.Events.setEnabled(true);
	return Imba.Events;
};




Imba.EventManager.prototype.register = function (name,handler){
	if(handler === undefined) handler = true;
	if (name instanceof Array) {
		for (let i = 0, items = iter$(name), len = items.length; i < len; i++) {
			this.register(items[i],handler);
		};
		return this;
	};
	
	if (this.delegators()[name]) { return this };
	
	
	var fn = this.delegators()[name] = (handler instanceof Function) ? handler : this.delegator();
	if (this.enabled()) { return this.root().addEventListener(name,fn,true) };
};

Imba.EventManager.prototype.autoregister = function (name){
	if (native$.indexOf(name) == -1) { return this };
	return this.register(name);
};

Imba.EventManager.prototype.listen = function (name,handler,capture){
	if(capture === undefined) capture = true;
	this.listeners().push([name,handler,capture]);
	if (this.enabled()) { this.root().addEventListener(name,handler,capture) };
	return this;
};

Imba.EventManager.prototype.delegate = function (e){
	var event = Imba.Event.wrap(e);
	event.process();
	if (this._shimFocusEvents) {
		if (e.type == 'focus') {
			Imba.Event.wrap(e).setType('focusin').process();
		} else if (e.type == 'blur') {
			Imba.Event.wrap(e).setType('focusout').process();
		};
	};
	return this;
};



Imba.EventManager.prototype.create = function (type,target,pars){
	if(!pars||pars.constructor !== Object) pars = {};
	var data = pars.data !== undefined ? pars.data : null;
	var source = pars.source !== undefined ? pars.source : null;
	var event = Imba.Event.wrap({type: type,target: target});
	if (data) { (event.setData(data),data) };
	if (source) { (event.setSource(source),source) };
	return event;
};



Imba.EventManager.prototype.trigger = function (){
	return this.create.apply(this,arguments).process();
};

Imba.EventManager.prototype.onenable = function (){
	for (let o = this.delegators(), handler, i = 0, keys = Object.keys(o), l = keys.length, name; i < l; i++){
		name = keys[i];handler = o[name];this.root().addEventListener(name,handler,true);
	};
	
	for (let i = 0, items = iter$(this.listeners()), len = items.length, item; i < len; i++) {
		item = items[i];
		this.root().addEventListener(item[0],item[1],item[2]);
	};
	
	window.addEventListener('hashchange',Imba.commit);
	window.addEventListener('popstate',Imba.commit);
	return this;
};

Imba.EventManager.prototype.ondisable = function (){
	for (let o = this.delegators(), handler, i = 0, keys = Object.keys(o), l = keys.length, name; i < l; i++){
		name = keys[i];handler = o[name];this.root().removeEventListener(name,handler,true);
	};
	
	for (let i = 0, items = iter$(this.listeners()), len = items.length, item; i < len; i++) {
		item = items[i];
		this.root().removeEventListener(item[0],item[1],item[2]);
	};
	
	window.removeEventListener('hashchange',Imba.commit);
	window.removeEventListener('popstate',Imba.commit);
	return this;
};


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);

Imba.CSSKeyMap = {};

Imba.TAG_BUILT = 1;
Imba.TAG_SETUP = 2;
Imba.TAG_MOUNTING = 4;
Imba.TAG_MOUNTED = 8;
Imba.TAG_SCHEDULED = 16;
Imba.TAG_AWAKENED = 32;
Imba.TAG_MOUNTABLE = 64;



Imba.document = function (){
	return window.document;
};



Imba.root = function (){
	return Imba.getTagForDom(Imba.document().body);
};

Imba.static = function (items,typ,nr){
	items._type = typ;
	items.static = nr;
	return items;
};



Imba.mount = function (node,into){
	into || (into = Imba.document().body);
	into.appendChild(node.dom());
	Imba.TagManager.insert(node,into);
	node.scheduler().configure({events: true}).activate(false);
	Imba.TagManager.refresh();
	return node;
};


Imba.createTextNode = function (node){
	if (node && node.nodeType == 3) {
		return node;
	};
	return Imba.document().createTextNode(node);
};





Imba.Tag = function Tag(dom,ctx){
	this.setDom(dom);
	this.$ = TagCache.build(this);
	this.$up = this._owner_ = ctx;
	this._tree_ = null;
	this.FLAGS = 0;
	this.build();
	this;
};

Imba.Tag.buildNode = function (){
	var dom = Imba.document().createElement(this._nodeType || 'div');
	if (this._classes) {
		var cls = this._classes.join(" ");
		if (cls) { dom.className = cls };
	};
	return dom;
};

Imba.Tag.createNode = function (){
	var proto = (this._protoDom || (this._protoDom = this.buildNode()));
	return proto.cloneNode(false);
};

Imba.Tag.build = function (ctx){
	return new this(this.createNode(),ctx);
};

Imba.Tag.dom = function (){
	return this._protoDom || (this._protoDom = this.buildNode());
};

Imba.Tag.end = function (){
	return this.commit(0);
};



Imba.Tag.inherit = function (child){
	child._protoDom = null;
	
	if (this._nodeType) {
		child._nodeType = this._nodeType;
		child._classes = this._classes.slice();
		
		if (child._flagName) {
			return child._classes.push(child._flagName);
		};
	} else {
		child._nodeType = child._name;
		child._flagName = null;
		return child._classes = [];
	};
};



Imba.Tag.prototype.optimizeTagStructure = function (){
	if (false) {};
	var ctor = this.constructor;
	let keys = Object.keys(this);
	
	if (keys.indexOf('mount') >= 0) {
		if (ctor._classes && ctor._classes.indexOf('__mount') == -1) {
			ctor._classes.push('__mount');
		};
		
		if (ctor._protoDom) {
			ctor._protoDom.classList.add('__mount');
		};
	};
	
	for (let i = 0, items = iter$(keys), len = items.length, key; i < len; i++) {
		key = items[i];
		if ((/^on/).test(key)) { Imba.EventManager.bind(key.slice(2)) };
	};
	return this;
};


Imba.attr(Imba.Tag,'name');
Imba.attr(Imba.Tag,'role');
Imba.attr(Imba.Tag,'tabindex');
Imba.Tag.prototype.title = function(v){ return this.getAttribute('title'); }
Imba.Tag.prototype.setTitle = function(v){ this.setAttribute('title',v); return this; };

Imba.Tag.prototype.dom = function (){
	return this._dom;
};

Imba.Tag.prototype.setDom = function (dom){
	dom._tag = this;
	this._dom = this._slot_ = dom;
	return this;
};

Imba.Tag.prototype.ref = function (){
	return this._ref;
};

Imba.Tag.prototype.root = function (){
	return this._owner_ ? this._owner_.root() : this;
};



Imba.Tag.prototype.ref_ = function (ref){
	this.flag(this._ref = ref);
	return this;
};



Imba.Tag.prototype.setData = function (data){
	this._data = data;
	return this;
};



Imba.Tag.prototype.data = function (){
	return this._data;
};


Imba.Tag.prototype.bindData = function (target,path,args){
	return this.setData(args ? target[path].apply(target,args) : target[path]);
};



Imba.Tag.prototype.setHtml = function (html){
	if (this.html() != html) {
		this._dom.innerHTML = html;
	};
	return this;
};



Imba.Tag.prototype.html = function (){
	return this._dom.innerHTML;
};

Imba.Tag.prototype.on$ = function (slot,handler,context){
	let handlers = this._on_ || (this._on_ = []);
	let prev = handlers[slot];
	
	if (slot < 0) {
		if (prev == undefined) {
			slot = handlers[slot] = handlers.length;
		} else {
			slot = prev;
		};
		prev = handlers[slot];
	};
	
	handlers[slot] = handler;
	if (prev) {
		handler.state = prev.state;
	} else {
		handler.state = {context: context};
		if (true) { Imba.EventManager.bind(handler[0]) };
	};
	return this;
};


Imba.Tag.prototype.setId = function (id){
	if (id != null) {
		this.dom().id = id;
	};
	return this;
};

Imba.Tag.prototype.id = function (){
	return this.dom().id;
};



Imba.Tag.prototype.setAttribute = function (name,value){
	var old = this.dom().getAttribute(name);
	
	if (old == value) {
		value;
	} else if (value != null && value !== false) {
		this.dom().setAttribute(name,value);
	} else {
		this.dom().removeAttribute(name);
	};
	return this;
};

Imba.Tag.prototype.setNestedAttr = function (ns,name,value){
	if (this[ns + 'SetAttribute']) {
		this[ns + 'SetAttribute'](name,value);
	} else {
		this.setAttributeNS(ns,name,value);
	};
	return this;
};

Imba.Tag.prototype.setAttributeNS = function (ns,name,value){
	var old = this.getAttributeNS(ns,name);
	
	if (old != value) {
		if (value != null && value !== false) {
			this.dom().setAttributeNS(ns,name,value);
		} else {
			this.dom().removeAttributeNS(ns,name);
		};
	};
	return this;
};




Imba.Tag.prototype.removeAttribute = function (name){
	return this.dom().removeAttribute(name);
};



Imba.Tag.prototype.getAttribute = function (name){
	return this.dom().getAttribute(name);
};


Imba.Tag.prototype.getAttributeNS = function (ns,name){
	return this.dom().getAttributeNS(ns,name);
};


Imba.Tag.prototype.set = function (key,value,mods){
	let setter = Imba.toSetter(key);
	if (this[setter] instanceof Function) {
		this[setter](value,mods);
	} else {
		this._dom.setAttribute(key,value);
	};
	return this;
};


Imba.Tag.prototype.get = function (key){
	return this._dom.getAttribute(key);
};



Imba.Tag.prototype.setContent = function (content,type){
	this.setChildren(content,type);
	return this;
};



Imba.Tag.prototype.setChildren = function (nodes,type){
	// overridden on client by reconciler
	this._tree_ = nodes;
	return this;
};



Imba.Tag.prototype.setTemplate = function (template){
	if (!this._template) {
		if (this.render == Imba.Tag.prototype.render) {
			this.render = this.renderTemplate; 
		};
	};
	
	this.template = this._template = template;
	return this;
};

Imba.Tag.prototype.template = function (){
	return null;
};



Imba.Tag.prototype.renderTemplate = function (){
	var body = this.template();
	if (body != this) { this.setChildren(body) };
	return this;
};




Imba.Tag.prototype.removeChild = function (child){
	var par = this.dom();
	var el = child._slot_ || child;
	if (el && el.parentNode == par) {
		Imba.TagManager.remove(el._tag || el,this);
		par.removeChild(el);
	};
	return this;
};



Imba.Tag.prototype.removeAllChildren = function (){
	if (this._dom.firstChild) {
		var el;
		while (el = this._dom.firstChild){
			true && Imba.TagManager.remove(el._tag || el,this);
			this._dom.removeChild(el);
		};
	};
	this._tree_ = this._text_ = null;
	return this;
};



Imba.Tag.prototype.appendChild = function (node){
	if ((typeof node=='string'||node instanceof String)) {
		this.dom().appendChild(Imba.document().createTextNode(node));
	} else if (node) {
		this.dom().appendChild(node._slot_ || node);
		Imba.TagManager.insert(node._tag || node,this);
		
	};
	return this;
};



Imba.Tag.prototype.insertBefore = function (node,rel){
	if ((typeof node=='string'||node instanceof String)) {
		node = Imba.document().createTextNode(node);
	};
	
	if (node && rel) {
		this.dom().insertBefore((node._slot_ || node),(rel._slot_ || rel));
		Imba.TagManager.insert(node._tag || node,this);
		
	};
	return this;
};

Imba.Tag.prototype.detachFromParent = function (){
	if (this._slot_ == this._dom) {
		this._slot_ = (this._dom._placeholder_ || (this._dom._placeholder_ = Imba.document().createComment("node")));
		this._slot_._tag || (this._slot_._tag = this);
		
		if (this._dom.parentNode) {
			Imba.TagManager.remove(this,this._dom.parentNode);
			this._dom.parentNode.replaceChild(this._slot_,this._dom);
		};
	};
	return this;
};

Imba.Tag.prototype.attachToParent = function (){
	if (this._slot_ != this._dom) {
		let prev = this._slot_;
		this._slot_ = this._dom;
		if (prev && prev.parentNode) {
			Imba.TagManager.insert(this);
			prev.parentNode.replaceChild(this._dom,prev);
		};
	};
	
	return this;
};



Imba.Tag.prototype.orphanize = function (){
	var par;
	if (par = this.parent()) { par.removeChild(this) };
	return this;
};



Imba.Tag.prototype.text = function (v){
	return this._dom.textContent;
};



Imba.Tag.prototype.setText = function (txt){
	this._tree_ = txt;
	this._dom.textContent = (txt == null || this.text() === false) ? '' : txt;
	this;
	return this;
};




Imba.Tag.prototype.dataset = function (key,val){
	if (key instanceof Object) {
		for (let v, i = 0, keys = Object.keys(key), l = keys.length, k; i < l; i++){
			k = keys[i];v = key[k];this.dataset(k,v);
		};
		return this;
	};
	
	if (arguments.length == 2) {
		this.setAttribute(("data-" + key),val);
		return this;
	};
	
	if (key) {
		return this.getAttribute(("data-" + key));
	};
	
	var dataset = this.dom().dataset;
	
	if (!dataset) {
		dataset = {};
		for (let i = 0, items = iter$(this.dom().attributes), len = items.length, atr; i < len; i++) {
			atr = items[i];
			if (atr.name.substr(0,5) == 'data-') {
				dataset[Imba.toCamelCase(atr.name.slice(5))] = atr.value;
			};
		};
	};
	
	return dataset;
};



Imba.Tag.prototype.render = function (){
	return this;
};



Imba.Tag.prototype.build = function (){
	return this;
};



Imba.Tag.prototype.setup = function (){
	return this;
};



Imba.Tag.prototype.commit = function (){
	if (this.beforeRender() !== false) this.render();
	return this;
};

Imba.Tag.prototype.beforeRender = function (){
	return this;
};



Imba.Tag.prototype.tick = function (){
	if (this.beforeRender() !== false) this.render();
	return this;
};



Imba.Tag.prototype.end = function (){
	this.setup();
	this.commit(0);
	this.end = Imba.Tag.end;
	return this;
};


Imba.Tag.prototype.$open = function (context){
	if (context != this._context_) {
		this._tree_ = null;
		this._context_ = context;
	};
	return this;
};



Imba.Tag.prototype.synced = function (){
	return this;
};




Imba.Tag.prototype.awaken = function (){
	return this;
};



Imba.Tag.prototype.flags = function (){
	return this._dom.classList;
};



Imba.Tag.prototype.flag = function (name,toggler){
	// it is most natural to treat a second undefined argument as a no-switch
	// so we need to check the arguments-length
	if (arguments.length == 2) {
		if (this._dom.classList.contains(name) != !!toggler) {
			this._dom.classList.toggle(name);
		};
	} else {
		// firefox will trigger a change if adding existing class
		if (!this._dom.classList.contains(name)) { this._dom.classList.add(name) };
	};
	return this;
};



Imba.Tag.prototype.unflag = function (name){
	this._dom.classList.remove(name);
	return this;
};



Imba.Tag.prototype.toggleFlag = function (name){
	this._dom.classList.toggle(name);
	return this;
};



Imba.Tag.prototype.hasFlag = function (name){
	return this._dom.classList.contains(name);
};


Imba.Tag.prototype.flagIf = function (flag,bool){
	var f = this._flags_ || (this._flags_ = {});
	let prev = f[flag];
	
	if (bool && !prev) {
		this._dom.classList.add(flag);
		f[flag] = true;
	} else if (prev && !bool) {
		this._dom.classList.remove(flag);
		f[flag] = false;
	};
	
	return this;
};



Imba.Tag.prototype.setFlag = function (name,value){
	let flags = this._namedFlags_ || (this._namedFlags_ = {});
	let prev = flags[name];
	if (prev != value) {
		if (prev) { this.unflag(prev) };
		if (value) { this.flag(value) };
		flags[name] = value;
	};
	return this;
};




Imba.Tag.prototype.scheduler = function (){
	return (this._scheduler == null) ? (this._scheduler = new Imba.Scheduler(this)) : this._scheduler;
};



Imba.Tag.prototype.schedule = function (options){
	if(options === undefined) options = {events: true};
	this.scheduler().configure(options).activate();
	return this;
};



Imba.Tag.prototype.unschedule = function (){
	if (this._scheduler) { this.scheduler().deactivate() };
	return this;
};




Imba.Tag.prototype.parent = function (){
	return Imba.getTagForDom(this.dom().parentNode);
};



Imba.Tag.prototype.children = function (sel){
	let res = [];
	for (let i = 0, items = iter$(this._dom.children), len = items.length, item; i < len; i++) {
		item = items[i];
		res.push(item._tag || Imba.getTagForDom(item));
	};
	return res;
};

Imba.Tag.prototype.querySelector = function (q){
	return Imba.getTagForDom(this._dom.querySelector(q));
};

Imba.Tag.prototype.querySelectorAll = function (q){
	var items = [];
	for (let i = 0, ary = iter$(this._dom.querySelectorAll(q)), len = ary.length; i < len; i++) {
		items.push(Imba.getTagForDom(ary[i]));
	};
	return items;
};



Imba.Tag.prototype.matches = function (sel){
	var fn;
	if (sel instanceof Function) {
		return sel(this);
	};
	
	if (sel.query instanceof Function) { sel = sel.query() };
	if (fn = (this._dom.matches || this._dom.matchesSelector || this._dom.webkitMatchesSelector || this._dom.msMatchesSelector || this._dom.mozMatchesSelector)) {
		return fn.call(this._dom,sel);
	};
};



Imba.Tag.prototype.closest = function (sel){
	return Imba.getTagForDom(this._dom.closest(sel));
};



Imba.Tag.prototype.contains = function (node){
	return this.dom().contains(node._dom || node);
};




Imba.Tag.prototype.log = function (){
	var $0 = arguments, i = $0.length;
	var args = new Array(i>0 ? i : 0);
	while(i>0) args[i-1] = $0[--i];
	args.unshift(console);
	Function.prototype.call.apply(console.log,args);
	return this;
};

Imba.Tag.prototype.css = function (key,val){
	if (key instanceof Object) {
		for (let v, i = 0, keys = Object.keys(key), l = keys.length, k; i < l; i++){
			k = keys[i];v = key[k];this.css(k,v);
		};
		return this;
	};
	
	var name = Imba.CSSKeyMap[key] || key;
	
	if (val == null) {
		this.dom().style.removeProperty(name);
	} else if (val == undefined && arguments.length == 1) {
		return this.dom().style[name];
	} else {
		if ((typeof val=='number'||val instanceof Number) && name.match(/width|height|left|right|top|bottom/)) {
			this.dom().style[name] = val + "px";
		} else {
			this.dom().style[name] = val;
		};
	};
	return this;
};

Imba.Tag.prototype.setStyle = function (style){
	return this.setAttribute('style',style);
};

Imba.Tag.prototype.style = function (){
	return this.getAttribute('style');
};



Imba.Tag.prototype.trigger = function (name,data){
	if(data === undefined) data = {};
	return true && Imba.Events.trigger(name,this,{data: data});
};



Imba.Tag.prototype.focus = function (){
	this.dom().focus();
	return this;
};



Imba.Tag.prototype.blur = function (){
	this.dom().blur();
	return this;
};

Imba.Tag.prototype.toString = function (){
	return this.dom().outerHTML;
};


Imba.Tag.prototype.initialize = Imba.Tag;

Imba.SVGTag = function SVGTag(){ return Imba.Tag.apply(this,arguments) };

Imba.subclass(Imba.SVGTag,Imba.Tag);
Imba.SVGTag.namespaceURI = function (){
	return "http://www.w3.org/2000/svg";
};

Imba.SVGTag.buildNode = function (){
	var dom = Imba.document().createElementNS(this.namespaceURI(),this._nodeType);
	if (this._classes) {
		var cls = this._classes.join(" ");
		if (cls) { dom.className.baseVal = cls };
	};
	return dom;
};

Imba.SVGTag.inherit = function (child){
	child._protoDom = null;
	
	if (this == Imba.SVGTag) {
		child._nodeType = child._name;
		return child._classes = [];
	} else {
		child._nodeType = this._nodeType;
		var className = "_" + child._name.replace(/_/g,'-');
		return child._classes = (this._classes || []).concat(className);
	};
};

Imba.HTML_TAGS = "a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr".split(" ");
Imba.HTML_TAGS_UNSAFE = "article aside header section".split(" ");

Imba.HTML_ATTRS = {
	a: "href target hreflang media download rel type",
	form: "method action enctype autocomplete target",
	button: "autofocus type",
	input: "accept disabled form list max maxlength min pattern required size step type",
	label: "accesskey for form",
	img: "src srcset",
	link: "rel type href media",
	iframe: "referrerpolicy src srcdoc sandbox",
	meta: "property content charset desc",
	optgroup: "label",
	option: "label",
	output: "for form",
	object: "type data width height",
	param: "name value",
	progress: "max",
	script: "src type async defer crossorigin integrity nonce language",
	select: "size form multiple",
	textarea: "rows cols",
	td: "colspan rowspan",
	th: "colspan rowspan"
};


Imba.HTML_PROPS = {
	input: "autofocus autocomplete autocorrect value placeholder required disabled multiple checked readOnly",
	textarea: "autofocus autocomplete autocorrect value placeholder required disabled multiple checked readOnly",
	form: "novalidate",
	fieldset: "disabled",
	button: "disabled",
	select: "autofocus disabled required",
	option: "disabled selected value",
	optgroup: "disabled",
	progress: "value",
	fieldset: "disabled",
	canvas: "width height"
};

var extender = function(obj,sup) {
	for (let v, i = 0, keys = Object.keys(sup), l = keys.length, k; i < l; i++){
		k = keys[i];v = sup[k];(obj[k] == null) ? (obj[k] = v) : obj[k];
	};
	
	obj.prototype = Object.create(sup.prototype);
	obj.__super__ = obj.prototype.__super__ = sup.prototype;
	obj.prototype.constructor = obj;
	if (sup.inherit) { sup.inherit(obj) };
	return obj;
};


function Tag(){
	return function(dom,ctx) {
		this.initialize(dom,ctx);
		return this;
	};
};

Imba.Tags = function Tags(){
	this;
};

Imba.Tags.prototype.__clone = function (ns){
	var clone = Object.create(this);
	clone._parent = this;
	return clone;
};

Imba.Tags.prototype.ns = function (name){
	return this['_' + name.toUpperCase()] || this.defineNamespace(name);
};

Imba.Tags.prototype.defineNamespace = function (name){
	var clone = Object.create(this);
	clone._parent = this;
	clone._ns = name;
	this['_' + name.toUpperCase()] = clone;
	return clone;
};

Imba.Tags.prototype.baseType = function (name,ns){
	return (Imba.indexOf(name,Imba.HTML_TAGS) >= 0) ? 'element' : 'div';
};

Imba.Tags.prototype.defineTag = function (fullName,supr,body){
	if(body==undefined && typeof supr == 'function') body = supr,supr = '';
	if(supr==undefined) supr = '';
	if (body && body._nodeType) {
		supr = body;
		body = null;
	};
	
	if (this[fullName]) {
		console.log("tag already exists?",fullName);
	};
	
	
	var ns;
	var name = fullName;
	let nsidx = name.indexOf(':');
	if (nsidx >= 0) {
		ns = fullName.substr(0,nsidx);
		name = fullName.substr(nsidx + 1);
		if (ns == 'svg' && !supr) {
			supr = 'svg:element';
		};
	};
	
	supr || (supr = this.baseType(fullName));
	
	let supertype = ((typeof supr=='string'||supr instanceof String)) ? this.findTagType(supr) : supr;
	let tagtype = Tag();
	
	tagtype._name = name;
	tagtype._flagName = null;
	
	if (name[0] == '#') {
		Imba.SINGLETONS[name.slice(1)] = tagtype;
		this[name] = tagtype;
	} else if (name[0] == name[0].toUpperCase()) {
		tagtype._flagName = name;
	} else {
		tagtype._flagName = "_" + fullName.replace(/[_\:]/g,'-');
		this[fullName] = tagtype;
	};
	
	extender(tagtype,supertype);
	
	if (body) {
		body.call(tagtype,tagtype,tagtype.TAGS || this);
		if (tagtype.defined) { tagtype.defined() };
		this.optimizeTag(tagtype);
	};
	return tagtype;
};

Imba.Tags.prototype.defineSingleton = function (name,supr,body){
	return this.defineTag(name,supr,body);
};

Imba.Tags.prototype.extendTag = function (name,supr,body){
	if(body==undefined && typeof supr == 'function') body = supr,supr = '';
	if(supr==undefined) supr = '';
	var klass = (((typeof name=='string'||name instanceof String)) ? this.findTagType(name) : name);
	
	if (body) { body && body.call(klass,klass,klass.prototype) };
	if (klass.extended) { klass.extended() };
	this.optimizeTag(klass);
	return klass;
};

Imba.Tags.prototype.optimizeTag = function (tagtype){
	var prototype_;
	return (prototype_ = tagtype.prototype) && prototype_.optimizeTagStructure  &&  prototype_.optimizeTagStructure();
};

Imba.Tags.prototype.findTagType = function (type){
	var attrs, props;
	let klass = this[type];
	if (!klass) {
		if (type.substr(0,4) == 'svg:') {
			klass = this.defineTag(type,'svg:element');
		} else if (Imba.HTML_TAGS.indexOf(type) >= 0) {
			klass = this.defineTag(type,'element');
			
			if (attrs = Imba.HTML_ATTRS[type]) {
				for (let i = 0, items = iter$(attrs.split(" ")), len = items.length; i < len; i++) {
					Imba.attr(klass,items[i]);
				};
			};
			
			if (props = Imba.HTML_PROPS[type]) {
				for (let i = 0, items = iter$(props.split(" ")), len = items.length; i < len; i++) {
					Imba.attr(klass,items[i],{dom: true});
				};
			};
		};
	};
	return klass;
};

Imba.createElement = function (name,ctx,ref,pref){
	var type = name;
	var parent;
	if (name instanceof Function) {
		type = name;
	} else {
		if (null) {};
		type = Imba.TAGS.findTagType(name);
	};
	
	if (ctx instanceof TagMap) {
		parent = ctx.par$;
	} else if (pref instanceof Imba.Tag) {
		parent = pref;
	} else {
		parent = (ctx && pref != undefined) ? ctx[pref] : ((ctx && ctx._tag || ctx));
	};
	
	var node = type.build(parent);
	
	if (ctx instanceof TagMap) {
		ctx.i$++;
		node.$key = ref;
	};
	
	if (ctx && ref != undefined) {
		ctx[ref] = node;
	};
	
	return node;
};

Imba.createTagCache = function (owner){
	var item = [];
	item._tag = owner;
	return item;
	
	var par = ((this.pref() != undefined) ? this.ctx()[this.pref()] : this.ctx()._tag);
	var node = new TagMap(this.ctx(),this.ref(),par);
	this.ctx()[this.ref()] = node;
	return node;
};

Imba.createTagMap = function (ctx,ref,pref){
	var par = ((pref != undefined) ? pref : ctx._tag);
	var node = new TagMap(ctx,ref,par);
	ctx[ref] = node;
	return node;
};

Imba.createTagList = function (ctx,ref,pref){
	var node = [];
	node._type = 4;
	node._tag = ((pref != undefined) ? pref : ctx._tag);
	ctx[ref] = node;
	return node;
};

Imba.createTagLoopResult = function (ctx,ref,pref){
	var node = [];
	node._type = 5;
	node.cache = {i$: 0};
	return node;
};


function TagCache(owner){
	this._tag = owner;
	this;
};
TagCache.build = function (owner){
	var item = [];
	item._tag = owner;
	return item;
};



function TagMap(cache,ref,par){
	this.cache$ = cache;
	this.key$ = ref;
	this.par$ = par;
	this.i$ = 0;
};

TagMap.prototype.$iter = function (){
	var item = [];
	item._type = 5;
	item.cache = this;
	return item;
};

TagMap.prototype.$prune = function (items){
	let cache = this.cache$;
	let key = this.key$;
	let clone = new TagMap(cache,key,this.par$);
	for (let i = 0, ary = iter$(items), len = ary.length, item; i < len; i++) {
		item = ary[i];
		clone[item.key$] = item;
	};
	clone.i$ = items.length;
	return cache[key] = clone;
};

Imba.TagMap = TagMap;
Imba.TagCache = TagCache;
Imba.SINGLETONS = {};
Imba.TAGS = new Imba.Tags();
Imba.TAGS.element = Imba.TAGS.htmlelement = Imba.Tag;
Imba.TAGS['svg:element'] = Imba.SVGTag;

Imba.defineTag = function (name,supr,body){
	if(body==undefined && typeof supr == 'function') body = supr,supr = '';
	if(supr==undefined) supr = '';
	return Imba.TAGS.defineTag(name,supr,body);
};

Imba.defineSingletonTag = function (id,supr,body){
	if(body==undefined && typeof supr == 'function') body = supr,supr = 'div';
	if(supr==undefined) supr = 'div';
	return Imba.TAGS.defineTag(this.name(),supr,body);
};

Imba.extendTag = function (name,body){
	return Imba.TAGS.extendTag(name,body);
};

Imba.getTagSingleton = function (id){
	var klass;
	var dom,node;
	
	if (klass = Imba.SINGLETONS[id]) {
		if (klass && klass.Instance) { return klass.Instance };
		
		
		if (dom = Imba.document().getElementById(id)) {
			// we have a live instance - when finding it through a selector we should awake it, no?
			// console.log('creating the singleton from existing node in dom?',id,type)
			node = klass.Instance = new klass(dom);
			node.awaken(dom); 
			return node;
		};
		
		dom = klass.createNode();
		dom.id = id;
		node = klass.Instance = new klass(dom);
		node.end().awaken(dom);
		return node;
	} else if (dom = Imba.document().getElementById(id)) {
		return Imba.getTagForDom(dom);
	};
};

var svgSupport = typeof SVGElement !== 'undefined';


Imba.getTagForDom = function (dom){
	if (!dom) { return null };
	if (dom._dom) { return dom };
	if (dom._tag) { return dom._tag };
	if (!dom.nodeName) { return null };
	
	var name = dom.nodeName.toLowerCase();
	var type = name;
	var ns = Imba.TAGS;
	
	if (dom.id && Imba.SINGLETONS[dom.id]) {
		return Imba.getTagSingleton(dom.id);
	};
	
	if (svgSupport && (dom instanceof SVGElement)) {
		type = ns.findTagType("svg:" + name);
	} else if (Imba.HTML_TAGS.indexOf(name) >= 0) {
		type = ns.findTagType(name);
	} else {
		type = Imba.Tag;
	};
	
	return new type(dom,null).awaken(dom);
};


if (false) {
	var styles = window.getComputedStyle(document.documentElement,'');
	
	for (let i = 0, items = iter$(styles), len = items.length, prefixed; i < len; i++) {
		prefixed = items[i];
		var unprefixed = prefixed.replace(/^-(webkit|ms|moz|o|blink)-/,'');
		var camelCase = unprefixed.replace(/-(\w)/g,function(m,a) { return a.toUpperCase(); });
		
		
		if (prefixed != unprefixed) {
			if (styles.hasOwnProperty(unprefixed)) { continue; };
		};
		
		
		Imba.CSSKeyMap[unprefixed] = Imba.CSSKeyMap[camelCase] = prefixed;
	};
	
	
	if (!document.documentElement.classList) {
		Imba.extendTag('element', function(tag){
			
			tag.prototype.hasFlag = function (ref){
				return new RegExp('(^|\\s)' + ref + '(\\s|$)').test(this._dom.className);
			};
			
			tag.prototype.addFlag = function (ref){
				if (this.hasFlag(ref)) { return this };
				this._dom.className += (this._dom.className ? ' ' : '') + ref;
				return this;
			};
			
			tag.prototype.unflag = function (ref){
				if (!this.hasFlag(ref)) { return this };
				var regex = new RegExp('(^|\\s)*' + ref + '(\\s|$)*','g');
				this._dom.className = this._dom.className.replace(regex,'');
				return this;
			};
			
			tag.prototype.toggleFlag = function (ref){
				return this.hasFlag(ref) ? this.unflag(ref) : this.flag(ref);
			};
			
			tag.prototype.flag = function (ref,bool){
				if (arguments.length == 2 && !!bool === false) {
					return this.unflag(ref);
				};
				return this.addFlag(ref);
			};
		});
	};
};

Imba.Tag;


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);

Imba.defineTag('fragment', 'element', function(tag){
	tag.createNode = function (){
		return Imba.document().createDocumentFragment();
	};
});

Imba.extendTag('html', function(tag){
	tag.prototype.parent = function (){
		return null;
	};
});

Imba.extendTag('canvas', function(tag){
	tag.prototype.context = function (type){
		if(type === undefined) type = '2d';
		return this.dom().getContext(type);
	};
});

function DataProxy(node,path,args){
	this._node = node;
	this._path = path;
	this._args = args;
	if (this._args) { this._setter = Imba.toSetter(this._path) };
};

DataProxy.bind = function (receiver,data,path,args){
	let proxy = receiver._data || (receiver._data = new this(receiver,path,args));
	proxy.bind(data,path,args);
	return receiver;
};

DataProxy.prototype.bind = function (data,key,args){
	if (data != this._data) {
		this._data = data;
	};
	return this;
};

DataProxy.prototype.getFormValue = function (){
	return this._setter ? this._data[this._path]() : this._data[this._path];
};

DataProxy.prototype.setFormValue = function (value){
	return this._setter ? this._data[this._setter](value) : ((this._data[this._path] = value));
};


var isArray = function(val) {
	return val && val.splice && val.sort;
};

var isSimilarArray = function(a,b) {
	let l = a.length,i = 0;
	if (l != b.length) { return false };
	while (i++ < l){
		if (a[i] != b[i]) { return false };
	};
	return true;
};

Imba.extendTag('input', function(tag){
	tag.prototype.lazy = function(v){ return this._lazy; }
	tag.prototype.setLazy = function(v){ this._lazy = v; return this; };
	tag.prototype.number = function(v){ return this._number; }
	tag.prototype.setNumber = function(v){ this._number = v; return this; };
	
	tag.prototype.bindData = function (target,path,args){
		DataProxy.bind(this,target,path,args);
		return this;
	};
	
	tag.prototype.checked = function (){
		return this._dom.checked;
	};
	
	tag.prototype.setChecked = function (value){
		if (!!value != this._dom.checked) {
			this._dom.checked = !!value;
		};
		return this;
	};
	
	tag.prototype.setValue = function (value,source){
		if (this._localValue == undefined || source == undefined) {
			this.dom().value = this._value = value;
			this._localValue = undefined;
		};
		return this;
	};
	
	tag.prototype.setType = function (value){
		this.dom().type = this._type = value;
		return this;
	};
	
	tag.prototype.value = function (){
		let val = this._dom.value;
		return (this._number && val) ? parseFloat(val) : val;
	};
	
	tag.prototype.oninput = function (e){
		let val = this._dom.value;
		this._localValue = val;
		if (this._data && !(this.lazy())) { return this._data.setFormValue(this.value(),this) };
	};
	
	tag.prototype.onchange = function (e){
		this._modelValue = this._localValue = undefined;
		if (!(this.data())) { return };
		
		if (this.type() == 'radio' || this.type() == 'checkbox') {
			let checked = this._dom.checked;
			let mval = this._data.getFormValue(this);
			let dval = (this._value != undefined) ? this._value : this.value();
			
			if (this.type() == 'radio') {
				return this._data.setFormValue(dval,this);
			} else if (this.dom().value == 'on') {
				return this._data.setFormValue(!!checked,this);
			} else if (isArray(mval)) {
				let idx = mval.indexOf(dval);
				if (checked && idx == -1) {
					return mval.push(dval);
				} else if (!checked && idx >= 0) {
					return mval.splice(idx,1);
				};
			} else {
				return this._data.setFormValue(dval,this);
			};
		} else {
			return this._data.setFormValue(this.value());
		};
	};
	
	tag.prototype.onblur = function (e){
		return this._localValue = undefined;
	};
	
	
	tag.prototype.end = function (){
		if (this._localValue !== undefined || !this._data) {
			return this;
		};
		
		let mval = this._data.getFormValue(this);
		if (mval == this._modelValue) { return this };
		if (!isArray(mval)) { this._modelValue = mval };
		
		if (this.type() == 'radio' || this.type() == 'checkbox') {
			let dval = this._value;
			let checked = isArray(mval) ? (
				mval.indexOf(dval) >= 0
			) : ((this.dom().value == 'on') ? (
				!!mval
			) : (
				mval == this._value
			));
			
			this._dom.checked = checked;
		} else {
			this._dom.value = mval;
		};
		return this;
	};
});

Imba.extendTag('textarea', function(tag){
	tag.prototype.lazy = function(v){ return this._lazy; }
	tag.prototype.setLazy = function(v){ this._lazy = v; return this; };
	
	tag.prototype.bindData = function (target,path,args){
		DataProxy.bind(this,target,path,args);
		return this;
	};
	
	tag.prototype.setValue = function (value,source){
		if (this._localValue == undefined || source == undefined) {
			this.dom().value = value;
			this._localValue = undefined;
		};
		return this;
	};
	
	tag.prototype.oninput = function (e){
		let val = this._dom.value;
		this._localValue = val;
		if (this._data && !(this.lazy())) { return this._data.setFormValue(this.value(),this) };
	};
	
	tag.prototype.onchange = function (e){
		this._localValue = undefined;
		if (this._data) { return this._data.setFormValue(this.value(),this) };
	};
	
	tag.prototype.onblur = function (e){
		return this._localValue = undefined;
	};
	
	tag.prototype.render = function (){
		if (this._localValue != undefined || !this._data) { return };
		if (this._data) {
			let dval = this._data.getFormValue(this);
			this._dom.value = (dval != undefined) ? dval : '';
		};
		return this;
	};
});

Imba.extendTag('option', function(tag){
	tag.prototype.setValue = function (value){
		if (value != this._value) {
			this.dom().value = this._value = value;
		};
		return this;
	};
	
	tag.prototype.value = function (){
		return this._value || this.dom().value;
	};
});

Imba.extendTag('select', function(tag){
	tag.prototype.bindData = function (target,path,args){
		DataProxy.bind(this,target,path,args);
		return this;
	};
	
	tag.prototype.setValue = function (value,syncing){
		let prev = this._value;
		this._value = value;
		if (!syncing) { this.syncValue(value) };
		return this;
	};
	
	tag.prototype.syncValue = function (value){
		let prev = this._syncValue;
		
		if (this.multiple() && (value instanceof Array)) {
			if ((prev instanceof Array) && isSimilarArray(prev,value)) {
				return this;
			};
			
			value = value.slice();
		};
		
		this._syncValue = value;
		
		if (typeof value == 'object') {
			let mult = this.multiple() && (value instanceof Array);
			
			for (let i = 0, items = iter$(this.dom().options), len = items.length, opt; i < len; i++) {
				opt = items[i];
				let oval = (opt._tag ? opt._tag.value() : opt.value);
				if (mult) {
					opt.selected = value.indexOf(oval) >= 0;
				} else if (value == oval) {
					this.dom().selectedIndex = i;
					break;
				};
			};
		} else {
			this.dom().value = value;
		};
		return this;
	};
	
	tag.prototype.value = function (){
		if (this.multiple()) {
			let res = [];
			for (let i = 0, items = iter$(this.dom().selectedOptions), len = items.length, option; i < len; i++) {
				option = items[i];
				res.push(option._tag ? option._tag.value() : option.value);
			};
			return res;
		} else {
			let opt = this.dom().selectedOptions[0];
			return opt ? ((opt._tag ? opt._tag.value() : opt.value)) : null;
		};
	};
	
	tag.prototype.onchange = function (e){
		if (this._data) { return this._data.setFormValue(this.value(),this) };
	};
	
	tag.prototype.end = function (){
		if (this._data) {
			this.setValue(this._data.getFormValue(this),1);
		};
		
		if (this._value != this._syncValue) {
			this.syncValue(this._value);
		};
		return this;
	};
});


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);










Imba.Touch = function Touch(event,pointer){
	// @native  = false
	this.setEvent(event);
	this.setData({});
	this.setActive(true);
	this._button = event && event.button || 0;
	this._suppress = false; 
	this._captured = false;
	this.setBubble(false);
	pointer = pointer;
	this.setUpdates(0);
	return this;
};

Imba.Touch.LastTimestamp = 0;
Imba.Touch.TapTimeout = 50;



var touches = [];
var count = 0;
var identifiers = {};

Imba.Touch.count = function (){
	return count;
};

Imba.Touch.lookup = function (item){
	return item && (item.__touch__ || identifiers[item.identifier]);
};

Imba.Touch.release = function (item,touch){
	var v_, $1;
	(((v_ = identifiers[item.identifier]),delete identifiers[item.identifier], v_));
	((($1 = item.__touch__),delete item.__touch__, $1));
	return;
};

Imba.Touch.ontouchstart = function (e){
	for (let i = 0, items = iter$(e.changedTouches), len = items.length, t; i < len; i++) {
		t = items[i];
		if (this.lookup(t)) { continue; };
		var touch = identifiers[t.identifier] = new this(e); 
		t.__touch__ = touch;
		touches.push(touch);
		count++;
		touch.touchstart(e,t);
	};
	return this;
};

Imba.Touch.ontouchmove = function (e){
	var touch;
	for (let i = 0, items = iter$(e.changedTouches), len = items.length, t; i < len; i++) {
		t = items[i];
		if (touch = this.lookup(t)) {
			touch.touchmove(e,t);
		};
	};
	
	return this;
};

Imba.Touch.ontouchend = function (e){
	var touch;
	for (let i = 0, items = iter$(e.changedTouches), len = items.length, t; i < len; i++) {
		t = items[i];
		if (touch = this.lookup(t)) {
			touch.touchend(e,t);
			this.release(t,touch);
			count--;
		};
	};
	
	
	
	
	return this;
};

Imba.Touch.ontouchcancel = function (e){
	var touch;
	for (let i = 0, items = iter$(e.changedTouches), len = items.length, t; i < len; i++) {
		t = items[i];
		if (touch = this.lookup(t)) {
			touch.touchcancel(e,t);
			this.release(t,touch);
			count--;
		};
	};
	return this;
};

Imba.Touch.onmousedown = function (e){
	return this;
};

Imba.Touch.onmousemove = function (e){
	return this;
};

Imba.Touch.onmouseup = function (e){
	return this;
};


Imba.Touch.prototype.phase = function(v){ return this._phase; }
Imba.Touch.prototype.setPhase = function(v){ this._phase = v; return this; };
Imba.Touch.prototype.active = function(v){ return this._active; }
Imba.Touch.prototype.setActive = function(v){ this._active = v; return this; };
Imba.Touch.prototype.event = function(v){ return this._event; }
Imba.Touch.prototype.setEvent = function(v){ this._event = v; return this; };
Imba.Touch.prototype.pointer = function(v){ return this._pointer; }
Imba.Touch.prototype.setPointer = function(v){ this._pointer = v; return this; };
Imba.Touch.prototype.target = function(v){ return this._target; }
Imba.Touch.prototype.setTarget = function(v){ this._target = v; return this; };
Imba.Touch.prototype.handler = function(v){ return this._handler; }
Imba.Touch.prototype.setHandler = function(v){ this._handler = v; return this; };
Imba.Touch.prototype.updates = function(v){ return this._updates; }
Imba.Touch.prototype.setUpdates = function(v){ this._updates = v; return this; };
Imba.Touch.prototype.suppress = function(v){ return this._suppress; }
Imba.Touch.prototype.setSuppress = function(v){ this._suppress = v; return this; };
Imba.Touch.prototype.data = function(v){ return this._data; }
Imba.Touch.prototype.setData = function(v){ this._data = v; return this; };
Imba.Touch.prototype.__bubble = {chainable: true,name: 'bubble'};
Imba.Touch.prototype.bubble = function(v){ return v !== undefined ? (this.setBubble(v),this) : this._bubble; }
Imba.Touch.prototype.setBubble = function(v){ this._bubble = v; return this; };
Imba.Touch.prototype.timestamp = function(v){ return this._timestamp; }
Imba.Touch.prototype.setTimestamp = function(v){ this._timestamp = v; return this; };

Imba.Touch.prototype.gestures = function(v){ return this._gestures; }
Imba.Touch.prototype.setGestures = function(v){ this._gestures = v; return this; };



Imba.Touch.prototype.capture = function (){
	this._captured = true;
	this._event && this._event.stopPropagation();
	if (!this._selblocker) {
		this._selblocker = function(e) { return e.preventDefault(); };
		Imba.document().addEventListener('selectstart',this._selblocker,true);
	};
	return this;
};

Imba.Touch.prototype.isCaptured = function (){
	return !!this._captured;
};



Imba.Touch.prototype.extend = function (plugin){
	// console.log "added gesture!!!"
	this._gestures || (this._gestures = []);
	this._gestures.push(plugin);
	return this;
};



Imba.Touch.prototype.redirect = function (target){
	this._redirect = target;
	return this;
};



Imba.Touch.prototype.suppress = function (){
	// collision with the suppress property
	this._active = false;
	
	return this;
};

Imba.Touch.prototype.setSuppress = function (value){
	console.warn('Imba.Touch#suppress= is deprecated');
	this._supress = value;
	this;
	return this;
};

Imba.Touch.prototype.touchstart = function (e,t){
	this._event = e;
	this._touch = t;
	this._button = 0;
	this._x = t.clientX;
	this._y = t.clientY;
	this.began();
	this.update();
	if (e && this.isCaptured()) { e.preventDefault() };
	return this;
};

Imba.Touch.prototype.touchmove = function (e,t){
	this._event = e;
	this._x = t.clientX;
	this._y = t.clientY;
	this.update();
	if (e && this.isCaptured()) { e.preventDefault() };
	return this;
};

Imba.Touch.prototype.touchend = function (e,t){
	this._event = e;
	this._x = t.clientX;
	this._y = t.clientY;
	this.ended();
	
	Imba.Touch.LastTimestamp = e.timeStamp;
	
	if (this._maxdr < 20) {
		var tap = new Imba.Event(e);
		tap.setType('tap');
		tap.process();
		if (tap._responder) { e.preventDefault() };
	};
	
	if (e && this.isCaptured()) {
		e.preventDefault();
	};
	
	return this;
};

Imba.Touch.prototype.touchcancel = function (e,t){
	return this.cancel();
};

Imba.Touch.prototype.mousedown = function (e,t){
	var self = this;
	self._event = e;
	self._button = e.button;
	self._x = t.clientX;
	self._y = t.clientY;
	self.began();
	self.update();
	self._mousemove = function(e) { return self.mousemove(e,e); };
	Imba.document().addEventListener('mousemove',self._mousemove,true);
	return self;
};

Imba.Touch.prototype.mousemove = function (e,t){
	this._x = t.clientX;
	this._y = t.clientY;
	this._event = e;
	if (this.isCaptured()) { e.preventDefault() };
	this.update();
	this.move();
	return this;
};

Imba.Touch.prototype.mouseup = function (e,t){
	this._x = t.clientX;
	this._y = t.clientY;
	this.ended();
	return this;
};

Imba.Touch.prototype.idle = function (){
	return this.update();
};

Imba.Touch.prototype.began = function (){
	this._timestamp = Date.now();
	this._maxdr = this._dr = 0;
	this._x0 = this._x;
	this._y0 = this._y;
	
	var dom = this.event().target;
	var node = null;
	
	this._sourceTarget = dom && Imba.getTagForDom(dom);
	
	while (dom){
		node = Imba.getTagForDom(dom);
		if (node && node.ontouchstart) {
			this._bubble = false;
			this.setTarget(node);
			this.target().ontouchstart(this);
			if (!this._bubble) { break; };
		};
		dom = dom.parentNode;
	};
	
	this._updates++;
	return this;
};

Imba.Touch.prototype.update = function (){
	var target_;
	if (!this._active || this._cancelled) { return this };
	
	var dr = Math.sqrt(this.dx() * this.dx() + this.dy() * this.dy());
	if (dr > this._dr) { this._maxdr = dr };
	this._dr = dr;
	
	
	if (this._redirect) {
		if (this._target && this._target.ontouchcancel) {
			this._target.ontouchcancel(this);
		};
		this.setTarget(this._redirect);
		this._redirect = null;
		if (this.target().ontouchstart) { this.target().ontouchstart(this) };
		if (this._redirect) { return this.update() }; 
	};
	
	
	this._updates++;
	if (this._gestures) {
		for (let i = 0, items = iter$(this._gestures), len = items.length; i < len; i++) {
			items[i].ontouchupdate(this);
		};
	};
	
	(target_ = this.target()) && target_.ontouchupdate  &&  target_.ontouchupdate(this);
	if (this._redirect) this.update();
	return this;
};

Imba.Touch.prototype.move = function (){
	var target_;
	if (!this._active || this._cancelled) { return this };
	
	if (this._gestures) {
		for (let i = 0, items = iter$(this._gestures), len = items.length, g; i < len; i++) {
			g = items[i];
			if (g.ontouchmove) { g.ontouchmove(this,this._event) };
		};
	};
	
	(target_ = this.target()) && target_.ontouchmove  &&  target_.ontouchmove(this,this._event);
	return this;
};

Imba.Touch.prototype.ended = function (){
	var target_;
	if (!this._active || this._cancelled) { return this };
	
	this._updates++;
	
	if (this._gestures) {
		for (let i = 0, items = iter$(this._gestures), len = items.length; i < len; i++) {
			items[i].ontouchend(this);
		};
	};
	
	(target_ = this.target()) && target_.ontouchend  &&  target_.ontouchend(this);
	this.cleanup_();
	return this;
};

Imba.Touch.prototype.cancel = function (){
	if (!this._cancelled) {
		this._cancelled = true;
		this.cancelled();
		this.cleanup_();
	};
	return this;
};

Imba.Touch.prototype.cancelled = function (){
	var target_;
	if (!this._active) { return this };
	
	this._cancelled = true;
	this._updates++;
	
	if (this._gestures) {
		for (let i = 0, items = iter$(this._gestures), len = items.length, g; i < len; i++) {
			g = items[i];
			if (g.ontouchcancel) { g.ontouchcancel(this) };
		};
	};
	
	(target_ = this.target()) && target_.ontouchcancel  &&  target_.ontouchcancel(this);
	return this;
};

Imba.Touch.prototype.cleanup_ = function (){
	if (this._mousemove) {
		Imba.document().removeEventListener('mousemove',this._mousemove,true);
		this._mousemove = null;
	};
	
	if (this._selblocker) {
		Imba.document().removeEventListener('selectstart',this._selblocker,true);
		this._selblocker = null;
	};
	
	return this;
};



Imba.Touch.prototype.dr = function (){
	return this._dr;
};



Imba.Touch.prototype.dx = function (){
	return this._x - this._x0;
};



Imba.Touch.prototype.dy = function (){
	return this._y - this._y0;
};



Imba.Touch.prototype.x0 = function (){
	return this._x0;
};



Imba.Touch.prototype.y0 = function (){
	return this._y0;
};



Imba.Touch.prototype.x = function (){
	return this._x;
};



Imba.Touch.prototype.y = function (){
	return this._y;
};



Imba.Touch.prototype.tx = function (){
	this._targetBox || (this._targetBox = this._target.dom().getBoundingClientRect());
	return this._x - this._targetBox.left;
};



Imba.Touch.prototype.ty = function (){
	this._targetBox || (this._targetBox = this._target.dom().getBoundingClientRect());
	return this._y - this._targetBox.top;
};



Imba.Touch.prototype.button = function (){
	return this._button;
}; 

Imba.Touch.prototype.sourceTarget = function (){
	return this._sourceTarget;
};

Imba.Touch.prototype.elapsed = function (){
	return Date.now() - this._timestamp;
};


Imba.TouchGesture = function TouchGesture(){ };

Imba.TouchGesture.prototype.__active = {'default': false,name: 'active'};
Imba.TouchGesture.prototype.active = function(v){ return this._active; }
Imba.TouchGesture.prototype.setActive = function(v){ this._active = v; return this; }
Imba.TouchGesture.prototype._active = false;

Imba.TouchGesture.prototype.ontouchstart = function (e){
	return this;
};

Imba.TouchGesture.prototype.ontouchupdate = function (e){
	return this;
};

Imba.TouchGesture.prototype.ontouchend = function (e){
	return this;
};



/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);

var keyCodes = {
	esc: 27,
	tab: 9,
	enter: 13,
	space: 32,
	up: 38,
	down: 40
};

var el = Imba.Tag.prototype;
el.stopModifier = function (e){
	return e.stop() || true;
};
el.preventModifier = function (e){
	return e.prevent() || true;
};
el.silenceModifier = function (e){
	return e.silence() || true;
};
el.bubbleModifier = function (e){
	return e.bubble(true) || true;
};
el.ctrlModifier = function (e){
	return e.event().ctrlKey == true;
};
el.altModifier = function (e){
	return e.event().altKey == true;
};
el.shiftModifier = function (e){
	return e.event().shiftKey == true;
};
el.metaModifier = function (e){
	return e.event().metaKey == true;
};
el.keyModifier = function (key,e){
	return e.keyCode() ? ((e.keyCode() == key)) : true;
};
el.delModifier = function (e){
	return e.keyCode() ? ((e.keyCode() == 8 || e.keyCode() == 46)) : true;
};
el.selfModifier = function (e){
	return e.event().target == this._dom;
};
el.leftModifier = function (e){
	return (e.button() != undefined) ? ((e.button() === 0)) : el.keyModifier(37,e);
};
el.rightModifier = function (e){
	return (e.button() != undefined) ? ((e.button() === 2)) : el.keyModifier(39,e);
};
el.middleModifier = function (e){
	return (e.button() != undefined) ? ((e.button() === 1)) : true;
};

el.getHandler = function (str,event){
	if (this[str]) { return this };
};



Imba.Event = function Event(e){
	this.setEvent(e);
	this._bubble = true;
};



Imba.Event.prototype.event = function(v){ return this._event; }
Imba.Event.prototype.setEvent = function(v){ this._event = v; return this; };

Imba.Event.prototype.prefix = function(v){ return this._prefix; }
Imba.Event.prototype.setPrefix = function(v){ this._prefix = v; return this; };

Imba.Event.prototype.source = function(v){ return this._source; }
Imba.Event.prototype.setSource = function(v){ this._source = v; return this; };

Imba.Event.prototype.data = function(v){ return this._data; }
Imba.Event.prototype.setData = function(v){ this._data = v; return this; };

Imba.Event.prototype.responder = function(v){ return this._responder; }
Imba.Event.prototype.setResponder = function(v){ this._responder = v; return this; };

Imba.Event.wrap = function (e){
	return new this(e);
};

Imba.Event.prototype.setType = function (type){
	this._type = type;
	this;
	return this;
};



Imba.Event.prototype.type = function (){
	return this._type || this.event().type;
};
Imba.Event.prototype.native = function (){
	return this._event;
};

Imba.Event.prototype.name = function (){
	return this._name || (this._name = this.type().toLowerCase().replace(/\:/g,''));
};


Imba.Event.prototype.bubble = function (v){
	if (v != undefined) {
		this.setBubble(v);
		return this;
	};
	return this._bubble;
};

Imba.Event.prototype.setBubble = function (v){
	this._bubble = v;
	return this;
	return this;
};



Imba.Event.prototype.stop = function (){
	this.setBubble(false);
	return this;
};

Imba.Event.prototype.stopPropagation = function (){
	return this.stop();
};
Imba.Event.prototype.halt = function (){
	return this.stop();
};


Imba.Event.prototype.prevent = function (){
	if (this.event().preventDefault) {
		this.event().preventDefault();
	} else {
		this.event().defaultPrevented = true;
	};
	this.defaultPrevented = true;
	return this;
};

Imba.Event.prototype.preventDefault = function (){
	console.warn("Event#preventDefault is deprecated - use Event#prevent");
	return this.prevent();
};



Imba.Event.prototype.isPrevented = function (){
	return this.event() && this.event().defaultPrevented;
};



Imba.Event.prototype.cancel = function (){
	console.warn("Event#cancel is deprecated - use Event#prevent");
	return this.prevent();
};

Imba.Event.prototype.silence = function (){
	this._silenced = true;
	return this;
};

Imba.Event.prototype.isSilenced = function (){
	return !!this._silenced;
};



Imba.Event.prototype.target = function (){
	return Imba.getTagForDom(this.event()._target || this.event().target);
};



Imba.Event.prototype.responder = function (){
	return this._responder;
};



Imba.Event.prototype.redirect = function (node){
	this._redirect = node;
	return this;
};

Imba.Event.prototype.processHandlers = function (node,handlers){
	let i = 1;
	let l = handlers.length;
	let bubble = this._bubble;
	let state = handlers.state || (handlers.state = {});
	let result;
	
	if (bubble) {
		this._bubble = 1;
	};
	
	while (i < l){
		let isMod = false;
		let handler = handlers[i++];
		let params = null;
		let context = node;
		
		if (handler instanceof Array) {
			params = handler.slice(1);
			handler = handler[0];
		};
		
		if (typeof handler == 'string') {
			if (keyCodes[handler]) {
				params = [keyCodes[handler]];
				handler = 'key';
			};
			
			let mod = handler + 'Modifier';
			
			if (node[mod]) {
				isMod = true;
				params = (params || []).concat([this,state]);
				handler = node[mod];
			};
		};
		
		
		
		if (typeof handler == 'string') {
			let el = node;
			let fn = null;
			let ctx = state.context;
			
			if (ctx) {
				if (ctx.getHandler instanceof Function) {
					ctx = ctx.getHandler(handler,this);
				};
				
				if (ctx[handler] instanceof Function) {
					handler = fn = ctx[handler];
					context = ctx;
				};
			};
			
			if (!fn) {
				console.warn(("event " + this.type() + ": could not find '" + handler + "' in context"),ctx);
			};
			
			
			
			
			
			
			
			
			
			
			
		};
		
		if (handler instanceof Function) {
			// what if we actually call stop inside function?
			// do we still want to continue the chain?
			let res = handler.apply(context,params || [this]);
			
			if (!isMod) {
				this._responder || (this._responder = node);
			};
			
			if (res == false) {
				// console.log "returned false - breaking"
				break;
			};
			
			if (res && !this._silenced && (res.then instanceof Function)) {
				res.then(Imba.commit);
			};
		};
	};
	
	
	if (this._bubble === 1) {
		this._bubble = bubble;
	};
	
	return null;
};

Imba.Event.prototype.process = function (){
	var name = this.name();
	var meth = ("on" + (this._prefix || '') + name);
	var args = null;
	var domtarget = this.event()._target || this.event().target;
	var domnode = domtarget._responder || domtarget;
	
	var result;
	var handlers;
	
	while (domnode){
		this._redirect = null;
		let node = domnode._dom ? domnode : domnode._tag;
		
		if (node) {
			if (handlers = node._on_) {
				for (let i = 0, items = iter$(handlers), len = items.length, handler; i < len; i++) {
					handler = items[i];
					if (!handler) { continue; };
					let hname = handler[0];
					if (name == handler[0] && this.bubble()) {
						this.processHandlers(node,handler);
					};
				};
				if (!(this.bubble())) { break; };
			};
			
			if (this.bubble() && (node[meth] instanceof Function)) {
				this._responder || (this._responder = node);
				this._silenced = false;
				result = args ? node[meth].apply(node,args) : node[meth](this,this.data());
			};
			
			if (node.onevent) {
				node.onevent(this);
			};
		};
		
		
		if (!(this.bubble() && (domnode = (this._redirect || (node ? node.parent() : domnode.parentNode))))) {
			break;
		};
	};
	
	this.processed();
	
	
	
	if (result && (result.then instanceof Function)) {
		result.then(this.processed.bind(this));
	};
	return this;
};


Imba.Event.prototype.processed = function (){
	if (!this._silenced && this._responder) {
		Imba.emit(Imba,'event',[this]);
		Imba.commit(this.event());
	};
	return this;
};



Imba.Event.prototype.x = function (){
	return this.native().x;
};



Imba.Event.prototype.y = function (){
	return this.native().y;
};

Imba.Event.prototype.button = function (){
	return this.native().button;
};
Imba.Event.prototype.keyCode = function (){
	return this.native().keyCode;
};
Imba.Event.prototype.ctrl = function (){
	return this.native().ctrlKey;
};
Imba.Event.prototype.alt = function (){
	return this.native().altKey;
};
Imba.Event.prototype.shift = function (){
	return this.native().shiftKey;
};
Imba.Event.prototype.meta = function (){
	return this.native().metaKey;
};
Imba.Event.prototype.key = function (){
	return this.native().key;
};



Imba.Event.prototype.which = function (){
	return this.event().which;
};



/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var self = {};
// externs;

var Imba = __webpack_require__(1);

var removeNested = function(root,node,caret) {
	// if node/nodes isa String
	// 	we need to use the caret to remove elements
	// 	for now we will simply not support this
	if (node instanceof Array) {
		for (let i = 0, items = iter$(node), len = items.length; i < len; i++) {
			removeNested(root,items[i],caret);
		};
	} else if (node && node._slot_) {
		root.removeChild(node);
	} else if (node != null) {
		// what if this is not null?!?!?
		// take a chance and remove a text-elementng
		let next = caret ? caret.nextSibling : root._dom.firstChild;
		if ((next instanceof Text) && next.textContent == node) {
			root.removeChild(next);
		} else {
			throw 'cannot remove string';
		};
	};
	
	return caret;
};

var appendNested = function(root,node) {
	if (node instanceof Array) {
		let i = 0;
		let c = node.taglen;
		let k = (c != null) ? ((node.domlen = c)) : node.length;
		while (i < k){
			appendNested(root,node[i++]);
		};
	} else if (node && node._dom) {
		root.appendChild(node);
	} else if (node != null && node !== false) {
		root.appendChild(Imba.createTextNode(node));
	};
	
	return;
};






var insertNestedBefore = function(root,node,before) {
	if (node instanceof Array) {
		let i = 0;
		let c = node.taglen;
		let k = (c != null) ? ((node.domlen = c)) : node.length;
		while (i < k){
			insertNestedBefore(root,node[i++],before);
		};
	} else if (node && node._dom) {
		root.insertBefore(node,before);
	} else if (node != null && node !== false) {
		root.insertBefore(Imba.createTextNode(node),before);
	};
	
	return before;
};


self.insertNestedAfter = function (root,node,after){
	var before = after ? after.nextSibling : root._dom.firstChild;
	
	if (before) {
		insertNestedBefore(root,node,before);
		return before.previousSibling;
	} else {
		appendNested(root,node);
		return root._dom.lastChild;
	};
};

var reconcileCollectionChanges = function(root,new$,old,caret) {
	
	var newLen = new$.length;
	var lastNew = new$[newLen - 1];
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	var newPosition = [];
	
	
	var prevChain = [];
	
	var lengthChain = [];
	
	
	var maxChainLength = 0;
	var maxChainEnd = 0;
	
	var hasTextNodes = false;
	var newPos;
	
	for (let idx = 0, items = iter$(old), len = items.length, node; idx < len; idx++) {
		// special case for Text nodes
		node = items[idx];
		if (node && node.nodeType == 3) {
			newPos = new$.indexOf(node.textContent);
			if (newPos >= 0) { new$[newPos] = node };
			hasTextNodes = true;
		} else {
			newPos = new$.indexOf(node);
		};
		
		newPosition.push(newPos);
		
		if (newPos == -1) {
			root.removeChild(node);
			prevChain.push(-1);
			lengthChain.push(-1);
			continue;
		};
		
		var prevIdx = newPosition.length - 2;
		
		
		while (prevIdx >= 0){
			if (newPosition[prevIdx] == -1) {
				prevIdx--;
			} else if (newPos > newPosition[prevIdx]) {
				// Yay, we're bigger than the previous!
				break;
			} else {
				// Nope, let's walk back the chain
				prevIdx = prevChain[prevIdx];
			};
		};
		
		prevChain.push(prevIdx);
		
		var currLength = (prevIdx == -1) ? 0 : (lengthChain[prevIdx] + 1);
		
		if (currLength > maxChainLength) {
			maxChainLength = currLength;
			maxChainEnd = idx;
		};
		
		lengthChain.push(currLength);
	};
	
	var stickyNodes = [];
	
	
	
	var cursor = newPosition.length - 1;
	while (cursor >= 0){
		if (cursor == maxChainEnd && newPosition[cursor] != -1) {
			stickyNodes[newPosition[cursor]] = true;
			maxChainEnd = prevChain[maxChainEnd];
		};
		
		cursor -= 1;
	};
	
	
	for (let idx = 0, items = iter$(new$), len = items.length, node; idx < len; idx++) {
		node = items[idx];
		if (!stickyNodes[idx]) {
			// create textnode for string, and update the array
			if (!(node && node._dom)) {
				node = new$[idx] = Imba.createTextNode(node);
			};
			
			var after = new$[idx - 1];
			self.insertNestedAfter(root,node,(after && after._slot_ || after || caret));
		};
		
		caret = node._slot_ || (caret && caret.nextSibling || root._dom.firstChild);
	};
	
	
	return lastNew && lastNew._slot_ || caret;
};



var reconcileCollection = function(root,new$,old,caret) {
	var k = new$.length;
	var i = k;
	var last = new$[k - 1];
	
	
	if (k == old.length && new$[0] === old[0]) {
		// running through to compare
		while (i--){
			if (new$[i] !== old[i]) { break; };
		};
	};
	
	if (i == -1) {
		return last && last._slot_ || last || caret;
	} else {
		return reconcileCollectionChanges(root,new$,old,caret);
	};
};



var reconcileLoop = function(root,new$,old,caret) {
	var nl = new$.length;
	var ol = old.length;
	var cl = new$.cache.i$; 
	var i = 0,d = nl - ol;
	
	
	
	
	while (i < ol && i < nl && new$[i] === old[i]){
		i++;
	};
	
	
	if (cl > 1000 && (cl - nl) > 500) {
		new$.cache.$prune(new$);
	};
	
	if (d > 0 && i == ol) {
		// added at end
		while (i < nl){
			root.appendChild(new$[i++]);
		};
		return;
	} else if (d > 0) {
		let i1 = nl;
		while (i1 > i && new$[i1 - 1] === old[i1 - 1 - d]){
			i1--;
		};
		
		if (d == (i1 - i)) {
			let before = old[i]._slot_;
			while (i < i1){
				root.insertBefore(new$[i++],before);
			};
			return;
		};
	} else if (d < 0 && i == nl) {
		// removed at end
		while (i < ol){
			root.removeChild(old[i++]);
		};
		return;
	} else if (d < 0) {
		let i1 = ol;
		while (i1 > i && new$[i1 - 1 + d] === old[i1 - 1]){
			i1--;
		};
		
		if (d == (i - i1)) {
			while (i < i1){
				root.removeChild(old[i++]);
			};
			return;
		};
	} else if (i == nl) {
		return;
	};
	
	return reconcileCollectionChanges(root,new$,old,caret);
};


var reconcileIndexedArray = function(root,array,old,caret) {
	var newLen = array.taglen;
	var prevLen = array.domlen || 0;
	var last = newLen ? array[newLen - 1] : null;
	
	
	if (prevLen > newLen) {
		while (prevLen > newLen){
			var item = array[--prevLen];
			root.removeChild(item._slot_);
		};
	} else if (newLen > prevLen) {
		// find the item to insert before
		let prevLast = prevLen ? array[prevLen - 1]._slot_ : caret;
		let before = prevLast ? prevLast.nextSibling : root._dom.firstChild;
		
		while (prevLen < newLen){
			let node = array[prevLen++];
			before ? root.insertBefore(node._slot_,before) : root.appendChild(node._slot_);
		};
	};
	
	array.domlen = newLen;
	return last ? last._slot_ : caret;
};




var reconcileNested = function(root,new$,old,caret) {
	
	// var skipnew = new == null or new === false or new === true
	var newIsNull = new$ == null || new$ === false;
	var oldIsNull = old == null || old === false;
	
	
	if (new$ === old) {
		// remember that the caret must be an actual dom element
		// we should instead move the actual caret? - trust
		if (newIsNull) {
			return caret;
		} else if (new$._slot_) {
			return new$._slot_;
		} else if ((new$ instanceof Array) && new$.taglen != null) {
			return reconcileIndexedArray(root,new$,old,caret);
		} else {
			return caret ? caret.nextSibling : root._dom.firstChild;
		};
	} else if (new$ instanceof Array) {
		if (old instanceof Array) {
			// look for slot instead?
			let typ = new$.static;
			if (typ || old.static) {
				// if the static is not nested - we could get a hint from compiler
				// and just skip it
				if (typ == old.static) { // should also include a reference?
					for (let i = 0, items = iter$(new$), len = items.length; i < len; i++) {
						// this is where we could do the triple equal directly
						caret = reconcileNested(root,items[i],old[i],caret);
					};
					return caret;
				} else {
					removeNested(root,old,caret);
				};
				
				
			} else {
				// Could use optimized loop if we know that it only consists of nodes
				return reconcileCollection(root,new$,old,caret);
			};
		} else if (!oldIsNull) {
			if (old._slot_) {
				root.removeChild(old);
			} else {
				// old was a string-like object?
				root.removeChild(caret ? caret.nextSibling : root._dom.firstChild);
			};
		};
		
		return self.insertNestedAfter(root,new$,caret);
		
	} else if (!newIsNull && new$._slot_) {
		if (!oldIsNull) { removeNested(root,old,caret) };
		return self.insertNestedAfter(root,new$,caret);
	} else if (newIsNull) {
		if (!oldIsNull) { removeNested(root,old,caret) };
		return caret;
	} else {
		// if old did not exist we need to add a new directly
		let nextNode;
		
		if (old instanceof Array) {
			removeNested(root,old,caret);
		} else if (old && old._slot_) {
			root.removeChild(old);
		} else if (!oldIsNull) {
			// ...
			nextNode = caret ? caret.nextSibling : root._dom.firstChild;
			if ((nextNode instanceof Text) && nextNode.textContent != new$) {
				nextNode.textContent = new$;
				return nextNode;
			};
		};
		
		
		return self.insertNestedAfter(root,new$,caret);
	};
};


Imba.extendTag('element', function(tag){
	
	// 1 - static shape - unknown content
	// 2 - static shape and static children
	// 3 - single item
	// 4 - optimized array - only length will change
	// 5 - optimized collection
	// 6 - text only
	
	tag.prototype.setChildren = function (new$,typ){
		// if typeof new == 'string'
		// 	return self.text = new
		var old = this._tree_;
		
		if (new$ === old && (!(new$) || new$.taglen == undefined)) {
			return this;
		};
		
		if (!old && typ != 3) {
			this.removeAllChildren();
			appendNested(this,new$);
		} else if (typ == 1) {
			let caret = null;
			for (let i = 0, items = iter$(new$), len = items.length; i < len; i++) {
				caret = reconcileNested(this,items[i],old[i],caret);
			};
		} else if (typ == 2) {
			return this;
		} else if (typ == 3) {
			let ntyp = typeof new$;
			
			if (ntyp != 'object') {
				return this.setText(new$);
			};
			
			if (new$ && new$._dom) {
				this.removeAllChildren();
				this.appendChild(new$);
			} else if (new$ instanceof Array) {
				if (new$._type == 5 && old && old._type == 5) {
					reconcileLoop(this,new$,old,null);
				} else if (old instanceof Array) {
					reconcileNested(this,new$,old,null);
				} else {
					this.removeAllChildren();
					appendNested(this,new$);
				};
			} else {
				return this.setText(new$);
			};
		} else if (typ == 4) {
			reconcileIndexedArray(this,new$,old,null);
		} else if (typ == 5) {
			reconcileLoop(this,new$,old,null);
		} else if ((new$ instanceof Array) && (old instanceof Array)) {
			reconcileNested(this,new$,old,null);
		} else {
			// what if text?
			this.removeAllChildren();
			appendNested(this,new$);
		};
		
		this._tree_ = new$;
		return this;
	};
	
	tag.prototype.content = function (){
		return this._content || this.children().toArray();
	};
	
	tag.prototype.setText = function (text){
		if (text != this._tree_) {
			var val = (text === null || text === false) ? '' : text;
			(this._text_ || this._dom).textContent = val;
			this._text_ || (this._text_ = this._dom.firstChild);
			this._tree_ = text;
		};
		return this;
	};
});


var proto = Imba.Tag.prototype;
proto.setContent = proto.setChildren;


var apple = typeof navigator != 'undefined' && (navigator.vendor || '').indexOf('Apple') == 0;
if (apple) {
	proto.setText = function (text){
		if (text != this._tree_) {
			this._dom.textContent = ((text === null || text === false) ? '' : text);
			this._tree_ = text;
		};
		return this;
	};
};


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
var Menu = __webpack_require__(6).Menu;
var Popover = __webpack_require__(7).Popover;
var Snackbar = __webpack_require__(8).Snackbar;

var Overlay = Imba.defineTag('Overlay', function(tag){
	tag.prototype.component = function(v){ return this._component; }
	tag.prototype.setComponent = function(v){ this._component = v; return this; };
	tag.prototype.target = function(v){ return this._target; }
	tag.prototype.setTarget = function(v){ this._target = v; return this; };
	tag.prototype.options = function(v){ return this._options; }
	tag.prototype.setOptions = function(v){ this._options = v; return this; };
	
	tag.prototype.isModal = function(v){ return this._isModal; }
	tag.prototype.setIsModal = function(v){ this._isModal = v; return this; };
	tag.prototype.isMenu = function(v){ return this._isMenu; }
	tag.prototype.setIsMenu = function(v){ this._isMenu = v; return this; };
	
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).setChildren([
			this.component().flag('floating').flag('paper').end(),
			$[0] || _1('div',$,0,this).flag('backdrop').on$(0,['tap','autohide'],this)
		],1).synced();
	};
	
	
	
	tag.prototype.show = function (){
		var target_;
		document.body.appendChild(this.dom());
		this.component().trigger('uxashow');
		if (this._isMenu) this.reflow();
		this.dom().offsetWidth;
		Imba.TagManager.insert(this,this.dom().parentNode);
		this.flag('uxa-show');
		this.component().flag('uxa-show');
		Imba.TagManager.refresh();
		if (this.target()) {
			(target_ = this.target()) && target_.flag  &&  target_.flag('uxa-overlay-active');
		};
		return this;
	};
	
	tag.prototype.hide = function (){
		var self = this, target_;
		if (self.hasFlag('uxa-hide')) { return };
		self.flag('uxa-hide');
		self.component().flag('uxa-hide');
		self.unflag('uxa-show');
		self.component().unflag('uxa-show');
		
		if (self.target()) {
			(target_ = self.target()) && target_.unflag  &&  target_.unflag('uxa-overlay-active');
		};
		
		setTimeout(function() {
			var par = self.dom().parentNode;
			par.removeChild(self.dom());
			Imba.TagManager.remove(self,par);
			self.component().unflag('uxa-hide');
			
			return Imba.TagManager.refresh();
		},200);
		return self;
	};
	
	tag.prototype.onevent = function (e){
		// If it is a custom event
		if (this._eventResponder && e.bubble() && !this.contains(this._eventResponder) && !(e.event() instanceof Event)) {
			e.redirect(this._eventResponder);
		};
		return this;
	};
	
	tag.prototype.autohide = function (){
		if (!this._isModal) {
			return this.component().trigger('uxa:hide');
		};
	};
	
	tag.prototype.onuxahide = function (e){
		e.stop();
		return this.hide();
	};
	
	tag.prototype.onuxashow = function (e){
		return e.stop();
	};
	
	tag.prototype.setup = function (){
		this._isMenu = (this.component() instanceof Menu) || (this.component() instanceof Popover);
		this._isModal = this.component().hasFlag('modal');
		return this._eventResponder = (this._options && this._options.responder) || (this.target());
	};
	
	tag.prototype.reflow = function (){
		if (!this.target().dom().offsetParent) {
			if (!this.hasFlag('hide')) this.hide();
			return this;
		};
		
		var box = this.target().dom().getBoundingClientRect();
		
		var w = this.component().dom().offsetWidth;
		var h = this.component().dom().offsetHeight;
		
		var vw = window.innerWidth;
		var vh = window.innerHeight;
		
		var sx = 0; 
		var sy = 0; 
		
		var x = Math.round(box.left + sx + box.width * 0.5);
		var y = Math.round(box.top + sy + box.height * 0.5);
		
		var ax = (x > vw * 0.5) ? 1 : 0;
		var ay = (y > vh * 0.5) ? 1 : 0;
		
		var xmax = vw - 10;
		var xmin = 10;
		
		this.setFlag('ay',ay ? 'below' : 'above');
		this.setFlag('ax',(x > (vw * 0.5)) ? null : 'lft');
		
		var css = {
			maxWidth: 400
		};
		this.component().flag('abs');
		
		if (ay < 0.5) {
			css.top = box.bottom;
			css.maxHeight = vh - css.top;
		} else {
			css.bottom = vh - box.top;
			css.maxHeight = vh - css.bottom;
		};
		
		if (ax < 0.5) {
			css.left = Math.max(box.left,10);
		} else {
			css.right = Math.max((vw - box.right),10);
		};
		
		console.log(x,vw,y,vh,ax,ay);
		return this.component().css(css);
	};
})
exports.Overlay = Overlay;


function Stack(){ };

exports.Stack = Stack; // export class 
Stack.show = function (item,rel,o){
	if(o === undefined) o = {};
	var overlay = (_1(Overlay)).setComponent(item).setTarget(rel).setOptions(o).end();
	return overlay.show();
};


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
var Icon = __webpack_require__(2).Icon;

var MenuItem = Imba.defineTag('MenuItem', 'a', function(tag){
	tag.prototype.action = function(v){ return this._action; }
	tag.prototype.setAction = function(v){ this._action = v; return this; };
	tag.prototype.icon = function(v){ return this._icon; }
	tag.prototype.setIcon = function(v){ this._icon = v; return this; };
	tag.prototype.rightIcon = function(v){ return this._rightIcon; }
	tag.prototype.setRightIcon = function(v){ this._rightIcon = v; return this; };
	tag.prototype.label = function(v){ return this._label; }
	tag.prototype.setLabel = function(v){ this._label = v; return this; };
	tag.prototype.subtext = function(v){ return this._subtext; }
	tag.prototype.setSubtext = function(v){ this._subtext = v; return this; };
	tag.prototype.disabled = function(v){ return this.getAttribute('disabled'); }
	tag.prototype.setDisabled = function(v){ this.setAttribute('disabled',v); return this; };
	
	tag.prototype.contextData = function (){
		var data = null;
		var el = this;
		while (el){
			if (data = el.data()) {
				return data;
			};
			el = el.parent();
		};
		return null;
	};
	
	tag.prototype.ontap = function (e){
		if (this.href()) {
			this.trigger('uxa:hide');
			return tag.prototype.__super__.ontap.call(this,e);
		};
		
		e.cancel().halt().silence();
		
		var action = this.action();
		
		if ((typeof action=='string'||action instanceof String)) {
			this.trigger(action,this.contextData());
		} else if (action instanceof Array) {
			this.trigger(action[0],action.slice(1));
		} else {
			this.trigger('activate');
		};
		
		return this.trigger('uxa:hide');
	};
	
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).setChildren([
			this.icon() ? (
				($[0] || _1(Icon,$,0,this).flag('left')).bindData(this,'icon',[]).end()
			) : void(0),
			this.label() ? (
				($[1] || _1('div',$,1,this).flag('text')).setNestedAttr('uxa','md',this.label()).end()
			) : void(0),
			this.subtext() ? (
				($[2] || _1('div',$,2,this).flag('subtext').flag('muted')).setNestedAttr('uxa','md',this.subtext()).end()
			) : void(0),
			this.rightIcon() ? (
				($[3] || _1(Icon,$,3,this).flag('right')).bindData(this,'rightIcon',[]).end()
			) : void(0)
		],1).synced();
	};
})
exports.MenuItem = MenuItem;


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
var Icon = __webpack_require__(2).Icon;

var ListItem = Imba.defineTag('ListItem', function(tag){
	tag.prototype.icon = function(v){ return this._icon; }
	tag.prototype.setIcon = function(v){ this._icon = v; return this; };
	tag.prototype.rightIcon = function(v){ return this._rightIcon; }
	tag.prototype.setRightIcon = function(v){ this._rightIcon = v; return this; };
	tag.prototype.label = function(v){ return this._label; }
	tag.prototype.setLabel = function(v){ this._label = v; return this; };
	tag.prototype.subtext = function(v){ return this._subtext; }
	tag.prototype.setSubtext = function(v){ this._subtext = v; return this; };
	
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).setChildren([
			($[0] || _1('div',$,0,this).flag('gutter')).setContent(
				this.icon() ? (
					($[1] || _1(Icon,$,1,0).flag('left')).bindData(this,'icon',[]).end()
				) : void(0)
			,3),
			($[2] || _1('div',$,2,this).flag('main')).setContent([
				this.label() ? (
					($[3] || _1('div',$,3,2).flag('h3').flag('text')).setNestedAttr('uxa','md',this.label()).end()
				) : void(0),
				this.subtext() ? (
					($[4] || _1('div',$,4,2).flag('p1').flag('muted')).setNestedAttr('uxa','md',this.subtext()).end()
				) : void(0)
			],1),
			this.rightIcon() ? (
				($[5] || _1(Icon,$,5,this).flag('right')).bindData(this,'rightIcon',[]).end()
			) : void(0)
		],1).synced();
	};
})
exports.ListItem = ListItem;


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
var Form = __webpack_require__(10).Form;
var Button = __webpack_require__(3).Button;
var Indicator = __webpack_require__(11).Indicator;

var Dialog = Imba.defineTag('Dialog', Form, function(tag){
	
	tag.prototype.type = function(v){ return this._type; }
	tag.prototype.setType = function(v){ this._type = v; return this; };
	tag.prototype.__submitLabel = {'default': 'confirm',name: 'submitLabel'};
	tag.prototype.submitLabel = function(v){ return this._submitLabel; }
	tag.prototype.setSubmitLabel = function(v){ this._submitLabel = v; return this; }
	tag.prototype._submitLabel = 'confirm';
	tag.prototype.__cancelLabel = {'default': 'dismiss',name: 'cancelLabel'};
	tag.prototype.cancelLabel = function(v){ return this._cancelLabel; }
	tag.prototype.setCancelLabel = function(v){ this._cancelLabel = v; return this; }
	tag.prototype._cancelLabel = 'dismiss';
	
	tag.prototype.setContent = function (content,type){
		this.log("setting content for dialog");
		this._content = Imba.static(content,type);
		return this;
	};
	
	tag.prototype.onsubmit = async function (e){
		var self = this;
		e.cancel().halt(); 
		
		if (self.uxa().queue().busy()) {
			return;
		};
		
		var uxaev = self.trigger('uxa:submit',self.formData());
		await self.uxa().queue();
		
		if (self.uxa().queue().failed()) {
			self.log("failed?!?!",self.uxa().queue().error());
			self.uxa().flash(self.uxa().queue().error());
			return self.uxa().queue().reset();
		} else if (!uxaev.isPrevented()) {
			return setTimeout(function() { return self.hide(); },200);
		};
	};
	
	tag.prototype.show = function (){
		return this.uxa().open(this);
	};
	
	tag.prototype.hide = function (){
		return this.trigger('uxa:hide');
	};
	
	tag.prototype.submit = function (){
		return this;
	};
	
	tag.prototype.mount = function (){
		return this.schedule({events: true});
	};
	
	tag.prototype.unmount = function (){
		return this.unschedule();
	};
	
	tag.prototype.tapDismiss = async function (e){
		var self = this;
		e.prevent().stop();
		self.trigger('uxa:dismiss');
		
		if (self.uxa().queue().idle()) {
			return self.hide();
		};
		
		await self.uxa().queue();
		return setTimeout(function() { return self.hide(); },200);
	};
	
	tag.prototype.header = function (){
		let $ = this.$$ || (this.$$ = {});
		return (this._header = this._header||_1('header',this).flag('header'));
	};
	
	tag.prototype.indicator = function (){
		let $ = this.$$ || (this.$$ = {});
		return (this._indicator = this._indicator||_1(Indicator,this).flag('indicator').setType('forward')).bindData(this.uxa(),'queue',[]).end();
	};
	
	tag.prototype.body = function (){
		let $ = this.$$ || (this.$$ = {});
		return (this._body = this._body||_1('section',this).flag('body')).setContent(
			this._content ? (
				this._content
			) : (this._template ? (
				this.renderTemplate()
			) : void(0))
		,3);
	};
	
	tag.prototype.footer = function (){
		let $ = this.$$ || (this.$$ = {}), t0;
		return (t0 = this._footer = this._footer||(t0=_1('footer',this)).flag('footer').flag('flat').setContent([
			_1(Button,t0.$,'A',t0).setType('button').on$(0,['tap','tapDismiss'],this),
			_1(Button,t0.$,'B',t0).flag('primary').setType('submit')
		],2)).end((
			t0.$.A.setLabel(this.cancelLabel()).end(),
			t0.$.B.setLabel(this.submitLabel()).end()
		,true));
	};
	
	tag.prototype.render = function (){
		return this.$open(0).flag('dialog').setChildren([
			this.header(),
			this.body(),
			this.footer(),
			this.indicator()
		],1).synced();
	};
})
exports.Dialog = Dialog;






/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
var IconButton = __webpack_require__(3).IconButton;

var Tile = Imba.defineTag('Tile', function(tag){
	
	// list of actions [ [action, icon], ... ]
	tag.prototype.actions = function(v){ return this._actions; }
	tag.prototype.setActions = function(v){ this._actions = v; return this; };
	tag.prototype.__md = {'default': "# Hello\n## Subtitle\nSome random text right here",name: 'md'};
	tag.prototype.md = function(v){ return this._md; }
	tag.prototype.setMd = function(v){ this._md = v; return this; }
	tag.prototype._md = "# Hello\n## Subtitle\nSome random text right here";
	
	tag.prototype.main = function (){
		let $ = this.$$ || (this.$$ = {}), t0;
		return (t0 = this._main = this._main||(t0=_1('div',this)).flag('main').setContent([
			_1('div',t0.$,'A',t0).flag('actions').setContent(t0.$.B || _1(IconButton,t0.$,'B','A').setIcon('*'),2),
			_1('span',t0.$,'C',t0).flag('p1')
		],2)).end((
			t0.$.B.end(),
			t0.$.C.setNestedAttr('uxa','md',this.md()).end()
		,true));
	};
	
	
	tag.prototype.footer = function (){
		let $ = this.$$ || (this.$$ = {}), t0;
		return (t0 = this._footer = this._footer||(t0=_1('div',this)).flag('footer').setContent([
			_1('div',t0.$,'A',t0).flag('p1').setText("By Some author"),
			_1('div',t0.$,'B',t0).flag('c1').setText("This is the footer")
		],2));
	};
	
	tag.prototype.render = function (){
		return this.$open(0).setChildren([
			this.main(),
			this.footer()
		],1).synced();
	};
})
exports.Tile = Tile;


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);

var Actionable = Imba.defineTag('Actionable', function(tag){
	
	tag._flagName = null;
	
	tag.prototype.action = function(v){ return this._action; }
	tag.prototype.setAction = function(v){ this._action = v; return this; };
	
	tag.prototype.contextData = function (){
		var data = null;
		var el = this;
		while (el){
			if (data = el.data()) {
				return data;
			};
			el = el.parent();
		};
		return null;
	};
	
	tag.prototype.ontap = function (e){
		var action = this.action();
		
		if (action) {
			this.trigger("uxa:action",action);
		};
		
		if ((typeof action=='string'||action instanceof String)) {
			e.halt().silence();
			this.trigger(action,this.contextData());
		} else if (action instanceof Array) {
			e.halt().silence();
			this.trigger(action[0],action.slice(1));
		} else {
			e._responder = null;
		};
		return this;
	};
})
exports.Actionable = Actionable;


/***/ }),
/* 32 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
var uxa$ = __webpack_require__(14), Button = uxa$.Button, IconButton = uxa$.IconButton, TextField = uxa$.TextField, ListItem = uxa$.ListItem, Menu = uxa$.Menu, MenuItem = uxa$.MenuItem, Popover = uxa$.Popover, Dialog = uxa$.Dialog;

var Head = Imba.defineTag('Head', function(tag){
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).flag('masthead').flag('lg').flag('bar').flag('base-bg').flag('flat').setChildren($.$ = $.$ || [
			_1('div',$,0,this).flag('masthead').setText("Scrimba"),
			_1('a',$,1,this).setHref("#forms").setText('forms'),
			_1('a',$,2,this).setHref("#articles").setText('articles'),
			_1('a',$,3,this).setHref("#panels").setText('panels'),
			_1('a',$,4,this).setHref("#alerts").setText('alerts'),
			_1('a',$,5,this).setHref("#buttons").setText('buttons'),
			_1(Button,$,6,this).flag('primary').on$(0,['tap','showCreate'],this).setLabel('create'),
			this._avatar = this._avatar||_1(Button,this).flag('avatar').flag('primary').on$(0,['tap','menu'],this).setLabel('profile'),
			_1(IconButton,$,7,this).flag('primary').on$(0,['tap','showMenu2'],this).setIcon(':').setUxaAnchor([1,1,1,1])
		],2).synced((
			$[1].end(),
			$[2].end(),
			$[3].end(),
			$[4].end(),
			$[5].end(),
			$[6].end(),
			this._avatar.end(),
			$[7].end()
		,true));
	};
	
	tag.prototype.menu = function (){
		var t0;
		this.log("tap menu!",this);
		this._avatar.uxa().open((t0 = (t0=_1(Popover)).flag('list').flag('inset').setContent([
			_1(ListItem,t0.$,'A',t0).flag('header').setLabel('Sindre Aarsaether').setSubtext('hello@scrimba.com'),
			_1(ListItem,t0.$,'B',t0).setLabel('Profile photo').setSubtext('Change your profile photo'),
			_1('hr',t0.$,'C',t0).flag('sm'),
			_1(Menu,t0.$,'D',t0).flag('inset').setContent([
				_1(MenuItem,t0.$,'E','D').setIcon('w').setLabel('Open'),
				_1(MenuItem,t0.$,'F','D').setIcon('v').setLabel('Paste in place'),
				_1(MenuItem,t0.$,'G','D').setIcon('v').setLabel('Research'),
				_1(MenuItem,t0.$,'H','D').setIcon('.').setLabel('Go to site...'),
				_1('hr',t0.$,'I','D').flag('sm'),
				_1(MenuItem,t0.$,'J','D').flag('pos').setIcon('>').setLabel('Home'),
				_1(MenuItem,t0.$,'K','D').flag('pri').setIcon('>').setLabel('Back'),
				_1(MenuItem,t0.$,'L','D').flag('neg').setIcon('>').setLabel('Sign out').setDisabled(true)
			],2)
		
		
		
		
		
		
		
		],2)).end((
			t0.$.A.end(),
			t0.$.B.end(),
			t0.$.D.end((
				t0.$.E.end(),
				t0.$.F.end(),
				t0.$.G.end(),
				t0.$.H.end(),
				t0.$.J.end(),
				t0.$.K.end(),
				t0.$.L.end()
			,true))
		,true)));
		return this;
	};
	
	tag.prototype.showMenu2 = function (e){
		var t0;
		return e.target().uxa().open((t0 = (t0=_1(Menu)).flag('inset').flag('paper').setContent([
			_1(MenuItem,t0.$,'A',t0).setIcon('w').setLabel('Open'),
			_1(MenuItem,t0.$,'B',t0).setIcon('v').setLabel('Paste in place'),
			_1(MenuItem,t0.$,'C',t0).setIcon('v').setLabel('Research'),
			_1(MenuItem,t0.$,'D',t0).setLabel('Go to site...'),
			_1('hr',t0.$,'E',t0).flag('sm'),
			_1(MenuItem,t0.$,'F',t0).flag('pos').setIcon('>').setLabel('Home'),
			_1(MenuItem,t0.$,'G',t0).flag('pri').setIcon('>').setLabel('Back'),
			_1(MenuItem,t0.$,'H',t0).flag('neg').setIcon('>').setLabel('Sign out').setDisabled(true)
		],2)).end((
			t0.$.A.end(),
			t0.$.B.end(),
			t0.$.C.end(),
			t0.$.D.end(),
			t0.$.F.end(),
			t0.$.G.end(),
			t0.$.H.end()
		,true)));
	};
	
	tag.prototype.showCreate = function (e){
		var t0;
		return e.target().uxa().open((t0 = (t0=_1(Dialog)).setSubmitLabel('archive').setContent([
			_1('h2',t0.$,'A',t0).setText("Create new screencast"),
			_1('p',t0.$,'B',t0).setText("Some basic text explaining this dialog right here."),
			_1(TextField,t0.$,'C',t0).setLabel('Title'),
			_1(TextField,t0.$,'D',t0).setLabel('Last name')
		],2)).end((
			t0.$.C.end(),
			t0.$.D.end()
		,true)));
	};
})
exports.Head = Head;


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;

var Nav = Imba.defineTag('Nav', function(tag){
	
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).setChildren($.$ = $.$ || [
			_1('header',$,0,this).flag('lg').setText("scrimba"),
			_1('h2',$,1,this).setText("Hello there")
		],2).synced();
	};
})
exports.Nav = Nav;


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0), _2 = Imba.createTagList, _1 = Imba.createElement;
var mdart = __webpack_require__(36);

var uxa$ = __webpack_require__(14), IconButton = uxa$.IconButton, Button = uxa$.Button, TextField = uxa$.TextField, TextArea = uxa$.TextArea, Dialog = uxa$.Dialog, Menu = uxa$.Menu, MenuItem = uxa$.MenuItem, Form = uxa$.Form, Indicator = uxa$.Indicator, Tile = uxa$.Tile;
var SelectField = __webpack_require__(9).SelectField;

var short = "\n# Main heading\n## Heading 2\n### Heading 3\n\nParagraph text\n";

var long = "# Heading 1\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Donec cursus elit at\nodio congue, ac varius massa tincidunt. Nulla blandit odio vel bibendum \ncondimentum. In hac habitasse [platea](#platea) dictumst. Nam eu nisl ut erat \nsollicitudin tincidunt.\n\n## Heading 2\n\nNullam eget urna vitae ex ullamcorper dictum ac ullamcorper nisl. Mauris a\nquam non ante ullamcorper ultrices quis quis libero. Quisque ultrices lorem\nmetus. Duis mi est, elementum nec egestas a, luctus et lacus.\n\n### Heading 3\n\nNullam eget urna vitae ex ullamcorper dictum ac ullamcorper nisl. Mauris a\nquam non ante ullamcorper ultrices quis quis libero. Quisque ultrices lorem\nmetus.\n";

var tile = "## Intro to the Hacker News API\nIn this tutorial we'll wrap the Hacker News API in a tiny SDK and learn how to use it to fetch data from Hacker News submissions and comments.";

var tile2 = "In this [tutorial](#tutorial) we'll wrap the Hacker News API in a tiny SDK and learn how to use it to fetch data from Hacker News submissions and comments.";

var items = [{
	title: "Introduction to HTML"
},{
	title: "Learn about Variables"
},{
	title: "Creating a website"
}];

var state = {
	title: "Something",
	category: 'Imba',
	categories: ['Imba','React','Vue.js','Angular'],
	rating: 8
};

var LogForm = Imba.defineTag('LogForm', Form, function(tag){
	
	tag.prototype.fill = function (){
		return this.setFormData({title: "Something",desc: "Hello there mate!!"});
	};
	
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).setChildren($.$ = $.$ || [
			_1('div',$,0,this).flag('field').flag('resting').flag('lg').setContent([
				_1('input',$,1,0).setType('text').setPlaceholder('Title of project'),
				_1('label',$,2,0).dataset('label',"Title").setText("Title"),
				_1('hr',$,3,0)
			],2),
			
			_1('div',$,4,this).flag('field').setContent([
				_1('input',$,5,4).setType('text').setPlaceholder('Subtitle of project').setPattern("Stuff"),
				_1('label',$,6,4).setText("Subtitle"),
				_1('hr',$,7,4)
			],2),
			
			_1('div',$,8,this).flag('field').flag('radio').setContent([
				_1('input',$,9,8).setType('range').setMin(0).setMax(10).setStep(1).setName('slide'),
				_1('label',$,10,8).setText("Font-size")
			],2),
			
			
			
			
			
			_1('div',$,11,this).flag('field').setContent([
				_1('input',$,12,11).setType('checkbox'),
				_1('label',$,13,11).setText("Another checkbox yes")
			
			
			],2),
			
			_1('div',$,14,this).flag('field').setContent([
				_1('input',$,15,14).setType('radio').setName('group').setValue('red',1),
				_1('label',$,16,14).setText("Red")
			],2),
			
			_1('div',$,17,this).flag('field').setContent([
				_1('input',$,18,17).setType('radio').setName('group').setValue('green',1),
				_1('label',$,19,17).setText("Green")
			],2),
			
			_1('div',$,20,this).flag('field').setContent([
				_1('input',$,21,20).setType('radio').setName('group').setValue('blue',1),
				_1('label',$,22,20).setText("Blue")
			],2),
			
			_1('div',$,23,this).flag('field').flag('select').setContent([
				_1('select',$,24,23),
				_1('label',$,26,23).setText("Blue")
			],2),
			
			_1(TextField,$,27,this).setLabel("Title").setName('title').setPlaceholder("Descriptive title").setDesc("Some description of this"),
			_1(SelectField,$,28,this).setLabel("Category").setName('category').setDesc("Some description of this"),
			_1(TextField,$,29,this).setLabel("Secret word").setName('secret').setPlaceholder("What is the secret?").setRequired(true).setPattern("uxauxa").setDesc("Can you guess it?"),
			_1(TextArea,$,30,this).setLabel("Description").setName('desc').setDesc("Please feel free to describe").setPlaceholder("Some description").setRequired(true),
			_1(TextField,$,31,this).setLabel("Alias").setName('alias').setDesc("This field is disabled").setDisabled(true),
			_1(Button,$,32,this).flag('primary').setLabel("Submit").setType('submit'),
			_1(Button,$,33,this).flag('primary').setLabel("Fill").setType('button').on$(0,['tap','fill'],this)
		],2).synced((
			$[1].bindData(state,'title').end(),
			$[2].end(),
			$[5].end(),
			$[9].bindData(state,'rating').end(),
			$[12].end(),
			$[15].end(),
			$[18].end(),
			$[21].end(),
			$[24].bindData(state,'category').setContent(
				(function tagLoop($0) {
					for (let i = 0, ary = iter$(state.categories), len = $0.taglen = ary.length; i < len; i++) {
						($0[i] || _1('option',$0,i)).setContent(ary[i],3);
					};return $0;
				})($[25] || _2($,25,$[24]))
			,4).end(),
			$[27].end(),
			$[28].end(),
			$[29].end(),
			$[30].end(),
			$[31].end(),
			$[32].end(),
			$[33].end()
		,true));
	};
	
	tag.prototype.onsubmit = function (e){
		e.cancel().halt();
		return console.log("submit",this.formData());
	};
});


var DialogExample = Imba.defineTag('DialogExample', Button, function(tag){
	tag.prototype.ontap = function (){
		if (this._template) {
			return this.uxa().open(this.template(),{responder: this});
		};
	};
});

var ColorSample = Imba.defineTag('ColorSample', function(tag){
	tag.prototype.bg = function(v){ return this._bg; }
	tag.prototype.setBg = function(v){ this._bg = v; return this; };
	tag.prototype.weight = function(v){ return this._weight; }
	tag.prototype.setWeight = function(v){ this._weight = v; return this; };
	tag.prototype.color = function(v){ return this._color; }
	tag.prototype.setColor = function(v){ this._color = v; return this; };
	tag.prototype.label = function(v){ return this._label; }
	tag.prototype.setLabel = function(v){ this._label = v; return this; };
	
	tag.prototype.setup = function (){
		return this.css({background: ("var(--" + this.bg() + ")"),color: ("var(--" + this.color() + ")")});
	};
	
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).setChildren($[0] || _1('span',$,0,this),2).synced((
			$[0].setContent(this.label() || this.weight(),3)
		,true));
	};
});

var ColorScale = Imba.defineTag('ColorScale', function(tag){
	tag.prototype.tint = function(v){ return this._tint; }
	tag.prototype.setTint = function(v){ this._tint = v; return this; };
	tag.prototype.render = function (){
		var $ = this.$, self = this;
		return self.$open(0).setChildren((function tagLoop($0) {
			for (let i = 0, ary = [0,50,100,200,300,400,500,600,700,800,900,'A100','A200','A400','A700'], len = $0.taglen = ary.length, item; i < len; i++) {
				item = ary[i];
				($0[i] || _1(ColorSample,$0,i)).setWeight(item).setBg(("uxa-" + self.tint() + "-" + item)).setColor(("uxa-" + self.tint() + "-" + ((i > 5) ? 0 : 900))).end();
			};return $0;
		})($[0] || _2($,0)),4).synced();
	};
});

var Palette = Imba.defineTag('Palette', function(tag){
	tag.prototype.tint = function(v){ return this._tint; }
	tag.prototype.setTint = function(v){ this._tint = v; return this; };
	
	tag.prototype.menu = function (){
		var t0;
		return (t0 = (t0=_1(Menu)).flag('inset').setContent([
			_1(MenuItem,t0.$,'A',t0).setIcon('w').setLabel('Open'),
			_1(MenuItem,t0.$,'B',t0).setIcon('v').setLabel('Paste in place'),
			_1(MenuItem,t0.$,'C',t0).setIcon('v').setLabel('Research'),
			_1(MenuItem,t0.$,'D',t0).setIcon('.').setLabel('Go to site...'),
			_1('hr',t0.$,'E',t0).flag('sm'),
			_1(MenuItem,t0.$,'F',t0).setIcon('>').setLabel('Home'),
			_1(MenuItem,t0.$,'G',t0).setIcon('>').setLabel('Back'),
			_1(MenuItem,t0.$,'H',t0).setIcon('>').setLabel('Sign out').setDisabled(true)
		],2)).end((
			t0.$.A.end(),
			t0.$.B.end(),
			t0.$.C.end(),
			t0.$.D.end(),
			t0.$.F.end(),
			t0.$.G.end(),
			t0.$.H.end()
		,true));
	};
	
	
	tag.prototype.submitLong = function (e){
		e.target().uxa().queue().add(10000,function(a) {
			return new Promise(function(resolve,reject) { return setTimeout(resolve,3500); });
		});
		return this;
	};
	
	tag.prototype.submitShort = function (e){
		return e.target().uxa().queue().add(1000,function(a) {
			return new Promise(function(resolve,reject) { return resolve(); }); 
		});
	};
	
	tag.prototype.submitUnexpectedLong = function (e){
		return e.target().uxa().queue().add(2000,function(a) {
			return new Promise(function(resolve,reject) { return setTimeout(resolve,4500); });
		});
	};
	
	tag.prototype.submitFail = function (e){
		return e.target().uxa().queue().add(10000,function(a) {
			return new Promise(function(resolve,reject) {
				
				return setTimeout(function() {
					try {
						return Math.rendom();
					} catch (e) {
						return reject(e);
					};
					
				},1500);
			});
		});
	};
	
	
	
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).flag('paper').setFlag(-1,this.tint()).setChildren($.$ = $.$ || [
			_1('h2',$,0,this),
			_1('section',$,1,this).setContent([
				_1('h3',$,2,1).setText("Raised buttons"),
				t0 = (t0=_1(DialogExample,$,3,1)).flag('raised').setLabel('Dismiss'),
				
				t0 = (t0=_1(DialogExample,$,4,1)).flag('raised').flag('secondary').setLabel('Secondary'),
				
				t0 = (t0=_1(DialogExample,$,5,1)).flag('raised').flag('primary').setLabel('Primary'),
				
				t0 = (t0=_1(DialogExample,$,6,1)).flag('raised').flag('primary').on$(0,['uxasubmit','submitLong'],this).setLabel('Progress'),
				
				t0 = (t0=_1(DialogExample,$,7,1)).flag('raised').flag('primary').on$(0,['uxasubmit','submitFail'],this).setLabel('Fail'),
				
				t0 = (t0=_1(DialogExample,$,8,1)).flag('raised').flag('primary').on$(0,['uxasubmit','submitUnexpectedLong'],this).setLabel('Longer'),
				
				t0 = (t0=_1(DialogExample,$,9,1)).flag('raised').flag('primary').on$(0,['uxasubmit','submitShort'],this).setLabel('Instant')
			],2),
			
			_1('section',$,10,this).flag('flat').setContent([
				// <h3> "Flat buttons"
				_1(Button,$,11,10).flag('muted').setLabel("Dismiss"),
				_1(Button,$,12,10).flag('secondary').setLabel("Secondary"),
				_1(Button,$,13,10).flag('primary').setLabel("Primary"),
				_1(Button,$,14,10).flag('primary').setLabel("Disabled").setDisabled(true),
				_1(Button,$,15,10).flag('primary').setIcon('v').setLabel("Menu").on$(0,['menu','menu'],this),
				
				_1('div',$,16,10).flag('hbar').setContent([
					_1(IconButton,$,17,16).flag('xs').setIcon('*'),
					_1(IconButton,$,18,16).flag('sm').setIcon('*'),
					_1(IconButton,$,19,16).flag('md').setIcon('*'),
					_1(IconButton,$,20,16).flag('lg').setIcon('*'),
					_1(IconButton,$,21,16).flag('xl').setIcon('*')
				],2)
			
			
			
			
			
			
			
			
			],2),
			
			_1('section',$,22,this).setContent([
				_1('div',$,23,22),
				_1('hr',$,24,22),
				_1(LogForm,$,25,22)
			],2),
			
			_1('section',$,26,this).setContent(
				$[27] || _1('div',$,27,26).flag('md')
			,2),
			
			_1('section',$,28,this).setContent([
				_1('h2',$,29,28).setText("Tiles"),
				_1('div',$,30,28).flag('tiles').flag('hbox').flag('dark').setContent([
					_1(Tile,$,31,30),
					_1(Tile,$,32,30),
					_1(Tile,$,33,30)
				],2),
				
				_1('h2',$,34,28).setText("Small"),
				_1('div',$,35,28).flag('tiles').flag('hbox').flag('dark').flag('sm').setContent([
					_1(Tile,$,36,35),
					_1(Tile,$,37,35),
					_1(Tile,$,38,35)
				],2)
			],2),
			
			_1('section',$,39,this).setContent([
				_1('h3',$,40,39).setText("Colors"),
				_1(ColorScale,$,41,39).setTint('tint'),
				_1(ColorScale,$,42,39).setTint('pri'),
				_1(ColorScale,$,43,39).setTint('sec')
			
			
			
			
			
			],2)
		],2).synced((
			$[0].setText("" + this.tint() + " panel"),
			$[3].setTemplate(function() {
				var $1 = this.$, t0;
				return ($1[0] || _1(Dialog,$1,0,t0).flag('modal').setContent($1[1] || _1('span',$1,1,0).setText("Hello there - this is something"),2)).end();
			}).end(),
			$[4].setTemplate(function() {
				var $1 = this.$, t0;
				return ($1[0] || _1(Dialog,$1,0,t0).flag('modal').setSubmitLabel('Absolutely').setContent(
					$1[1] || _1('span',$1,1,0).setText("Hello there")
				,2)).end();
			}).end(),
			$[5].setTemplate(function() {
				var $1 = this.$, t0;
				return ($1[0] || _1(Dialog,$1,0,t0).flag('modal').setSubmitLabel('Absolutely').setContent(
					$1[1] || _1('div',$1,1,0).setNestedAttr('uxa','md',"# Hello\nThis is a longer dialog explaining something right here?")
				,2)).end((
					$1[1].end()
				,true));
			}).end(),
			$[6].setTemplate(function() {
				var $1 = this.$, t0;
				return ($1[0] || _1(Dialog,$1,0,t0).flag('modal').setSubmitLabel('Process').setContent(
					$1[1] || _1('div',$1,1,0).setNestedAttr('uxa','md',"This is a longer dialog explaining something right here?")
				,2)).end((
					$1[1].end()
				,true));
			}).end(),
			$[7].setTemplate(function() {
				var $1 = this.$, t0;
				return ($1[0] || _1(Dialog,$1,0,t0).flag('modal').setContent($1[1] || _1('div',$1,1,0).setNestedAttr('uxa','md',"This will fail on submit!"),2)).end((
					$1[1].end()
				,true));
			}).end(),
			$[8].setTemplate(function() {
				var $1 = this.$, t0;
				return ($1[0] || _1(Dialog,$1,0,t0).flag('modal').setContent($1[1] || _1('div',$1,1,0).setNestedAttr('uxa','md',"This will take longer than expected"),2)).end((
					$1[1].end()
				,true));
			}).end(),
			$[9].setTemplate(function() {
				var $1 = this.$, t0;
				return ($1[0] || _1(Dialog,$1,0,t0).flag('modal').setContent($1[1] || _1('div',$1,1,0).setNestedAttr('uxa','md',"This will submit instantly"),2)).end((
					$1[1].end()
				,true));
			}).end(),
			$[11].end(),
			$[12].end(),
			$[13].end(),
			$[14].end(),
			$[15].end(),
			$[17].end(),
			$[18].end(),
			$[19].end(),
			$[20].end(),
			$[21].end(),
			$[23].setNestedAttr('uxa','md',long).end(),
			$[25].end(),
			$[27].setNestedAttr('uxa','md',short).end(),
			$[31].setMd(tile).end(),
			$[32].setMd(tile2).end(),
			$[33].end(),
			$[36].setMd(tile).end(),
			$[37].setMd(tile2).end(),
			$[38].end(),
			$[41].end(),
			$[42].end(),
			$[43].end()
		,true));
	};
});

var TileTest = Imba.defineTag('TileTest', function(tag){
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).flag('tile').setChildren(
			$[0] || _1('div',$,0,this).flag('body').setContent([
				_1('div',$,1,0).flag('title').setContent([
					_1('span',$,2,1),
					_1('span',$,3,1).flag('dim').setText(" (example.uxa.io)")
				],2),
				_1('div',$,4,0).flag('legend').flag('bullets').flag('dim').setContent([
					_1('span',$,5,4).setText("by John Doe"),
					_1('span',$,6,4).setText("20 minutes ago")
				],2)
			],2)
		,2).synced((
			$[2].setContent(this.data().title,3)
		,true));
	};
});
var Home = Imba.defineTag('Home', function(tag){
	
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).setChildren($.$ = $.$ || [
			_1('article',$,0,this).flag('hero').setContent(
				$[1] || _1('div',$,1,0).flag('container').flag('narrow').flag('pad').flag('lg').setContent([
					_1('h1',$,2,1).setText("Hello, future expert"),
					_1('p',$,3,1).setText("Scrimba is a powerful new way of learning code. Play around with the instructors code any time, right in the player."),
					_1('div',$,4,1).flag('spaced').flag('center').setContent(
						$[5] || _1('a',$,5,4).flag('button').flag('primary').setText("Take Tour")
					,2),
					_1('hr',$,6,1)
				],2)
			,2),
			
			_1('div',$,7,this).flag('container').flag('light').setContent([
				
				_1('div',$,8,7).flag('masthead').setContent([
					_1('a',$,9,8).flag('logo').setText("Scrimba"),
					_1('a',$,10,8).flag('item').setText("tes")
				],2),
				
				_1('div',$,11,7).flag('masthead').flag('dark').setText("Masthead"),
				
				_1('div',$,12,7).flag('breadcrumb').setContent(
					$[13] || _1('ul',$,13,12).setContent([
						_1('li',$,14,13).setText("Home"),
						_1('li',$,15,13).setText("Next"),
						_1('li',$,16,13).setText("Other")
					],2)
				,2),
				
				_1('section',$,17,7),
				_1('section',$,19,7).flag('section').setContent([
					_1('header',$,20,19).setContent([
						_1('div',$,21,20).flag('title').setText("Title"),
						_1('div',$,22,20).flag('subtitle').setText("Subitle for section")
					],2),
					_1('div',$,23,19).flag('grid').flag('tiles')
				],2),
				
				
				_1('section',$,25,7).setContent(
					$[26] || _1('div',$,26,25).flag('grid').flag('tiles')
				,2),
				_1('section',$,28,7).flag('mb-xl').setContent(
					$[29] || _1('div',$,29,28).flag('grid').flag('tiles')
				,2)
			],2),
			
			_1('div',$,31,this).flag('container').flag('narrow'),
			_1('div',$,32,this).flag('container').flag('narrow').flag('sm'),
			
			_1('div',$,33,this).flag('container').flag('narrow').setContent(
				$[34] || _1('div',$,34,33).flag('tile').flag('dark').setContent(
					$[35] || _1('h2',$,35,34).setText("This is a tile!")
				,2)
			,2)
		
		
		
		
		
		
		
		
		
		
		
		],2).synced((
			$[17].setContent(
				(function tagLoop($0) {
					var t0;
					for (let i = 0, ary = ['light','dark'], len = $0.taglen = ary.length; i < len; i++) {
						(t0 = $0[i] || (t0=_1('div',$0,i)).flag('grid').flag('tiles').setContent([
							_1('div',t0.$,'A',t0).flag('tile').setContent([
								_1('p',t0.$,'B','A').setText("Default color"),
								_1('p',t0.$,'C','A').flag('red').setText("Red"),
								_1('p',t0.$,'D','A').flag('green').setText("Green"),
								_1('p',t0.$,'E','A').flag('blue').setText("Blue"),
								_1('p',t0.$,'F','A').flag('yellow').setText("Yellow"),
								_1('p',t0.$,'G','A').flag('dim').setText("Dim"),
								_1('p',t0.$,'H','A').flag('muted').setText("Muted"),
								_1('div',t0.$,'I','A').flag('spaced').setContent([
									_1('a',t0.$,'J','I').flag('button').setText("Cancel"),
									_1('a',t0.$,'K','I').flag('button').flag('primary').setText("Submit")
								],2)
							],2),
							_1('div',t0.$,'L',t0).flag('tile').setContent([
								_1('div',t0.$,'M','L').flag('spaced').flag('bar').setContent([
									_1('a',t0.$,'N','M').flag('button').dataset('icon','mclose').setText("Archive"),
									_1('a',t0.$,'O','M').flag('button').dataset('icon-after','mclose').setText("Undo"),
									_1('a',t0.$,'P','M').flag('sm').flag('button').dataset('icon','mclose').setText("Archive"),
									_1('a',t0.$,'Q','M').flag('sm').flag('button').dataset('icon-after','mclose').setText("Undo")
								],2),
								_1('hr',t0.$,'R','L'),
								_1('p',t0.$,'S','L').setText("Some text right here"),
								_1('div',t0.$,'T','L').flag('bar').flag('spaced').setContent([
									_1('div',t0.$,'U','T').flag('green').setText("Green"),
									_1('div',t0.$,'V','T').flag('blue').setText("Blue"),
									_1('div',t0.$,'W','T').flag('yellow').setText("Yellow")
								],2),
								_1('hr',t0.$,'X','L'),
								_1('div',t0.$,'Y','L').flag('bar').flag('spaced').setContent([
									_1('a',t0.$,'Z','Y').flag('button').flag('solid').flag('primary').dataset('icon','mclose').setText("Archive"),
									_1('a',t0.$,'AA','Y').flag('button').flag('solid').dataset('icon','mclose').setText("Undo"),
									_1('a',t0.$,'AB','Y').flag('button').flag('solid').dataset('icon','mclose').setText("Archive"),
									_1('a',t0.$,'AC','Y').flag('button').flag('solid').setText("Undo")
								],2)
							],2),
							
							_1('div',t0.$,'AD',t0).flag('tile').setContent(
								t0.$.AE || _1('div',t0.$,'AE','AD').flag('menu').setContent([
									_1('div',t0.$,'AF','AE').flag('item').setText("Edit item"),
									_1('div',t0.$,'AG','AE').flag('item').dataset('icon','mright').setText("Remove item"),
									_1('hr',t0.$,'AH','AE'),
									_1('div',t0.$,'AI','AE').flag('item').dataset('icon','mright').setText("Edit item"),
									_1('div',t0.$,'AJ','AE').flag('item').dataset('icon','mclose').setText("Close menu")
								],2)
							,2)
						],2)).setFlag(0,ary[i]).end((
							t0.$.N.end(),
							t0.$.O.end(),
							t0.$.P.end(),
							t0.$.Q.end(),
							t0.$.Z.end(),
							t0.$.AA.end(),
							t0.$.AB.end(),
							t0.$.AG.end(),
							t0.$.AI.end(),
							t0.$.AJ.end()
						,true));
					};return $0;
				})($[18] || _2($,18,$[17]))
			,4),
			$[23].setContent((function tagLoop($0) {
				var t0;
				for (let i = 0, ary = ['sm','md','lg'], len = $0.taglen = ary.length, item; i < len; i++) {
					item = ary[i];
					(t0 = $0[i] || (t0=_1('div',$0,i)).flag('tile').setContent([
						_1('div',t0.$,'A',t0),
						_1(LogForm,t0.$,'B',t0)
					],2)).end((
						t0.$.A.setFlag(0,item).setNestedAttr('uxa','md',short).end(),
						t0.$.B.setFlag(0,item).end()
					,true));
				};return $0;
			})($[24] || _2($,24,$[23])),4),
			$[26].setContent((function tagLoop($0) {
				for (let i = 0, len = $0.taglen = items.length; i < len; i++) {
					($0[i] || _1(TileTest,$0,i)).setData(items[i]).end();
				};return $0;
			})($[27] || _2($,27,$[26])),4),
			$[29].setContent((function tagLoop($0) {
				for (let i = 0, len = $0.taglen = items.length; i < len; i++) {
					($0[i] || _1(TileTest,$0,i).flag('dark')).setData(items[i]).end();
				};return $0;
			})($[30] || _2($,30,$[29])),4),
			$[31].setNestedAttr('uxa','md',long).end(),
			$[32].setNestedAttr('uxa','md',long).end()
		,true));
	};
})
exports.Home = Home;



/***/ }),
/* 36 */
/***/ (function(module, exports) {

module.exports = "# What is Imba?\nImba is a programming language for the web that compiles to performant and readable JavaScript. It is specifically designed to improve the way we create rich site and applications. It has language level support for defining, extending, subclassing, instantiating and rendering dom nodes. For a semi-complex application like TodoMVC, it is more than 10 times faster than React with less code, and a much smaller library.\n\n## Developers\nRather than being an academic exercise, Imba has been developed over several years, alongside actual applications. Imba has been fine-tuned to ease the challenges we face when developing rich, dynamic apps (and sites).\n\n## Interoperability\nImba compiles down to clean and readable JavaScript. Your formatting, indentaiton, and comments are included. You can use any existing JavaScript library seamlessly from Imba, and vica-versa.\n\n## Speed\nYou can use all the syntactic sugar in Imba without needing to worry about the performance and readability of the compiled code, and building your views using Imba's native support for tags results in unprecedented performance. \n\n## Performance\nRendering views using Imba's language level support for tags compiles to *extremely* performant code. In pure synchronous rendering of an application like TodoMVC, Imba beats all existing implementations by an **order of magnitude**."

/***/ })
/******/ ]);