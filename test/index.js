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
/******/ 	return __webpack_require__(__webpack_require__.s = 19);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(20);


/***/ }),
/* 1 */
/***/ (function(module, exports) {



var Imba = {VERSION: '1.4.0'};



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
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
var Stack = __webpack_require__(30).Stack;
var Menu = __webpack_require__(4).Menu;
var MenuItem = __webpack_require__(31).MenuItem;
var Button$ = __webpack_require__(6), Button = Button$.Button, IconButton = Button$.IconButton;
var Field$ = __webpack_require__(13), TextField = Field$.TextField, TextArea = Field$.TextArea, SelectField = Field$.SelectField, TagField = Field$.TagField, CheckBox = Field$.CheckBox;
var Popover = __webpack_require__(11).Popover;
var Dialog = __webpack_require__(32).Dialog;
var Indicator = __webpack_require__(16).Indicator;
var Form = __webpack_require__(15).Form;
var Snackbar = __webpack_require__(12).Snackbar;
var Tile = __webpack_require__(33).Tile;
var Icon = __webpack_require__(5).Icon;
var Queue = __webpack_require__(17).Queue;
var Code = __webpack_require__(7).Code;
var Actionable = __webpack_require__(34).Actionable;


var marked = __webpack_require__(35);

var Markdown = exports.Markdown = {
	options: {},
	marked: marked,
	render: function(text,modifiers) { return this.marked(text); },
	configure: function(options) { return this.marked.setOptions(options); }
};

Markdown.configure({highlight: function(code,lang) { return Code.highlight(code,lang); }});

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
	return MarkdownCache[md] || (MarkdownCache[md] = mdclean(md,Markdown.render(md)));
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



var Code = exports.Code = Code;
var UXA = exports.UXA = new UXAWrapper(null);
var Button = exports.Button = Button;
var IconButton = exports.IconButton = IconButton;
var Menu = exports.Menu = Menu;
var MenuItem = exports.MenuItem = MenuItem;
var TextField = exports.TextField = TextField;
var TagField = exports.TagField = TagField;
var TextArea = exports.TextArea = TextArea;
var CheckBox = exports.CheckBox = CheckBox;
var SelectField = exports.SelectField = SelectField;
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
/* 4 */
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
/* 5 */
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
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
var Icon = __webpack_require__(5).Icon;

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
		return this.$open(0).flag('button').setChildren([
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
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);
var Code = Imba.defineTag('Code', function(tag){
	
	tag.highlight = function (code,lang){
		if (code.indexOf('"') >= 0) {
			code = code.replace(/\"/g,"&quot;");
		};
		if (code.indexOf('<') >= 0) {
			code = code.replace(/\</g,"&lt;");
		};
		if (code.indexOf('>') >= 0) {
			code = code.replace(/\>/g,"&gt;");
		};
		return code;
	};
})
exports.Code = Code;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0), _1 = Imba.createElement;

var util$ = __webpack_require__(9), Sel = util$.Sel, eventKeys = util$.eventKeys;


var types = exports.types = {};

var options$ = __webpack_require__(18), Triggers = options$.Triggers, Schema = options$.Schema, Actions = options$.Actions;
var ActionsMenu = __webpack_require__(44).ActionsMenu;

var serializers = {
	plain: {
		a: {attributes: ['href','target']},
		b: {},
		i: {}
	},
	
	deep: {
		a: {attributes: ['href','target']},
		b: {},
		i: {},
		p: {},
		h1: {},
		h2: {},
		h3: {}
	}
};

var Entity = Imba.defineTag('Entity', 'span', function(tag){
	tag.prototype.__data = {watch: 'dataDidSet',name: 'data'};
	tag.prototype.data = function(v){ return this._data; }
	tag.prototype.setData = function(v){
		var a = this.data();
		if(v != a) { this._data = v; }
		if(v != a) { this.dataDidSet && this.dataDidSet(v,a,this.__data) }
		return this;
	};
	tag.prototype.__spellcheck = {dom: true,name: 'spellcheck'};
	tag.prototype.spellcheck = function(v){ return this.dom().spellcheck; }
	tag.prototype.setSpellcheck = function(v){ if (v != this.dom().spellcheck) { this.dom().spellcheck = v }; return this; };
	
	tag.deserialize = function (item){
		return (_1(Entity)).setData(item).end();
	};
	
	tag.htmlToBlocks = function (html){
		var frag = Imba.document().createElement('div');
		frag.innerHTML = html;
		var data = this.serialize(frag.childNodes,serializers.deep);
		return data;
	};
	
	tag.serialize = function (root,format){
		var data = [];
		var curr = data;
		
		format || (format = serializers.plain);
		
		var pluckAttrs = function(options,node,attrs) {
			// console.log "pluck",node,attrs
			for (let i = 0, items = iter$(attrs), len = items.length, key; i < len; i++) {
				key = items[i];
				let val = node.getAttribute(key);
				if (val) { options[key] = val };
			};
			return options;
		};
		
		var traverse = function(node) {
			if (node instanceof NodeList) {
				for (let i = 0, items = iter$(node), len = items.length; i < len; i++) {
					traverse(items[i],node);
				};
				return;
			};
			
			if (node instanceof Text) {
				let text = node.textContent;
				let last = curr[curr.length - 1];
				if (last && (typeof last=='string'||last instanceof String)) {
					curr[curr.length - 1] = last + text;
				} else {
					curr.push(text);
				};
				return;
			};
			
			if ((node instanceof Element) && node._tag && node._tag.serialize) {
				let result = node._tag.serialize();
				return curr.push(result);
			};
			
			var typ = node.nodeName.toLowerCase();
			
			if (typ == 'strong') {
				typ = 'b';
			} else if (typ == 'em') {
				typ = 'i';
			} else if (typ == 'br') {
				return traverse(Imba.document().createTextNode('\n'));
			};
			
			var fmt = format[typ];
			
			if (!fmt) {
				return traverse(node.childNodes);
			};
			
			var el = {type: typ,body: []};
			
			if (fmt.attributes) {
				pluckAttrs(el,node,fmt.attributes);
			};
			
			var prev = curr;
			prev.push(el);
			curr = el.body;
			traverse(node.childNodes);
			return curr = prev;
		};
		
		traverse(root);
		
		var isDeep = data.some(function(item) {
			return Imba.indexOf(item.type,['p','h1','h2','h3']) >= 0;
		});
		
		if (isDeep) {
			data = data.map(function(item) {
				if ((typeof item=='string'||item instanceof String)) {
					return {type: 'p',body: [item]};
				} else if (Imba.indexOf(item.type,['a','b','i']) >= 0) {
					return {type: 'p',body: [item]};
				} else {
					return item;
				};
			});
			data.DEEP = true;
		};
		return data;
	};
	
	tag.deserialize = function (root,config){
		var curr = root;
		
		var traverse = function(data) {
			let el;
			if ((typeof data=='string'||data instanceof String)) {
				el = Imba.document().createTextNode(data);
				return curr.appendChild(el);
			} else if (data instanceof Array) {
				let res = [];
				for (let i = 0, items = iter$(data), len = items.length; i < len; i++) {
					res.push(traverse(items[i]));
				};
				return res;
			} else if (data instanceof Object) {
				var typ = data.type;
				var prev = curr;
				
				curr = Imba.document().createElement(typ);
				if (typ == 'a') {
					if (data.href) { curr.href = data.href };
					if (data.target) { curr.target = data.target };
				};
				
				traverse(data.body);
				prev.appendChild(curr);
				return curr = prev;
			};
		};
		
		
		while (root.firstChild){
			root.removeChild(root.firstChild);
		};
		traverse(config);
		return root;
	};
	
	tag.prototype.selection = function (){
		var sel = window.getSelection();
		if (!(sel && this.dom().contains(sel.anchorNode))) { return null };
		return new Sel(this.dom(),sel);
	};
	
	tag.prototype.body = function (){
		return this.dom();
	};
	
	tag.prototype.clear = function (){
		while (this.dom().firstChild){
			this.dom().removeChild(this.dom().firstChild);
		};
		return this;
	};
	
	tag.prototype.select = function (start,end){
		return Sel.select(this.body(),start,end);
	};
	
	tag.prototype.range = function (start,end){
		return Sel.range(this.body(),start,end);
	};
	
	tag.prototype.plaintext = function (){
		return this.body().innerText.replace(/(\&nbsp;| )/g,' ');
	};
	
	tag.prototype.deserialize = function (data){
		this.clear();
		Entity.deserialize(this.body(),data.body || data);
		return this.deserialized();
	};
	
	tag.prototype.deserialized = function (){
		return this;
	};
	
	tag.prototype.serialize = function (root,options){
		if(root === undefined) root = this.body();
		if(options === undefined) options = this.data();
		return Entity.serialize(root,options);
	};
	
	tag.prototype.reformat = function (){
		var selection_;
		var raw = this.serialize(this.body().childNodes);
		var sel = (selection_ = this.selection()) && selection_.serialize  &&  selection_.serialize();
		this.deserialize(raw);
		if (sel) { return this.select(sel.start,sel.start + sel.length) };
	};
})
exports.Entity = Entity;


var Content = Imba.defineTag('Content', Entity, function(tag){
	tag._nodeType = 'div';
	tag.prototype.__editable = {watch: 'editableDidSet',name: 'editable'};
	tag.prototype.editable = function(v){ return this._editable; }
	tag.prototype.setEditable = function(v){
		var a = this.editable();
		if(v != a) { this._editable = v; }
		if(v != a) { this.editableDidSet && this.editableDidSet(v,a,this.__editable) }
		return this;
	};
	
	tag.prototype.editableDidSet = function (bool){
		this.dom().contentEditable = bool;
		return this.flag('editable',bool);
	};
	
	tag.prototype.dataDidSet = function (data){
		return this.deserialize(data);
	};
	
	
	tag.prototype.serialize = function (){
		return Entity.serialize(this.body().childNodes);
	};
	
	tag.prototype.block = function (){
		return this.parent().parent();
	};
	
	
	tag.prototype.onkeydown = function (e){
		let key = eventKeys(e);
		
		let sel = this.selection();
		key.selection = sel;
		key.text = sel.raw().toString();
		key.textBefore = sel.prefix();
		key.textAfter = sel.postfix();
		
		e.setData(key);
		return;
	};
	
	tag.prototype.onpaste = function (e){
		var cd, html;
		this._pasting = true;
		var blocks;
		if (cd = e.event().clipboardData) {
			if (html = cd.getData('text/html')) {
				blocks = Entity.htmlToBlocks(html);
			};
		};
		e._blocks = blocks;
		return this;
	};
	
	tag.prototype.oninput = function (e){
		var paste;
		if (paste = this._pasting) {
			this._pasting = null;
			let content = Entity.serialize(this.body().childNodes,serializers.deep);
			console.log(content);
			
			return this.reformat();
		};
	};
})
exports.Content = Content;

var Block = Imba.defineTag('Block', function(tag){
	
	tag.prototype.context = function(v){ return this._context; }
	tag.prototype.setContext = function(v){ this._context = v; return this; };
	
	tag._options = {};
	
	tag.register = function (type,options){
		if(options === undefined) options = {};
		types[type] = this;
		options.type = type;
		return this._options = options;
	};
	
	tag.buildNode = function (){
		var type;
		if (type = this._options.nodeType) {
			var node = Imba.document().createElement(type);
			node.classList.add('Block');
			return node;
		};
		
		return Imba.Tag.buildNode.call(this);
	};
	
	tag.deserialize = function (data,owner){
		if (data instanceof Block) {
			return data;
		};
		
		data.body || (data.body = []);
		
		let type = types[data.type] || Block;
		return type.build(owner).setData(data).end();
	};
	
	tag.prototype.build = function (){
		var v_;
		return (this.setTabindex(v_ = -1),v_);
	};
	
	tag.prototype.context = function (){
		return this._owner_;
	};
	
	tag.prototype.isEditable = function (){
		var context_;
		return (context_ = this.context()) && context_.editable  &&  context_.editable();
	};
	
	tag.prototype.isRich = function (){
		return true;
	};
	
	tag.prototype.isEmpty = function (){
		return this.plaintext().length == 0;
	};
	
	tag.prototype.isOutlineMode = function (){
		return Imba.document().activeElement && Imba.document().activeElement.matches('.Block');
	};
	
	tag.prototype.type = function (){
		return this.data().type;
	};
	
	tag.prototype.selection = function (){
		return this.body().selection();
	};
	
	tag.prototype.plaintext = function (){
		return this.body().plaintext();
	};
	
	tag.prototype.select = function (start,end){
		return (start == undefined) ? this.focus() : this.body().select(start,end);
	};
	
	tag.prototype.range = function (start,end){
		return this.body().range(start,end);
	};
	
	tag.prototype.prevBlock = function (){
		try {
			return this.dom().previousElementSibling._tag;
		} catch (e) { };
	};
	
	tag.prototype.nextBlock = function (){
		try {
			return this.dom().nextElementSibling._tag;
		} catch (e) { };
	};
	
	tag.prototype.removeSelf = function (){
		// need to have at least one block
		if (!(this.nextBlock() || this.prevBlock())) { return };
		return this.orphanize();
	};
	
	tag.prototype.replaceWithBlock = function (block){
		var selection_;
		block = Block.deserialize(block,this.context());
		var sel = (selection_ = this.selection()) && selection_.serialize  &&  selection_.serialize();
		this.parent().dom().replaceChild(block.dom(),this.dom());
		if (sel) { block.select(sel.start,sel.start + sel.length) };
		return block;
	};
	
	tag.prototype.addBlockAfter = function (block){
		block = Block.deserialize(block,this.context());
		this.dom().insertAdjacentElement('afterend',block.dom());
		return block;
	};
	
	tag.prototype.splitBlock = function (offset){
		let range;
		if (offset instanceof Range) {
			range = offset.cloneRange();
			range.setEnd(this.body().dom(),this.body().dom().childNodes.length);
		} else if ((typeof offset=='number'||offset instanceof Number)) {
			range = range(offset,-1);
		};
		
		if (range) {
			let contents = range.extractContents(); 
			let block = this.serialize(
				{body: Entity.serialize(contents.childNodes)}
			);
			return this.addBlockAfter(block);
			
		};
		return null;
	};
	
	
	tag.prototype.schema = function (){
		return Schema[this.type()] || Schema.default;
	};
	
	tag.prototype.focus = function (){
		return this.dom().focus();
		
	};
	
	tag.prototype.onpaste = function (e){
		var data = e.event().clipboardData;
		var blocks = e._blocks;
		
		if (blocks && blocks.DEEP) {
			e.prevent().stop();
			if (!(this.isEmpty())) {
				// split first
				this.splitBlock(this.selection().range());
			};
			
			var next = this;
			for (let i = 0, items = iter$(blocks), len = items.length; i < len; i++) {
				next = next.addBlockAfter(items[i]);
			};
			next.select(-1);
			if (this.isEmpty()) this.removeSelf();
			return;
		};
		
		try {
			// for type in data:types
			// 	console.log type, data.getData(type)
			let json = data.getData('uxa/block');
			var block = JSON.parse(json);
			
			if (block) {
				e.prevent().stop();
				return this.isEmpty() ? this.trigger('morph',block) : this.trigger('addafter',block);
			};
		} catch (e) {
			return this.log('error',e);
		};
	};
	
	tag.prototype.ondel = function (e){
		e.stop();
		
		let next = this.nextBlock();
		let prev = this.prevBlock();
		
		next ? this.trigger('focusafter') : this.trigger('focusbefore');
		if (next || prev) { return this.removeSelf() };
	};
	
	tag.prototype.onfocusafter = function (){
		var block;
		if (block = this.nextBlock()) {
			return this.isOutlineMode() ? block.focus() : block.select(0);
		};
	};
	
	tag.prototype.onfocusbefore = function (){
		var block;
		if (block = this.prevBlock()) {
			return this.isOutlineMode() ? block.focus() : block.select(-1);
		};
	};
	
	tag.prototype.onmorph = function (e,to){
		if ((typeof to=='string'||to instanceof String)) {
			to = Object.assign({},this.data(),{type: to});
		};
		return e._block = this.replaceWithBlock(to);
	};
	
	tag.prototype.onadd = function (e){
		var clone = this.serialize();
		clone.body = [];
		let next = this.context().block(clone); 
		this.dom().insertAdjacentElement('afterend',next.dom());
		return next.edit();
	};
	
	tag.prototype.onaddbefore = function (e,data){
		
		data || (data = {type: this.schema().above || 'p',body: []});
		var block = this.context().block(data);
		
		return this.dom().insertAdjacentElement('beforeBegin',block.dom());
	};
	
	tag.prototype.onaddafter = function (e,fragment){
		if (!fragment) {
			fragment = {type: this.schema().next || this.type(),body: []};
		};
		
		fragment.type = this.schema().next || fragment.type || 'p';
		let next = this.context().block(fragment); 
		this.dom().insertAdjacentElement('afterend',next.dom());
		return next.select(0);
	};
	
	tag.prototype.onmoveup = function (e){
		if (this.prevBlock()) {
			this.dom().insertAdjacentElement('afterend',this.prevBlock().dom());
			return e.stop();
		};
	};
	
	tag.prototype.onmovedown = function (e){
		if (this.nextBlock()) {
			this.dom().insertAdjacentElement('beforeBegin',this.nextBlock().dom());
			return e.stop();
		};
	};
	
	tag.prototype.onjoinabove = function (e){
		var above;
		if (above = this.prevBlock()) {
			if (above instanceof HRBlock) {
				above.removeSelf();
				return;
			};
			
			if (this.plaintext().length == 0) {
				this.trigger('focusbefore');
				
				this.removeSelf();
				return; 
			};
			
			let data = above.serialize();
			let offset = above.plaintext().length;
			data.body = [].concat(data.body,this.serialize().body);
			var block = above.replaceWithBlock(data);
			block.select(offset);
			this.removeSelf();
		};
		return this;
	};
	
	tag.prototype.ondelstart = function (e){
		this.trigger('morph',this.serialize({type: 'p'}));
		return e.stop();
	};
	
	tag.prototype.onduplicate = function (e){
		e.stop();
		var block = this.context().block(this.serialize());
		return this.dom().insertAdjacentElement('beforeBegin',block.dom());
	};
	
	tag.prototype.onkeydown = function (e){
		var self = this, data_, v_, url;
		let key = ((data_ = e.data()) || ((e.setData(v_ = eventKeys(e)),v_)));
		let sel = key.selection;
		let tabtrigger = Triggers[key.textBefore];
		
		self._keydownSel = sel && sel.serialize();
		
		if (self._menu) {
			self._menu && self._menu.onkeydown  &&  self._menu.onkeydown(e,key);
			if (!e.bubble()) {
				return;
			};
		};
		
		
		var call = function(action,params) {
			e._command = self.trigger(action,params);
			e.prevent();
			return e._command;
		};
		
		if (tabtrigger && (key.space || key.enter)) {
			// if let trigger = Triggers[key:textBefore]
			self.select(0,key.textBefore.length).getRangeAt(0).deleteContents();
			if ((typeof tabtrigger=='string'||tabtrigger instanceof String)) { tabtrigger = {type: tabtrigger} };
			let item = self.serialize(tabtrigger);
			return call('morph',item); 
		};
		
		if (key.meta && key.d) {
			call('duplicate');
		} else if (key.meta && key.z) {
			key.shift ? call('redo') : call('undo');
		} else if (key.meta && key.l) {
			e.prevent();
			
			if (key.text) {
				if (url = window.prompt("Link:")) {
					let a = document.createElement('a');
					a.href = url;
					a.target = 'blank';
					
					document.execCommand('createLink',true,url);
				};
			};
		} else if (key.meta && key.b && self.isRich() && key.text) {
			e.prevent();
			document.execCommand('bold');
			
		} else if (key.meta && key.i && self.isRich() && key.text) {
			e.prevent();
			document.execCommand('italic');
			
		} else if (key.down) {
			if (key.meta) {
				return call('movedown');
			};
			if (!sel || sel.atBottom()) {
				return call('focusafter');
			};
		} else if (key.up) {
			if (key.meta) {
				return call('moveup');
			};
			if (!sel || sel.atTop()) {
				return call('focusbefore');
			};
		} else if (key.left) {
			if (!key.textBefore) {
				return call('focusbefore');
			};
		} else if (key.right) {
			if (self.nextBlock() && !key.textAfter) {
				return call('focusafter');
			};
		} else if (key.del && !key.textBefore) {
			if (!sel) {
				return call('del',key);
			} else if (!key.text) {
				return call('delstart',key);
			};
		} else if (key.enter) {
			e.prevent();
			
			
			if (self.plaintext().length == 0 && self.data().type != 'p') {
				call('morph',self.serialize({type: 'p'}));
			} else if (!key.textAfter || key.textAfter == '\n') {
				call('addafter',{body: []});
			} else if (!key.textBefore) {
				call('addbefore');
			} else {
				let range = sel.range().cloneRange();
				range.setEnd(self.body().dom(),self.body().dom().childNodes.length);
				let contents = range.extractContents(); 
				let fragment = self.serialize(
					{body: Entity.serialize(contents.childNodes)}
				);
				call('addafter',fragment);
				self.trigger('dirty');
			};
		};
		return self;
	};
	
	tag.prototype.oninput = function (e){
		// log "oninput!!",e
		var c;
		let text = e.event().data;
		let sel = this.selection().serialize();
		let typ = e.event().inputType || 'unknown';
		
		
		if (this._keydownSel && typ == 'unknown') {
			text = this.plaintext().slice(this._keydownSel.start,sel.start);
			
		};
		
		
		
		
		
		if (text == '/') {
			this.log(sel);
			this.showActionsMenu();
			this._completion = {
				start: sel.start - 1,
				end: sel.end,
				value: "/"
			};
		};
		
		
		if (c = this._completion) {
			if (typ.match(/delete/)) {
				c.end = sel.start;
			} else {
				c.end = sel.start;
			};
			
			c.value = this.plaintext().slice(c.start,c.end);
			
			if (this._menu) {
				this._menu.setQuery(c.value.slice(1));
				if (!c.value) { return this._menu.hide() };
			};
		};
	};
	
	tag.prototype.onfocusout = function (e){
		// log 'onfocusout',e,e.event:relatedTarget
		var rel;
		if (rel = e.event().relatedTarget) {
			if (!this.dom().contains(rel)) {
				this.log("focus moved out of block!");
				if (this._menu) { return this._menu.hide() };
			};
		};
	};
	
	tag.prototype.clearCompletion = function (){
		if (this._completion) {
			this.range(this._completion.start,this._completion.end).deleteContents();
			this._completion = null;
		};
		return this;
	};
	
	tag.prototype.onaction = function (e,data){
		let action = data.action;
		let params = data.params;
		this.log('onaction',data);
		if (action == 'block') {
			this.clearCompletion();
			let block = params[0];
			console.log("adding block",block);
			
			if (block.type == 'hr') {
				this.trigger('addbefore',block);
			} else if (this.plaintext().length == 0) {
				this.trigger('morph',this.serialize(block));
			} else {
				this.trigger('addafter',block);
			};
		};
		return this;
	};
	
	tag.prototype.showActionsMenu = function (){
		if (!this._menu) {
			let pos = this.selection().rect(); 
			console.log("range!!!",pos);
			return this.uxa().open(this._menu = (_1(ActionsMenu)).setData(this).setActions(Actions).end(),{anchor: pos});
			
		};
	};
	
	tag.prototype.serialize = function (overrides){
		if(overrides === undefined) overrides = {};
		return Object.assign({},this.data(),{body: this._body.serialize()},overrides);
	};
	
	tag.prototype.deserialize = function (data){
		this._data = data;
		return this.render();
	};
	
	tag.prototype.edit = function (){
		return this._body.dom().focus();
	};
	
	tag.prototype.body = function (){
		let $ = this.$$ || (this.$$ = {});
		return (this._body = this._body||_1(Content,this).flag('body')).bindData(this,'data',[]).setEditable(this.isEditable()).end();
	};
	
	
	tag.prototype.render = function (){
		return this.$open(0).setFlag(-1,this.data().type).setChildren(
			this.body()
		,3).synced();
	};
})
exports.Block = Block;

var H1Block = Imba.defineTag('H1Block', Block, function(tag){
	tag.register('h1',{nodeType: 'h1'});
});

var H2Block = Imba.defineTag('H2Block', Block, function(tag){
	tag.register('h2',{nodeType: 'h2'});
});

var H3Block = Imba.defineTag('H3Block', Block, function(tag){
	tag.register('h3',{nodeType: 'h3'});
});

var PBlock = Imba.defineTag('PBlock', Block, function(tag){
	tag.register('p',{nodeType: 'p'});
	
	tag.prototype.ondelstart = function (e){
		let prev = this.prevBlock();
		if (prev && prev.matches('.CodeBlock')) {
			prev.focus();
		} else {
			this.trigger('joinabove');
		};
		
		return e.stop();
	};
});

var QuoteBlock = Imba.defineTag('QuoteBlock', Block, function(tag){
	tag.register('quote',{nodeType: 'blockquote'});
});

var HRBlock = Imba.defineTag('HRBlock', Block, function(tag){
	tag.register('hr'); 
	
	tag.prototype.serialize = function (){
		return {type: 'hr'};
	};
	
	tag.prototype.deserialize = function (){
		return this;
	};
	
	tag.prototype.render = function (){
		return this.$open(0).flag('hr').synced();
	};
	
	tag.prototype.focus = function (start){
		if(start === undefined) start = true;
		try {
			if (start) {
				return this.nextBlock().select(0);
			} else {
				return this.prevBlock().select(-1);
			};
		} catch (e) { };
	};
});



/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), self = {};
var keyCodes = {
	esc: 27,
	tab: 9,
	enter: 13,
	space: 32,
	up: 38,
	down: 40,
	left: 37,
	right: 39
};

var KeyMap = {
	9: 'tab',
	13: 'enter',
	32: 'space',
	38: 'up',
	40: 'down',
	37: 'left',
	39: 'right',
	8: 'del',
	46: 'del'
};

var Triggers = __webpack_require__(18).Triggers;

exports.eventKeys = self.eventKeys = function (e){
	// var Keys = do |e|
	var obj = {};
	var str = KeyMap[e.keyCode()];
	var chr = String.fromCharCode(e.keyCode()) || "";
	if (str) { obj[str] = true };
	if (e.event().metaKey) { obj.meta = true };
	if (e.event().shiftKey) { obj.shift = true };
	if (e.event().ctrlKey) { obj.ctrl = true };
	if (e.event().altKey) { obj.alt = true };
	obj[chr] = true;
	obj[chr.toLowerCase()] = true;
	return obj;
};

exports.fuzzyMatch = self.fuzzyMatch = function (needle,haystack){
	var nl = needle.length;
	
	var idx = 0;
	var ni = 0;
	while (ni < nl){
		let chr = needle[ni++];
		idx = haystack.indexOf(chr,idx);
		
		if (idx == -1) { return false };
	};
	
	return true;
};

function ComposeurRange(){ };

exports.ComposeurRange = ComposeurRange; // export class 


function Sel(root,raw){
	if(raw === undefined) raw = window.getSelection();
	this._root = root;
	this._raw = raw;
};

exports.Sel = Sel; // export class 
Sel.prototype.raw = function(v){ return this._raw; }
Sel.prototype.setRaw = function(v){ this._raw = v; return this; };
Sel.prototype.range = function (){
	return this._raw.getRangeAt(0);
};

Sel.prototype.prefix = function (){
	let range = this.range().cloneRange();
	range.collapse();
	range.setStart(this._root,0);
	return range.toString();
};

Sel.prototype.postfix = function (){
	let range = this.range().cloneRange();
	range.collapse(false);
	range.setEnd(this._root,this._root.childNodes.length);
	return range.toString();
};

Sel.prototype.surround = function (node){
	if ((typeof node=='string'||node instanceof String)) {
		node = document.createElement(node);
	} else if (node instanceof Imba.Tag) {
		node = node.dom();
	};
	
	this.range().surroundContents(node);
	
	this.raw().removeAllRanges(); 
	var r2 = new Range();
	r2.selectNodeContents(node);
	this.raw().addRange(r2);
	return this;
};

Sel.prototype.start = function (){
	return this.prefix().length;
};

Sel.prototype.rect = function (){
	if (this._rect) { return this._rect };
	this._rect = this.range().getBoundingClientRect();
	
	if (this._rect.bottom == 0) {
		let data = this.serialize();
		let start = data.before ? ((data.start - 1)) : data.start;
		if (data.length == 0) {
			let other = Sel.range(this._root,start,start + 1);
			this._rect = other.getBoundingClientRect();
		};
	};
	return this._rect;
};

Sel.prototype.toString = function (){
	return this.raw().toString();
};

Sel.prototype.atStart = function (){
	return this.raw().isCollapsed && this.start() == 0;
};

Sel.prototype.atEnd = function (){
	return this.raw().isCollapsed && this.postfix().length == 0;
};

Sel.prototype.textBefore = function (){
	return this.prefix();
};

Sel.prototype.textAfter = function (){
	return this.postfix();
};

Sel.prototype.atTop = function (){
	var bounds = this.rect();
	var box = this._root.getBoundingClientRect();
	var pad = window.getComputedStyle(this._root,null).getPropertyValue('padding-top');
	return Math.abs(box.top + parseInt(pad) - bounds.top) < 6 || this.atStart();
};

Sel.prototype.atBottom = function (){
	var bounds = this.rect();
	var box = this._root.getBoundingClientRect();
	var pad = window.getComputedStyle(this._root,null).getPropertyValue('padding-bottom');
	console.log("atBottom?",bounds,box,pad);
	return Math.abs(box.bottom - bounds.bottom - parseInt(pad)) < 6 || this.atEnd();
};

Sel.prototype.insert = function (content){
	if ((typeof content=='string'||content instanceof String)) {
		content = document.createTextNode(content);
	};
	
	var range = this.range();
	range.insertNode(content);
	return range;
};

Sel.prototype.serialize = function (){
	return this._serialized || (this._serialized = {
		start: this.start(),
		length: this.toString().length,
		text: this.toString(),
		before: this.prefix(),
		after: this.postfix()
	});
};

Sel.setCaret = function (element,offset){
	var range = document.createRange(); 
	range.selectNodeContents(element._dom || element); 
	range.collapse((offset == -1) ? false : true); 
	var selection = window.getSelection(); 
	selection.removeAllRanges(); 
	selection.addRange(range); 
	return selection;
};

Sel.range = function (node,start,end,range){
	if (start < 0) {
		start = Math.max(node.innerText.length + (start + 1),0);
	};
	
	if (end == undefined) {
		end = start;
	};
	
	if (end < 0) {
		end = Math.max(node.innerText.length + (end + 1),0);
	};
	
	
	
	var range = document.createRange();
	var walk = document.createTreeWalker(node,NodeFilter.SHOW_TEXT);
	var text;
	var currOffset = 0;
	var starter;
	var ender;
	var prevNode;
	
	if (start == 0) {
		range.setStart(node,0);
	};
	
	while (text = walk.nextNode()){
		prevNode = text;
		let textStart = currOffset;
		let textEnd = textStart + text.length;
		currOffset += text.length;
		
		if (start >= textStart && start <= textEnd) {
			// console.log "inside text",text
			range.setStart(starter = text,start - textStart);
		};
		
		if (end >= textStart && end < textEnd) {
			range.setEnd(ender = text,end - textStart);
			break;
		};
	};
	
	if (!ender && prevNode) {
		// console.log "no ender",prevNode
		range.setEnd(prevNode,prevNode.length);
	};
	return range;
};

Sel.select = function (node,start,end){
	var range = Sel.range(node,start,end);
	var selection = window.getSelection(); 
	selection.removeAllRanges(); 
	selection.addRange(range); 
	return selection;
};



/***/ }),
/* 10 */
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
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);
var Popover = Imba.defineTag('Popover')
exports.Popover = Popover;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);

var Snackbar = Imba.defineTag('Snackbar')
exports.Snackbar = Snackbar;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0), _2 = Imba.createTagList, _1 = Imba.createElement;

var Field = Imba.defineTag('Field', function(tag){
	tag.prototype.label = function(v){ return this._label; }
	tag.prototype.setLabel = function(v){ this._label = v; return this; };
	tag.prototype.desc = function(v){ return this._desc; }
	tag.prototype.setDesc = function(v){ this._desc = v; return this; };
	tag.prototype.multiline = function(v){ return this._multiline; }
	tag.prototype.setMultiline = function(v){ this._multiline = v; return this; };
	
	['disabled','placeholder','type','name','value','required','pattern','minlength','maxlength','autocomplete','formatter','autofocus'].map(function(key) {
		var setter = Imba.toCamelCase(("set-" + key));
		tag.prototype[key] = function(val) { return this.input()[key](); };
		return tag.prototype[setter] = function(val) {
			if (key == 'type') {
				this.setFlag('type',val);
			};
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
		return this.$open(0).flag('field').flagIf('has-label',(!(!(this.label())))).setChildren([
			this.input(),
			this.label() ? (
				($[0] || _1('label',$,0,this)).setContent(this.label(),3)
			) : void(0),
			($[1] || _1('hr',$,1,this)),
			($[2] || _1('div',$,2,this).flag('help').flag('desc')).setContent(this.desc(),3)
		],1).synced();
	};
})
exports.Field = Field;

var TagInput = __webpack_require__(14).TagInput;

var TextField = Imba.defineTag('TextField', Field)
exports.TextField = TextField;

var TagField = Imba.defineTag('TagField', Field, function(tag){
	
	tag.prototype.input = function (){
		let $ = this.$$ || (this.$$ = {});
		return (this._in = this._in||_1(TagInput,this).flag('in')).end();
	};
})
exports.TagField = TagField;


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
	tag.prototype.autofocus = function(v){ return this.getAttribute('autofocus'); }
	tag.prototype.setAutofocus = function(v){ this.setAttribute('autofocus',v); return this; };
	
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
		e.stop();
		this.raw().dom().value = this.value();
		this._syncing = true;
		this.raw().oninput(e);
		this._syncing = false;
		return this;
	};
	
	tag.prototype.commit = function (){
		if (this._raw._data) {
			let val = this._raw._data.getFormValue(this._raw);
			if (val != this._proxyVal) {
				this.setValue(this._proxyVal = val);
			};
		};
		return this;
	};
});

var TextArea = Imba.defineTag('TextArea', Field, function(tag){
	
	tag.prototype.input = function (){
		let $ = this.$$ || (this.$$ = {});
		return (this._input = this._input||_1(Editable,this).flag('input')).end();
	};
	
	tag.prototype.bindData = function (target,path,args){
		this.input().raw().bindData(target,path,args);
		return this;
	};
	
	tag.prototype.oninput = function (e){
		this.input().setValue(this.input().raw().value());
		return e.stop();
	};
	
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).flag('field').flagIf('has-label',(!(!(this.label())))).setChildren([
			this.input().raw(),
			this._input,
			this.label() ? (
				($[0] || _1('label',$,0,this)).setContent(this.label(),3)
			) : void(0),
			($[1] || _1('hr',$,1,this)),
			($[2] || _1('div',$,2,this).flag('help').flag('desc')).setContent(this.desc(),3)
		],1).synced();
	};
})
exports.TextArea = TextArea;

var CheckBox = Imba.defineTag('CheckBox', Field, function(tag){
	
	tag.prototype.content = function(v){ return this._content; }
	tag.prototype.setContent = function(v){ this._content = v; return this; };
	
	tag.prototype.input = function (){
		let $ = this.$$ || (this.$$ = {});
		return (this._input = this._input||_1('input',this).flag('input').setType('checkbox')).end();
	};
	
	tag.prototype.bindData = function (target,path,args){
		(this._input || this.input()).bindData(target,path,args);
		return this;
	};
	
	tag.prototype.render = function (){
		return this.$open(0).flag('field').setChildren([
			this.input(),
			this._content
		],1).synced();
	};
})
exports.CheckBox = CheckBox;


var SelectField = Imba.defineTag('SelectField', Field, function(tag){
	
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
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0), _2 = Imba.createTagList, _1 = Imba.createElement;

var Editable = Imba.defineTag('Editable', function(tag){
	tag.prototype.__placeholder = {'default': " ",name: 'placeholder'};
	tag.prototype.placeholder = function(v){ return this.getAttribute('placeholder'); }
	tag.prototype.setPlaceholder = function(v){ this.setAttribute('placeholder',v); return this; }
	tag.prototype._placeholder = " ";
	
	tag.prototype.atStartModifier = function (){
		var sel;
		if (sel = this.selection()) {
			if (sel.isCollapsed && sel.baseOffset == 0) {
				return true;
			};
		};
		return false;
	};
	
	tag.prototype.build = function (){
		this.setTabindex(0);
		this.dom().textContent = "";
		
		try {
			this.dom().contentEditable = "plaintext-only";
		} catch (e) {
			this.dom().contentEditable = true;
		};
		
		return this.$open('build0').on$(-1,['keydown','left','atStart','stop','focusPrev'],this).on$(-2,['keydown','del','atStart','stop','focusPrev'],this).on$(-3,['keydown','enter','stop','prevent','submit'],this).synced();
	};
	
	tag.prototype.focusPrev = function (){
		try {
			return this.dom().previousElementSibling.focus();
		} catch (e) { };
	};
	
	tag.prototype.value = function (){
		return this.dom().innerText || "";
	};
	
	tag.prototype.selection = function (){
		var sel = window.getSelection();
		if (!(sel && this.dom().contains(sel.anchorNode))) { return null };
		return sel;
	};
	
	tag.prototype.oninput = function (e){
		return this.log('input',e);
	};
	
	tag.prototype.onkeydown = function (e){
		return e.stop();
	};
	
	tag.prototype.clear = function (){
		this.dom().textContent = "";
		return this;
	};
	
	tag.prototype.submit = function (){
		let e = this.trigger('add',this.value());
		this.log('submitted',e);
		if (!e.isPrevented()) {
			return this.clear();
		};
	};
	
	tag.prototype.render = function (){
		return this.flagIf('empty',this.value().trim() == "");
	};
});

var Value = Imba.defineTag('Value', function(tag){
	tag.prototype.index = function(v){ return this._index; }
	tag.prototype.setIndex = function(v){ this._index = v; return this; };
	
	tag.prototype.build = function (){
		var v_;
		return (this.setTabindex(v_ = -1),v_);
	};
	
	tag.prototype.gotoNext = function (){
		try {
			this.dom().nextElementSibling.focus();
		} catch (e) { };
		return this;
	};
	
	tag.prototype.gotoPrev = function (){
		try {
			this.dom().previousElementSibling.focus();
		} catch (e) { };
		return this;
	};
	
	tag.prototype.removeItem = function (){
		let next = this.dom().nextElementSibling;
		
		if (next && next.matches('.Editable')) this.gotoNext();
		return this.trigger('remove',{index: this.index()});
	};
	
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).dataset('value',this.data()).on$(-1,['keydown','left','gotoPrev'],this).on$(-2,['keydown','right','prevent','gotoNext'],this).on$(-3,['keydown','del','prevent','removeItem'],this).setChildren(
			$[0] || _1('span',$,0,this).flag('value')
		,2).synced((
			$[0].setContent(this.data(),3)
		,true));
	};
});

var TagInput = Imba.defineTag('TagInput', function(tag){
	
	tag.prototype.pattern = function(v){ return this._pattern; }
	tag.prototype.setPattern = function(v){ this._pattern = v; return this; };
	tag.prototype.formatter = function(v){ return this._formatter; }
	tag.prototype.setFormatter = function(v){ this._formatter = v; return this; };
	tag.prototype.__placeholder = {'default': "Add...",name: 'placeholder'};
	tag.prototype.placeholder = function(v){ return this._placeholder; }
	tag.prototype.setPlaceholder = function(v){ this._placeholder = v; return this; }
	tag.prototype._placeholder = "Add...";
	tag.prototype.__minlength = {'default': 0,name: 'minlength'};
	tag.prototype.minlength = function(v){ return this._minlength; }
	tag.prototype.setMinlength = function(v){ this._minlength = v; return this; }
	tag.prototype._minlength = 0;
	tag.prototype.__maxlength = {'default': 0,name: 'maxlength'};
	tag.prototype.maxlength = function(v){ return this._maxlength; }
	tag.prototype.setMaxlength = function(v){ this._maxlength = v; return this; }
	tag.prototype._maxlength = 0;
	
	tag.prototype.build = function (){
		return this._values = ['one','two'];
	};
	
	tag.prototype.bindData = function (data,key,args){
		this._proxy = [data,key,args];
		return this;
	};
	
	tag.prototype.values = function (){
		if (this._proxy) {
			let val = this._proxy[0][this._proxy[1]] || (this._proxy[0][this._proxy[1]] = []);
			return this._proxy[2] ? val.apply(this._proxy[0],this._proxy[2]) : val;
		} else {
			return this._values;
		};
	};
	
	tag.prototype.onadd = function (e,value){
		var values = this.values();
		var val = this._formatter ? this._formatter(value || '',values) : value;
		
		if (this.maxlength() && values.length >= this.maxlength()) {
			return this;
		};
		
		if (values.indexOf(val) < 0) {
			values.push(val);
		};
		return e.stop();
	};
	
	tag.prototype.onremove = function (e,pars){
		if(!pars||pars.constructor !== Object) pars = {};
		var index = pars.index !== undefined ? pars.index : null;
		if (index != null) {
			this.values().splice(index,1);
		};
		return this;
	};
	
	tag.prototype.render = function (){
		var self = this, $ = this.$;
		return self.$open(0).setChildren([
			(function tagLoop($0) {
				for (let i = 0, items = iter$(self.values()), len = $0.taglen = items.length; i < len; i++) {
					($0[i] || _1(Value,$0,i)).setData(items[i]).setIndex(i).end();
				};return $0;
			})($[0] || _2($,0)),
			$[1] || _1(Editable,$,1,self)
		],1).synced((
			$[1].setPlaceholder(self.placeholder()).end()
		,true));
	};
})
exports.TagInput = TagInput;


/***/ }),
/* 15 */
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
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

function len$(a){
	return a && (a.len instanceof Function ? a.len() : a.length) || 0;
};
var Imba = __webpack_require__(0), _1 = Imba.createElement;
var Queue = __webpack_require__(17).Queue;

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
/* 17 */
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
/* 18 */
/***/ (function(module, exports) {

var Triggers = exports.Triggers = {
	'#': 'h1',
	'##': 'h2',
	'###': 'h3',
	'*': 'li',
	'-': 'li',
	'/code': 'code',
	'/js': {type: 'code',language: 'javascript'},
	'/imba': {type: 'code',language: 'imba'},
	'/html': {type: 'code',language: 'html'},
	'/css': {type: 'code',language: 'css'}
};

var Languages = {
	javascript: "JavaScript",
	imba: "Imba",
	html: "HTML",
	css: "CSS"
};

var Types = {};
var Presets = [{
	type: 'h1'
},{
	type: 'h2'
}];

var STATE = exports.STATE = {
	editable: false
};

var Schema = exports.Schema = {
	h1: {next: 'p'},
	h2: {next: 'p'},
	h3: {next: 'p'},
	li: {next: 'li'},
	code: {next: 'p'},
	'default': {}
};

var Actions = exports.Actions = [
	{name: "Text",desc: "Plain text.",action: 'block',params: [{type: 'p'}]},
	{name: "Header",desc: "A large header with margin.",action: 'block',params: [{type: 'h1'}],shortcut: '#'},
	{name: "Sub Header",desc: "A smaller header",action: 'block',params: [{type: 'h2'}],shortcut: '##'},
	{name: "Bulleted List",desc: "Create a simple bulleted list",shortcut: '*',action: 'block',params: [{type: 'li'}]},
	{name: "Quote",desc: "Capture a quote.",action: 'block',params: [{type: 'quote'}]},
	{name: "Separator",desc: "Start new section.",action: 'block',params: [{type: 'hr'}]},
	
	{name: "Code",category: 'code',action: 'block',params: [{type: 'code',language: 'txt'}]}




];

for (let key in Languages){
	let val;
	val = Languages[key];var action = {name: val,type: 'code',action: 'block',params: [{type: 'code',language: key}]};
	Actions.push(action);
};

Actions.map(function(action) {
	return action.find = [action.name].join(' ').toLowerCase();
});


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
__webpack_require__(3);
var Router = __webpack_require__(36).Router;
var App = __webpack_require__(38).App;

var socket = new WebSocket('ws://localhost:3002/socket');

var Code = __webpack_require__(7).Code;

var highlight = __webpack_require__(49).highlight;
Code.highlight = highlight;


socket.onmessage = function(e) {
	var v_;
	console.log('got message!!!',e);
	return (Imba.getTagSingleton('uxa-css').setHref(v_ = ("style.css?" + (Math.random()))),v_);
};

var app = (_1(App)).setRouter(new Router()).end();

app.router().onReady(function() {
	document.body.innerHTML = '';
	return Imba.mount(app);
});


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var Imba = __webpack_require__(1);
var activate = false;
var ns = ((typeof window !== 'undefined') ? window : (((typeof global !== 'undefined') ? global : null)));

if (ns && ns.Imba) {
	console.warn(("Imba v" + (ns.Imba.VERSION) + " is already loaded."));
	Imba = ns.Imba;
} else if (ns) {
	ns.Imba = Imba;
	activate = true;
	if (ns.define && ns.define.amd) {
		ns.define("imba",[],function() { return Imba; });
	};
};

module.exports = Imba;

if (true) {
	__webpack_require__(21);
	__webpack_require__(22);
};

if (activate) {
	Imba.EventManager.activate();
};

if (false) {};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ }),
/* 21 */
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
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(1);

__webpack_require__(23);
__webpack_require__(24);

Imba.TagManager = new Imba.TagManagerClass();

__webpack_require__(25);
__webpack_require__(26);
__webpack_require__(10);
__webpack_require__(27);
__webpack_require__(28);

if (true) {
	__webpack_require__(29);
};

if (false) {};


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);

Imba.TagManagerClass = function TagManagerClass(){
	this._inserts = 0;
	this._removes = 0;
	this._mounted = [];
	this._mountables = 0;
	this._unmountables = 0;
	this._unmounting = 0;
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
	this._unmounting++;
	
	var unmount = [];
	var root = document.body;
	for (let i = 0, items = iter$(this._mounted), len = items.length, item; i < len; i++) {
		item = items[i];
		if (!item) { continue; };
		if (!document.documentElement.contains(item._dom)) {
			unmount.push(item);
			this._mounted[i] = null;
		};
	};
	
	this._unmounting--;
	
	if (unmount.length) {
		this._mounted = this._mounted.filter(function(item) { return item && unmount.indexOf(item) == -1; });
		for (let i = 0, len = unmount.length, item; i < len; i++) {
			item = unmount[i];
			item.FLAGS = item.FLAGS & ~Imba.TAG_MOUNTED;
			if (item.unmount && item._dom) {
				item.unmount();
			} else if (item._scheduler) {
				item.unschedule();
			};
		};
	};
	return this;
};


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(1);
__webpack_require__(10);

var native$ = [
	'keydown','keyup','keypress',
	'textInput','input','change','submit',
	'focusin','focusout','focus','blur',
	'contextmenu','selectstart','dblclick','selectionchange',
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
	Imba.Events = new Imba.EventManager(Imba.document(),{events: []});
	if (false) {};
	
	Imba.POINTER || (Imba.POINTER = new Imba.Pointer());
	
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
	
	if (true) {
		window.addEventListener('hashchange',Imba.commit);
		window.addEventListener('popstate',Imba.commit);
	};
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
	
	if (true) {
		window.removeEventListener('hashchange',Imba.commit);
		window.removeEventListener('popstate',Imba.commit);
	};
	
	return this;
};


/***/ }),
/* 25 */
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

Imba.Tag.prototype.setNestedAttr = function (ns,name,value,modifiers){
	if (this[ns + 'SetAttribute']) {
		this[ns + 'SetAttribute'](name,value,modifiers);
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

Imba.Tag.prototype.css = function (key,val,mod){
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
	} else if (name.match(/^--/)) {
		this.dom().style.setProperty(name,val);
	} else {
		if ((typeof val=='number'||val instanceof Number) && (name.match(/width|height|left|right|top|bottom/) || (mod && mod.px))) {
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
	input: "accept disabled form list max maxlength min minlength pattern required size step type",
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
	textarea: "rows cols minlength maxlength",
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
/* 26 */
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
/* 27 */
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
/* 28 */
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
/* 29 */
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
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
var Menu = __webpack_require__(4).Menu;
var Popover = __webpack_require__(11).Popover;
var Snackbar = __webpack_require__(12).Snackbar;

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
		this._activeElement = document.activeElement;
		
		document.body.appendChild(this.dom());
		this.component().trigger('uxashow');
		if (this._isMenu || this._options.anchor) this.reflow();
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
		
		var refocus = self._activeElement;
		self._activeElement = null;
		
		if (self.target()) {
			(target_ = self.target()) && target_.unflag  &&  target_.unflag('uxa-overlay-active');
		};
		
		setTimeout(function() {
			if (refocus && refocus.offsetParent) {
				return refocus.focus();
			};
		},20);
		
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
		let box = this._options.anchor;
		if ((!box || box == true) && (this.target() instanceof Imba.Tag)) {
			if (!this.target().dom().offsetParent) {
				if (!this.hasFlag('hide')) this.hide();
				return this;
			};
			box || (box = this.target().dom().getBoundingClientRect());
		};
		
		
		if (!box) { return };
		
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
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
var Icon = __webpack_require__(5).Icon;

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
		
		e.prevent().stop().silence();
		
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
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
var Form = __webpack_require__(15).Form;
var Button = __webpack_require__(6).Button;
var Indicator = __webpack_require__(16).Indicator;

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
		e.prevent().stop(); 
		
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
		return (t0 = this._footer = this._footer||(t0=_1('footer',this)).flag('footer').setContent(t0.$.A || _1('div',t0.$,'A',t0).flag('spaced').flag('bar').flag('justify-end').setContent([
			_1(Button,t0.$,'B','A').setType('button').on$(0,['tap','tapDismiss'],this),
			_1(Button,t0.$,'C','A').flag('primary').setType('submit')
		],2),2)).end((
			t0.$.B.setLabel(this.cancelLabel()).end(),
			t0.$.C.setLabel(this.submitLabel()).end()
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
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
var IconButton = __webpack_require__(6).IconButton;

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
/* 34 */
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
/* 35 */
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

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

function len$(a){
	return a && (a.len instanceof Function ? a.len() : a.length) || 0;
};
var Imba = __webpack_require__(0);
var Route = __webpack_require__(37).Route;

// check if is web

var isWeb = typeof window !== 'undefined';

function Router(o){
	if(o === undefined) o = {};
	this._url = o.url || '';
	this._hash = '';
	this._routes = {};
	this._options = o;
	this._redirects = o.redirects || {};
	this._aliases = o.aliases || {};
	this._busy = [];
	this._root = o.root || '';
	this.setMode(o.mode || 'history');
	this.setup();
	this;
};

exports.Router = Router; // export class 
Router._instance = null;

Router.prototype.__mode = {watch: 'modeDidSet',chainable: true,name: 'mode'};
Router.prototype.mode = function(v){ return v !== undefined ? (this.setMode(v),this) : this._mode; }
Router.prototype.setMode = function(v){
	var a = this.mode();
	if(v != a) { this._mode = v; }
	if(v != a) { this.modeDidSet && this.modeDidSet(v,a,this.__mode) }
	return this;
};
Router.prototype.busy = function(v){ return this._busy; }
Router.prototype.setBusy = function(v){ this._busy = v; return this; };
Router.prototype.root = function(v){ return this._root; }
Router.prototype.setRoot = function(v){ this._root = v; return this; };

// support redirects
Router.prototype.option = function (key,value){
	if (value == undefined) {
		return this._options[key];
	} else {
		this._options[key] = value;
	};
	return this;
};

Router.prototype.location = function (){
	return document.location;
};

Router.prototype.setup = function (){
	var self = this;
	if (isWeb) {
		// let url = location:pathname
		// temporary hack to support scrimba out-of-the-box
		if (!self._root && window.SCRIMBA_ROOT && self.mode() != 'hash') {
			self._root = window.SCRIMBA_ROOT.replace(/\/$/,'');
		};
		
		let url = self.path();
		// if url and @redirects[url]
		self.history().replaceState({},null,self.normalize(url));
		
		self._hash = self.location().hash;
		window.addEventListener('hashchange',function(e) {
			self.emit('hashchange',self._hash = self.location().hash);
			return Imba.commit();
		});
	};
	return self;
};

Router.prototype.path = function (){
	let url = this._url || (isWeb ? (((this.mode() == 'hash') ? (this.hash() || '').slice(1) : this.location().pathname)) : '');
	if (this._root && url.indexOf(this._root) == 0) {
		url = url.slice(this._root.length);
	};
	if (url == '') { url = '/' };
	url = this._redirects[url] || url;
	url = this._aliases[url] || url;
	return url;
};

Router.prototype.url = function (){
	var url = this.path();
	if (isWeb && this.mode() != 'hash') {
		url += this.location().hash;
	};
	return url;
};

Router.prototype.hash = function (){
	return isWeb ? this.location().hash : '';
};

Router.instance = function (){
	return this._instance || (this._instance = new this());
};

Router.prototype.history = function (){
	return window.history;
};

Router.prototype.match = function (pattern){
	var route = this._routes[pattern] || (this._routes[pattern] = new Route(this,pattern));
	return route.test();
};

Router.prototype.go = function (url,state){
	// remove hash if we are hash-based and url includes hash
	var self = this;
	if(state === undefined) state = {};
	url = self._redirects[url] || url;
	
	self.history().pushState(state,null,self.normalize(url));
	// now commit and schedule events afterwards
	Imba.commit();
	
	isWeb && self.onReady(function() {
		let hash = self.location().hash;
		if (hash != self._hash) {
			return self.emit('hashchange',self._hash = hash);
		};
	});
	return self;
};

Router.prototype.replace = function (url,state){
	if(state === undefined) state = {};
	url = this._redirects[url] || url;
	return this.history().replaceState(state,null,this.normalize(url));
};

Router.prototype.normalize = function (url){
	if (this.mode() == 'hash') {
		url = ("#" + url);
	} else if (this.root()) {
		url = this.root() + url;
	};
	return url;
};

Router.prototype.onReady = function (cb){
	var self = this;
	return Imba.ticker().add(function() {
		return (len$(self._busy) == 0) ? cb(self) : Imba.once(self,'ready',cb);
	});
};

Router.prototype.emit = function (name){
	var $0 = arguments, i = $0.length;
	var params = new Array(i>1 ? i-1 : 0);
	while(i>1) params[--i - 1] = $0[i];
	return Imba.emit(this,name,params);
};
Router.prototype.on = function (name){
	var Imba_;
	var $0 = arguments, i = $0.length;
	var params = new Array(i>1 ? i-1 : 0);
	while(i>1) params[--i - 1] = $0[i];
	return Imba.listen.apply(Imba,[].concat([this,name], [].slice.call(params)));
};
Router.prototype.once = function (name){
	var Imba_;
	var $0 = arguments, i = $0.length;
	var params = new Array(i>1 ? i-1 : 0);
	while(i>1) params[--i - 1] = $0[i];
	return Imba.once.apply(Imba,[].concat([this,name], [].slice.call(params)));
};
Router.prototype.un = function (name){
	var Imba_;
	var $0 = arguments, i = $0.length;
	var params = new Array(i>1 ? i-1 : 0);
	while(i>1) params[--i - 1] = $0[i];
	return Imba.unlisten.apply(Imba,[].concat([this,name], [].slice.call(params)));
};

const LinkExtend = {
	inject: function(node,opts){
		let render = node.render;
		node.resolveRoute = this.resolveRoute;
		node.beforeRender = this.beforeRender;
		return node.ontap || (node.ontap = this.ontap);
	},
	
	beforeRender: function(){
		this.resolveRoute();
		return true;
	},
	
	ontap: function(e){
		var href = this._route.resolve();
		
		if (!href) { return };
		
		if (this._route.option('sticky')) {
			let prev = this._route.params().url;
			if (prev && prev.indexOf(href) == 0) {
				href = prev;
			};
		};
		
		if ((href[0] != '#' && href[0] != '/')) {
			e._responder = null;
			e.prevent().stop();
			// need to respect target
			return window.open(href,'_blank');
		};
		
		if (e.meta() || e.alt()) {
			e._responder = null;
			e.prevent().stop();
			return window.open(this.router().root() + href,'_blank');
		};
		
		e.prevent().stop();
		return this.router().go(href,{});
	},
	
	resolveRoute: function(){
		let match = this._route.test();
		this.setAttribute('href',this.router().root() + this._route.resolve());
		return this.flagIf('active',this._route.test());
	}
};


const RoutedExtend = {
	
	inject: function(node){
		node._params = {};
		node.resolveRoute = this.resolveRoute;
		node.beforeRender = this.beforeRender;
		return node.detachFromParent();
	},
	
	beforeRender: function(){
		this.resolveRoute();
		if (!this._params._active) { return false };
		
		let status = this._route.status();
		
		if (this[("render" + status)]) {
			this[("render" + status)]();
			return false;
		};
		
		if (status >= 200) {
			return true;
		};
		
		return false;
	},
	
	resolveRoute: function(next){
		var self = this;
		let prev = self._params;
		let match = self._route.test();
		
		if (match) {
			if (match != prev) {
				self.setParams(match);
				if (self.load) {
					self.route().load(function() { return self.load(self.params()); });
				};
			};
			// call method every time if the actual url has changed - even if match is the same?
			
			if (!match._active) {
				match._active = true;
				// should happen after load?
				return self.attachToParent();
			};
		} else if (prev._active) {
			prev._active = false;
			return self.detachFromParent();
		};
	}
};


Imba.extendTag('element', function(tag){
	tag.prototype.__params = {watch: 'paramsDidSet',name: 'params'};
	tag.prototype.params = function(v){ return this._params; }
	tag.prototype.setParams = function(v){
		var a = this.params();
		if(v != a) { this._params = v; }
		if(v != a) { this.paramsDidSet && this.paramsDidSet(v,a,this.__params) }
		return this;
	};
	
	tag.prototype.route = function (){
		return this._route;
	};
	
	tag.prototype.setRoute = function (path,mods){
		let prev = this._route;
		
		if (!prev) {
			path = String(path);
			let par = (path[0] != '/') ? this.getParentRoute() : null;
			let opts = mods || {};
			opts.node = this;
			this._route = new Route(this.router(),path,par,opts);
			if (opts.link) {
				LinkExtend.inject(this,opts);
			} else {
				RoutedExtend.inject(this);
			};
		} else if (String(path) != prev._raw) {
			prev.setPath(String(path));
		};
		return this;
	};
	
	tag.prototype.setRouteTo = function (path,mods){
		if (this._route) {
			return this.setRoute(path);
		} else {
			mods || (mods = {});
			mods.link = true;
			return this.setRoute(path,mods);
		};
	};
	
	// for server
	tag.prototype.setRouterUrl = function (url){
		this._router || (this._router = new Router(url));
		return this;
	};
	
	tag.prototype.setRouterRoot = function (url){
		this.router().setRoot(url);
		return this;
	};
	
	tag.prototype.getParentRoute = function (){
		var route = null;
		var par = this._owner_;
		while (par){
			if (par._route) {
				return par._route;
			};
			par = par._owner_;
		};
		return null;
	};
	
	tag.prototype.setRouter = function (router){
		this._router = router;
		return this;
	};
	
	tag.prototype.router = function (){
		return this._router || (this._router = (this._owner_ && this._owner_.router() || new Router()));
		// isWeb ? Router.instance : (@router or (@owner_ ? @owner_.router : (@router ||= Router.new)))
	};
});


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0);
var isWeb = typeof window !== 'undefined';

function Route(router,str,parent,options){
	this._parent = parent;
	this._router = router;
	this._options = options || {};
	this._node = this._options.node;
	this._status = 200;
	this.setPath(str);
};

exports.Route = Route; // export class 
Route.prototype.raw = function(v){ return this._raw; }
Route.prototype.setRaw = function(v){ this._raw = v; return this; };
Route.prototype.params = function(v){ return this._params; }
Route.prototype.setParams = function(v){ this._params = v; return this; };
Route.prototype.__status = {watch: 'statusDidSet',name: 'status'};
Route.prototype.status = function(v){ return this._status; }
Route.prototype.setStatus = function(v){
	var a = this.status();
	if(v != a) { this._status = v; }
	if(v != a) { this.statusDidSet && this.statusDidSet(v,a,this.__status) }
	return this;
};

Route.prototype.option = function (key){
	return this._options[key];
};

Route.prototype.setPath = function (path){
	var self = this;
	self._raw = path;
	self._groups = [];
	self._params = {};
	self._cache = {};
	path = path.replace(/\:(\w+|\*)(\.)?/g,function(m,id,dot) {
		// what about :id.:format?
		if (id != '*') { self._groups.push(id) };
		if (dot) {
			return "([^\/\#\.\?]+)\.";
		} else {
			return "([^\/\#\?]+)";
		};
	});
	
	path = '^' + path;
	if (self._options.exact && path[path.length - 1] != '$') {
		path = path + '(?=[\#\?]|$)';
	} else {
		// we only want to match end OR /
		path = path + '(?=[\/\#\?]|$)';
	};
	self._regex = new RegExp(path);
	return self;
};

Route.prototype.test = function (url){
	var m, match;
	url || (url = this._router.url()); // should include hash?
	if (url == this._cache.url) { return this._cache.match };
	
	let prefix = '';
	let matcher = this._cache.url = url;
	this._cache.match = null;
	
	if (this._parent && this._raw[0] != '/') {
		if (m = this._parent.test(url)) {
			if (url.indexOf(m.path) == 0) {
				prefix = m.path + '/';
				matcher = url.slice(m.path.length + 1);
			};
		};
	};
	
	if (match = matcher.match(this._regex)) {
		let path = prefix + match[0];
		if (path == this._params.path) {
			this._params.url = url;
			return this._cache.match = this._params;
		};
		
		this._params = {path: path,url: url};
		if (this._groups.length) {
			for (let i = 0, items = iter$(match), len = items.length, item, name; i < len; i++) {
				item = items[i];
				if (name = this._groups[i - 1]) {
					this._params[name] = item;
				};
			};
		};
		
		return this._cache.match = this._params;
	};
	
	return this._cache.match = null;
};

// should split up the Route types
Route.prototype.statusDidSet = function (status,prev){
	let idx = this._router.busy().indexOf(this);
	clearTimeout(this._statusTimeout);
	
	if (status < 200) {
		if (idx == -1) { this._router.busy().push(this) };
		this._statusTimeout = setTimeout(function() { return status = 408; },25000);
	} else if (idx >= 0 && status >= 200) {
		this._router.busy().splice(idx,1);
		
		// immediately to be able to kick of nested routes
		// is not commit more natural?
		this._node && this._node.commit  &&  this._node.commit();
		// Imba.commit
		if (this._router.busy().length == 0) {
			Imba.emit(this._router,'ready',[this._router]);
		};
	};
	
	return this._node && this._node.setFlag  &&  this._node.setFlag('route-status',("status-" + status));
};

Route.prototype.load = function (cb){
	var self = this;
	self.setStatus(102);
	
	var handler = self._handler = function(res) {
		var v_;
		if (handler != self._handler) {
			console.log("another load has started after this");
			return;
		};
		
		self._handler = null;
		return (self.setStatus(v_ = ((typeof res=='number'||res instanceof Number)) ? res : 200),v_);
	};
	
	if (cb instanceof Function) {
		cb = cb(handler);
	};
	
	if (cb && cb.then) {
		cb.then(handler,handler);
	} else {
		handler(cb);
	};
	return self;
};

Route.prototype.resolve = function (url){
	var m;
	url || (url = this._router.url());
	if (this._cache.resolveUrl == url) {
		return this._cache.resolved;
	};
	
	// let base = @router.root or ''
	let base = '';
	this._cache.resolveUrl = url; // base + url
	
	if (this._parent && this._raw[0] != '/') {
		if (m = this._parent.test()) {
			this._cache.resolved = base + m.path + '/' + this._raw; // .replace('$','')
		};
	} else {
		// FIXME what if the url has some unknowns?
		this._cache.resolved = base + this._raw; // .replace(/[\@\$]/g,'')
	};
	
	return this._cache.resolved;
};


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
var Head = __webpack_require__(39).Head;
var Nav = __webpack_require__(40).Nav;
var Home = __webpack_require__(41).Home;
var Note = __webpack_require__(42).Note;

var App = Imba.defineTag('App', function(tag){
	
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).setChildren($.$ = $.$ || [
			_1('div',$,0,this).setId('head').flag('masthead').flag('lg').flag('bar').flag('base-bg').flag('flat').flag('dark').setContent([
				_1('div',$,1,0).flag('brand').setText("UXA"),
				_1('div',$,2,0).flag('flexer'),
				_1('a',$,3,0).flag('tab').setRouteTo("/").setText('Home'),
				_1('a',$,4,0).flag('tab').setRouteTo("/components").setText('Components'),
				_1('a',$,5,0).flag('tab').setRouteTo("/elements").setText('Elements'),
				_1('a',$,6,0).flag('tab').setRouteTo("/form").setText('Form'),
				_1('a',$,7,0).flag('tab').setRouteTo("/note").setText('Note')
			],2),
			
			_1(Home,$,8,this).setRoute('/'),
			_1(Note,$,9,this).setRoute('/note')
		
		],2).synced((
			$[3].end(),
			$[4].end(),
			$[5].end(),
			$[6].end(),
			$[7].end(),
			$[8].end(),
			$[9].end()
		,true));
	};
})
exports.App = App;


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
var index$ = __webpack_require__(3), Button = index$.Button, IconButton = index$.IconButton, TextField = index$.TextField, ListItem = index$.ListItem, Menu = index$.Menu, MenuItem = index$.MenuItem, Popover = index$.Popover, Dialog = index$.Dialog;

var Head = Imba.defineTag('Head', function(tag){
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).flag('masthead').flag('lg').flag('bar').flag('base-bg').flag('flat').setChildren($.$ = $.$ || [
			_1('div',$,0,this).flag('brand').setText("Scrimba"),
			_1('div',$,1,this).flag('flexer'),
			_1('a',$,2,this).flag('tab').setHref("#forms").setText('forms'),
			_1('a',$,3,this).flag('tab').flag('active').setHref("#articles").setText('articles'),
			_1('a',$,4,this).flag('tab').setHref("#panels").setText('panels'),
			_1('a',$,5,this).flag('tab').setHref("#alerts").setText('alerts'),
			_1('a',$,6,this).flag('tab').setHref("#buttons").setText('buttons')
		
		
		
		],2).synced((
			$[2].end(),
			$[3].end(),
			$[4].end(),
			$[5].end(),
			$[6].end()
		,true));
	};
	
	tag.prototype.menu = function (){
		var t0;
		this.log("tap menu!",this);
		this._avatar.uxa().open((t0 = (t0=_1(Popover)).flag('list').flag('inset').setContent([
			// <ListItem.header label='Sindre Aarsaether' subtext='hello@scrimba.com'>
			// <ListItem label='Profile photo' subtext='Change your profile photo'>
			_1('hr',t0.$,'A',t0).flag('sm'),
			_1(Menu,t0.$,'B',t0).flag('inset').setContent([
				_1(MenuItem,t0.$,'C','B').setIcon('w').setLabel('Open'),
				_1(MenuItem,t0.$,'D','B').setIcon('v').setLabel('Paste in place'),
				_1(MenuItem,t0.$,'E','B').setIcon('v').setLabel('Research'),
				_1(MenuItem,t0.$,'F','B').setIcon('.').setLabel('Go to site...'),
				_1('hr',t0.$,'G','B').flag('sm'),
				_1(MenuItem,t0.$,'H','B').flag('pos').setIcon('>').setLabel('Home'),
				_1(MenuItem,t0.$,'I','B').flag('pri').setIcon('>').setLabel('Back'),
				_1(MenuItem,t0.$,'J','B').flag('neg').setIcon('>').setLabel('Sign out').setDisabled(true)
			],2)
		
		
		
		
		
		
		
		],2)).end((
			t0.$.B.end((
				t0.$.C.end(),
				t0.$.D.end(),
				t0.$.E.end(),
				t0.$.F.end(),
				t0.$.H.end(),
				t0.$.I.end(),
				t0.$.J.end()
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
/* 40 */
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
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0), _2 = Imba.createTagList, _1 = Imba.createElement;


var index$ = __webpack_require__(3), IconButton = index$.IconButton, Button = index$.Button, TextField = index$.TextField, TextArea = index$.TextArea, Dialog = index$.Dialog, Menu = index$.Menu, MenuItem = index$.MenuItem, Form = index$.Form, Indicator = index$.Indicator, Tile = index$.Tile;
var SelectField = __webpack_require__(13).SelectField;
var TagInput = __webpack_require__(14).TagInput;

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
	enabled: true,
	rating: 8,
	topics: ['#one']
};

var blocks = [
	{name: "Header",desc: "A large header with margin"},
	{name: "Sub Header",desc: "A smaller header"},
	{name: "Bulleted List",desc: "Create a simple bulleted list"},
	{name: "Numbered List",desc: "Create a list with numbering"}
];

var GroupedMenu = Imba.defineTag('GroupedMenu', function(tag){
	
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).flag('menu').setChildren([
			$[0] || _1('div',$,0,this).flag('item').setText("Edit item"),
			$[1] || _1('div',$,1,this).flag('item').dataset('icon','mright').setText("Remove item"),
			$[2] || _1('hr',$,2,this),
			$[3] || _1('div',$,3,this).flag('header').setText("Blocks"),
			(function tagLoop($0) {
				var t0;
				for (let i = 0, len = $0.taglen = blocks.length, item; i < len; i++) {
					item = blocks[i];
					(t0 = $0[i] || (t0=_1('div',$0,i)).flag('item').flag('double').dataset('icon','mright').setContent(t0.$.A || _1('div',t0.$,'A',t0).flag('body').setContent([
						_1('div',t0.$,'B','A').flag('name'),
						_1('div',t0.$,'C','A').flag('legend')
					],2),2)).end((
						t0.$.B.setContent(item.name,3),
						t0.$.C.setContent(item.desc,3)
					,true));
				};return $0;
			})($[4] || _2($,4)),
			
			$[5] || _1('div',$,5,this).flag('item').dataset('icon','mclose').setText("Close menu"),
			$[6] || _1('hr',$,6,this),
			$[7] || _1('div',$,7,this).flag('header').setText("Shortcuts"),
			$[8] || _1('div',$,8,this).flag('item').dataset('shortcut','space').setText("pause / resume"),
			$[9] || _1('div',$,9,this).flag('item').dataset('shortcut','⇧ ←').setText("slower playback"),
			$[10] || _1('div',$,10,this).flag('item').dataset('shortcut','⇧ →').setText("faster playback"),
			$[11] || _1('div',$,11,this).flag('item').dataset('shortcut','→').setText("go forward 10s"),
			$[12] || _1('div',$,12,this).flag('item').dataset('shortcut','←').setText("go back 10s")
		],1).synced((
			$[1].end(),
			$[5].end(),
			$[8].end(),
			$[9].end(),
			$[10].end(),
			$[11].end(),
			$[12].end()
		,true));
	};
});

var LogForm = Imba.defineTag('LogForm', Form, function(tag){
	
	tag.prototype.fill = function (){
		return this.setFormData({title: "Something",desc: "Hello there mate!!"});
	};
	
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).setChildren($.$ = $.$ || [
			// <.field.resting.lg>
			// 	<input[state:title] type='text' placeholder='Title of project'>
			// 	<label data-label="Title"> "Title"
			// 	<hr>
			
			_1('div',$,0,this).flag('field').setContent([
				_1(TagInput,$,1,0),
				_1('label',$,2,0).setText("Tags")
			],2),
			
			_1('div',$,3,this).flag('field').setContent([
				_1('input',$,4,3).setType('text').setPlaceholder('Subtitle of project').setPattern("Stuff"),
				_1('label',$,5,3).setText("Subtitle"),
				_1('hr',$,6,3)
			],2),
			
			_1('div',$,7,this).flag('field').setContent([
				_1('input',$,8,7).setType('text').setRequired('required').setPlaceholder('Required title'),
				_1('label',$,9,7).setText("Slug"),
				_1('hr',$,10,7)
			],2),
			
			_1('div',$,11,this).flag('field').flag('range').setContent([
				_1('input',$,12,11).setType('range').setMin(0).setMax(10).setStep(1).setName('slide'),
				_1('label',$,13,11).setText("Font-size")
			
			],2),
			
			_1('div',$,14,this).flag('field').flag('checkbox').setContent([
				_1('input',$,15,14).setType('checkbox'),
				_1('label',$,16,14).setText("Another checkbox yes")
			],2),
			
			_1('div',$,17,this).flag('field').setContent([
				_1('div',$,18,17).flag('field').flag('radio').setContent([
					_1('input',$,19,18).setType('radio').setName('group').setValue('red',1),
					_1('label',$,20,18).setText("Red")
				],2),
				
				_1('div',$,21,17).flag('field').flag('radio').setContent([
					_1('input',$,22,21).setType('radio').setName('group').setValue('green',1),
					_1('label',$,23,21).setText("Green")
				],2),
				
				_1('div',$,24,17).flag('field').flag('radio').setContent([
					_1('input',$,25,24).setType('radio').setName('group').setValue('blue',1),
					_1('label',$,26,24).setText("Blue")
				],2)
			],2),
			
			_1('div',$,27,this).flag('field').flag('select').setContent([
				_1('select',$,28,27),
				_1('label',$,30,27).setText("Blue")
			],2),
			_1(TextField,$,31,this).setLabel("Title").setName('title').setPlaceholder("Descriptive title").setDesc("Some description of this"),
			
			_1(TextField,$,32,this).setLabel("Secret word").setName('secret').setPlaceholder("What is the secret?").setRequired(true).setPattern("uxauxa").setDesc("Can you guess it?"),
			_1(TextArea,$,33,this).setLabel("Description").setName('desc').setDesc("Please feel free to describe").setPlaceholder("Some description").setRequired(true)
		
		
		
		],2).synced((
			$[1].bindData(state,'topics').end(),
			$[4].bindData(state,'title').end(),
			$[8].bindData(state,'title').end(),
			$[12].bindData(state,'rating').end(),
			$[15].end(),
			$[19].end(),
			$[22].end(),
			$[25].end(),
			$[28].bindData(state,'category').setContent(
				(function tagLoop($0) {
					for (let i = 0, ary = iter$(state.categories), len = $0.taglen = ary.length; i < len; i++) {
						($0[i] || _1('option',$0,i)).setContent(ary[i],3);
					};return $0;
				})($[29] || _2($,29,$[28]))
			,4).end(),
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
				
				_1('section',$,17,7).setContent([
					_1('div',$,18,17).setNestedAttr('uxa','md',"Hello *inline* ",{inline:1}),
					_1('div',$,19,17).setNestedAttr('uxa','md',"Hello *not inline*")
				],2),
				
				_1('section',$,20,7).setContent(
					$[21] || _1(GroupedMenu,$,21,20)
				,2),
				
				_1('section',$,22,7),
				
				_1('section',$,24,7).flag('section').setContent([
					_1('header',$,25,24).setContent([
						_1('div',$,26,25).flag('title').setText("Title"),
						_1('div',$,27,25).flag('subtitle').setText("Subitle for section")
					],2),
					_1('div',$,28,24).flag('grid').flag('tiles')
				],2),
				
				
				_1('section',$,30,7).setContent(
					$[31] || _1('div',$,31,30).flag('grid').flag('tiles')
				,2),
				_1('section',$,33,7).flag('mb-xl').setContent(
					$[34] || _1('div',$,34,33).flag('grid').flag('tiles')
				,2)
			],2),
			
			_1('div',$,36,this).flag('container').flag('narrow'),
			_1('div',$,37,this).flag('container').flag('narrow').flag('sm'),
			
			_1('div',$,38,this).flag('container').flag('narrow').setContent(
				$[39] || _1('div',$,39,38).flag('tile').flag('dark').setContent(
					$[40] || _1('h2',$,40,39).setText("This is a tile!")
				,2)
			,2),
			
			
			
			
			
			
			
			
			
			_1(Palette,$,41,this).setTint('light')
		
		],2).synced((
			$[18].end(),
			$[19].end(),
			$[21].end(),
			$[22].setContent(
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
								t0.$.AE || _1('div',t0.$,'AE','AD').flag('menu')
							,2)
						],2)).setFlag(0,ary[i]).end((
							t0.$.N.end(),
							t0.$.O.end(),
							t0.$.P.end(),
							t0.$.Q.end(),
							t0.$.Z.end(),
							t0.$.AA.end(),
							t0.$.AB.end(),
							t0.$.AE.setContent([
								t0.$.AF || _1('div',t0.$,'AF','AE').flag('item').setText("Edit item"),
								t0.$.AG || _1('div',t0.$,'AG','AE').flag('item').dataset('icon','mright').setText("Remove item"),
								t0.$.AH || _1('hr',t0.$,'AH','AE'),
								t0.$.AI || _1('div',t0.$,'AI','AE').flag('item').dataset('icon','mright').setText("Edit item"),
								t0.$.AJ || _1('div',t0.$,'AJ','AE').flag('item').dataset('icon','mclose').setText("Close menu"),
								t0.$.AK || _1('hr',t0.$,'AK','AE'),
								t0.$.AL || _1('div',t0.$,'AL','AE').flag('header').setText("Shortcuts"),
								t0.$.AM || _1('div',t0.$,'AM','AE').flag('item').dataset('shortcut','space').setText("pause / resume"),
								t0.$.AN || _1('div',t0.$,'AN','AE').flag('item').dataset('shortcut','⇧←').setText("slower playback"),
								t0.$.AO || _1('div',t0.$,'AO','AE').flag('item').dataset('shortcut','⇧→').setText("faster playback"),
								t0.$.AP || _1('div',t0.$,'AP','AE').flag('item').dataset('shortcut','→').setText("go forward 10s"),
								t0.$.AQ || _1('div',t0.$,'AQ','AE').flag('item').dataset('shortcut','←⌘').setText("go back 10s"),
								t0.$.AR || _1('hr',t0.$,'AR','AE'),
								(function tagLoop($0) {
									var t1;
									for (let j = 0, array = iter$(state.categories), len = $0.taglen = array.length, item; j < len; j++) {
										item = array[j];
										(t1 = $0[j] || (t1=_1('div',$0,j)).flag('field').flag('radio').setContent([
											_1('input',t1.$,'A',t1).setType('radio'),
											_1('label',t1.$,'B',t1)
										
										
										],2)).end((
											t1.$.A.bindData(state,'category').setValue(item,1).end(),
											t1.$.B.setContent(item,3)
										,true));
									};return $0;
								})(t0.$['AS'] || _2(t0.$,'AS',t0.$.AE)),
								t0.$.AT || _1('hr',t0.$,'AT','AE'),
								t0.$.AU || _1('div',t0.$,'AU','AE').flag('field').flag('checkbox').setContent([
									_1('input',t0.$,'AV','AU').setType('checkbox'),
									_1('label',t0.$,'AW','AU').setText("Show invisibles")
								],2),
								t0.$.AX || _1('hr',t0.$,'AX','AE'),
								
								t0.$.AY || _1('div',t0.$,'AY','AE').flag('field').flag('range').setContent([
									_1('input',t0.$,'AZ','AY').setType('range').setMin(0.4).setStep(0.1).setMax(2).setNumber(true),
									_1('label',t0.$,'BA','AY').setText("Speed")
								],2)
							],1).end((
								t0.$.AG.end(),
								t0.$.AI.end(),
								t0.$.AJ.end(),
								t0.$.AM.end(),
								t0.$.AN.end(),
								t0.$.AO.end(),
								t0.$.AP.end(),
								t0.$.AQ.end(),
								t0.$.AV.bindData(state,'enabled').end(),
								t0.$.AZ.end()
							,true))
						,true));
					};return $0;
				})($[23] || _2($,23,$[22]))
			,4),
			$[28].setContent((function tagLoop($0) {
				var t0;
				for (let i = 0, ary = ['sm','md','lg'], len = $0.taglen = ary.length, item; i < len; i++) {
					item = ary[i];
					(t0 = $0[i] || (t0=_1('div',$0,i)).flag('tile').setContent([
						_1('div',t0.$,'A',t0),
						_1(LogForm,t0.$,'B',t0)
					],2)).flagIf('dark',(i == 2)).end((
						t0.$.A.setFlag(0,item).setNestedAttr('uxa','md',short).end(),
						t0.$.B.setFlag(0,item).end()
					,true));
				};return $0;
			})($[29] || _2($,29,$[28])),4),
			$[31].setContent((function tagLoop($0) {
				for (let i = 0, len = $0.taglen = items.length; i < len; i++) {
					($0[i] || _1(TileTest,$0,i)).setData(items[i]).end();
				};return $0;
			})($[32] || _2($,32,$[31])),4),
			$[34].setContent((function tagLoop($0) {
				for (let i = 0, len = $0.taglen = items.length; i < len; i++) {
					($0[i] || _1(TileTest,$0,i).flag('dark')).setData(items[i]).end();
				};return $0;
			})($[35] || _2($,35,$[34])),4),
			$[36].setNestedAttr('uxa','md',long).end(),
			$[37].setNestedAttr('uxa','md',long).end(),
			$[41].end()
		,true));
	};
})
exports.Home = Home;



/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
var Article = __webpack_require__(43).Note;
var note = __webpack_require__(48).note;

var Note = Imba.defineTag('Note', function(tag){
	
	tag.prototype.render = function (){
		var $ = this.$;
		return this.$open(0).setChildren(
			$[0] || _1('div',$,0,this).flag('container').flag('narrow').setContent([
				_1('div',$,1,0).setText("Hello there"),
				_1('hr',$,2,0),
				_1(Article,$,3,0).setEditable(true)
			],2)
		,2).synced((
			$[3].setData(note).end()
		,true));
	};
})
exports.Note = Note;


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0);
var base$ = __webpack_require__(8), Block = base$.Block, Entity = base$.Entity;
var CodeBlock = __webpack_require__(45).CodeBlock;
var Root = __webpack_require__(47).Root;

var Note = Imba.defineTag('Note', Root)
exports.Note = Note;





/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0), _3 = Imba.createTagList, _2 = Imba.createTagMap, _1 = Imba.createElement;
var fuzzyMatch = __webpack_require__(9).fuzzyMatch;

var Menu = __webpack_require__(4).Menu;

var ActionsMenu = Imba.defineTag('ActionsMenu', Menu, function(tag){
	
	tag.prototype.actions = function(v){ return this._actions; }
	tag.prototype.setActions = function(v){ this._actions = v; return this; };
	tag.prototype.__query = {'default': "",watch: 'queryDidSet',name: 'query'};
	tag.prototype.query = function(v){ return this._query; }
	tag.prototype.setQuery = function(v){
		var a = this.query();
		if(v != a) { this._query = v; }
		if(v != a) { this.queryDidSet && this.queryDidSet(v,a,this.__query) }
		return this;
	}
	tag.prototype._query = "";
	tag.prototype.__activeIndex = {'default': 0,name: 'activeIndex'};
	tag.prototype.activeIndex = function(v){ return this._activeIndex; }
	tag.prototype.setActiveIndex = function(v){ this._activeIndex = v; return this; }
	tag.prototype._activeIndex = 0;
	
	tag.prototype.onkeydown = function (e,o){
		// log 'ActionsMenu.onkeydown',e,o,o:selection
		var v_;
		if (o.down) {
			((this.setActiveIndex(v_ = this.activeIndex() + 1),v_)) - 1;
			e.stop().prevent();
		} else if (o.up) {
			this.setActiveIndex(this.activeIndex() - 1);
			e.stop().prevent();
		} else if (o.left || o.right) {
			this.hide();
		} else if (o.enter) {
			let action = this.filtered()[this.activeIndex()];
			this.log('trigger action',action);
			e.stop().prevent();
			this.exec(action);
		};
		this.render();
		return this;
	};
	
	tag.prototype.filtered = function (){
		return this._filtered || this.actions();
	};
	
	tag.prototype.queryDidSet = function (query){
		let q = query.toLowerCase();
		this._matcher = function(item) { return fuzzyMatch(q,item.find); };
		this._filtered = this.actions().filter(this._matcher);
		this.setActiveIndex(0);
		this.render();
		if (this._filtered.length == 0) this.hide();
		return this;
	};
	
	tag.prototype.match = function (item){
		return this._matcher ? this._matcher(item) : true;
	};
	
	tag.prototype.exec = function (action){
		this.data().trigger('action',action);
		return this.hide();
	};
	
	tag.prototype.mount = function (){
		// when focus is moved away from 
		return true;
	};
	
	tag.prototype.unmount = function (){
		if (this.data()) {
			this.data()._menu = null;
			this.data()._completion = null;
		};
		return this;
	};
	
	tag.prototype.hide = function (){
		return this.trigger('uxahide');
	};
	
	tag.prototype.render = function (){
		var $ = this.$, self = this;
		let ai = self.activeIndex() + 1;
		let i = 0;
		return self.$open(0).flag('menu').setChildren([
			($[0] || _1('div',$,0,self).flag('header').setText("Blocks")),
			(function tagLoop($0) {
				var t0, $$ = $0.$iter();
				for (let j = 0, items = iter$(self.actions()), len = items.length, action; j < len; j++) {
					action = items[j];
					if (!self.match(action)) { continue; };
					$$.push((t0 = $0[j] || (t0=_1('div',$0,j)).flag('item').flag('double').setContent(t0.$.A || _1('div',t0.$,'A',t0).flag('body').setContent([
						_1('div',t0.$,'B','A').flag('name'),
						_1('div',t0.$,'C','A').flag('legend')
					],2),2)).on$(0,['tap',['exec',action]],self).flagIf('hover',(++i == ai)).dataset('shortcut',action.shortcut).end((
						t0.$.B.setContent(action.name,3),
						t0.$.C.setContent(action.desc,3)
					,true)));
				};return $$;
			})($[1] || _2($,1))
		],1).synced();
	};
})
exports.ActionsMenu = ActionsMenu;


/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

var Imba = __webpack_require__(0), _1 = Imba.createElement;
var base$ = __webpack_require__(8), Block = base$.Block, Content = base$.Content;
var util$ = __webpack_require__(9), Sel = util$.Sel, eventKeys = util$.eventKeys;

var UXA = __webpack_require__(46).UXA;
var Code = __webpack_require__(7).Code;

function Selection(root){
	this._root = root;
};

Selection.prototype.root = function(v){ return this._root; }
Selection.prototype.setRoot = function(v){ this._root = v; return this; };

Selection.prototype.start = function (){
	return this._root.selectionStart;
};

Selection.prototype.end = function (){
	return this._root.selectionEnd;
};

Selection.prototype.toString = function (){
	return this._root.value.slice(this.start(),this.end());
};

Selection.prototype.atStart = function (){
	
	return this.start() == 0;
};

Selection.prototype.atEnd = function (){
	return this.end() == this._root.value.length;
};

Selection.prototype.atTop = function (){
	return this.textBefore().indexOf('\n') == -1;
};

Selection.prototype.atBottom = function (){
	return this.textAfter().indexOf('\n') == -1;
};

Selection.prototype.serialize = function (){
	return {
		start: this.start(),
		length: this.end() - this.start(),
		text: this.toString(),
		before: this._root.value.substr(0,this.start()),
		after: this._root.value.substr(this.end())
	};
};

Selection.prototype.textBefore = function (){
	return this._root.value.substr(0,this.start());
};

Selection.prototype.textAfter = function (){
	return this._root.value.substr(this.end());
};

Selection.prototype.insert = function (text){
	
	var start = this.start();
	var offset = this.textBefore().length + text.length;
	var value = this.textBefore() + text + this.textAfter();
	console.log("insert",text,start,offset,JSON.stringify(value));
	this._root.value = value;
	this._root.selectionStart = this._root.selectionEnd = offset;
	return this;
};

Selection.prototype.collapse = function (){
	if (this.start() != this.end()) {
		this._root.selectionEnd = this.start();
	};
	return this;
};

var PlainContent = Imba.defineTag('PlainContent', 'textarea', function(tag){
	tag.prototype.__data = {watch: 'dataDidSet',name: 'data'};
	tag.prototype.data = function(v){ return this._data; }
	tag.prototype.setData = function(v){
		var a = this.data();
		if(v != a) { this._data = v; }
		if(v != a) { this.dataDidSet && this.dataDidSet(v,a,this.__data) }
		return this;
	};
	tag.prototype.__spellcheck = {dom: true,name: 'spellcheck'};
	tag.prototype.spellcheck = function(v){ return this.dom().spellcheck; }
	tag.prototype.setSpellcheck = function(v){ if (v != this.dom().spellcheck) { this.dom().spellcheck = v }; return this; };
	
	tag.prototype.selection = function (){
		return new Selection(this.dom());
	};
	
	tag.prototype.dataDidSet = function (data){
		return this.deserialize(data.body);
	};
	
	tag.prototype.plaintext = function (){
		return this.dom().value;
	};
	
	tag.prototype.serialize = function (){
		return [this.dom().value];
	};
	
	tag.prototype.deserialize = function (value){
		value = value.body || value;
		console.log("deserialize",value);
		this.dom().value = (value instanceof Array) ? value[0] : value;
		return this;
	};
	
	tag.prototype.onkeydown = function (e){
		let key = eventKeys(e);
		let sel = this.selection();
		let selData = sel.serialize();
		key.selection = sel;
		key.text = selData.text;
		key.textBefore = selData.before;
		key.textAfter = selData.after;
		
		e.setData(key);
		return;
	};
	
	tag.prototype.select = function (start,end){
		console.log("select",start,end);
		if (start < 0) { start = this.plaintext().length + start + 1 };
		if (end == undefined) { end = start };
		if (end < 0) { end = this.plaintext().length + end + 1 };
		this._dom.focus();
		this._dom.selectionStart = start;
		this._dom.selectionEnd = end;
		return this;
	};
	
	
	
	
	
	
});

var CodeBlock = Imba.defineTag('CodeBlock', Block, function(tag){
	tag.register('code');
	
	tag.prototype.isRich = function (){
		return false;
	};
	
	tag.prototype.oninput = function (){
		// @highlighted.update(plaintext,data:language)
		return this.refresh();
	};
	
	tag.prototype.onkeydown = function (e,o){
		if (!o) { return tag.prototype.__super__.onkeydown.apply(this,arguments) };
		
		if (o.tab) {
			o.selection.insert("\t").collapse();
			this.refresh();
			return e.prevent();
		};
		
		if (o.enter && !o.meta) {
			return;
			if (o.selection.atEnd()) {
				o.selection.insert("\n\n").collapse();
			} else {
				o.selection.insert("\n").collapse();
			};
			this.refresh();
			return e.prevent();
		};
		
		return tag.prototype.__super__.onkeydown.apply(this,arguments);
	};
	
	
	
	tag.prototype.oninput = function (e){
		// let raw = body.dom:textContent
		// let text = body.dom:innerText
		
		// if raw !== text
		// 	console.log "difference between text and raw"
		
		this.refresh();
		return this;
	};
	
	tag.prototype.ondirty = function (){
		return this.refresh();
	};
	
	tag.prototype.ondelstart = function (e){
		if (this.prevBlock() && this.prevBlock().matches('.CodeBlock')) {
			return this.trigger('joinabove');
		} else if (this.plaintext().length == 0) {
			tag.prototype.__super__.ondelstart.apply(this,arguments);
		};
		
		return e.stop();
	};
	
	tag.prototype.plaintext = function (){
		return this._body.dom().value;
	};
	
	tag.prototype.refresh = function (){
		this.data().body = this.plaintext();
		
		var html = Code.highlight(this.plaintext(),this.data().language || 'imba');
		this._rich.dom().innerHTML = html;
		return this;
	};
	
	tag.prototype.setup = function (){
		this.render();
		return this.refresh();
	};
	
	tag.prototype.body = function (){
		// <Content@body[data] editable=context.editable spellcheck=false>
		let $ = this.$$ || (this.$$ = {});
		return (this._body = this._body||_1(PlainContent,this).flag('body').setSpellcheck(false)).bindData(this.data(),'body').end();
	};
	
	tag.prototype.render = function (){
		var $ = this.$, t0;
		return this.$open(0).setFlag(-1,this.type()).setChildren($.$ = $.$ || [
			_1('div',$,0,this).flag('lines'),
			t0 = (t0=_1('div',$,1,this)).flag('content')
		],2).synced((
			$[1].setContent([
				this.body(),
				this._rich = this._rich||_1('pre',t0).flag('rich').flag('block-overlay')
			],1)
		,true));
	};
})
exports.CodeBlock = CodeBlock;


/***/ }),
/* 46 */
/***/ (function(module, exports) {


var escapeTextContent = function(val) {
	var str = (typeof val == 'string') ? val : String(val);
	if (str.indexOf('"') >= 0) {
		str = str.replace(/\"/g,"&quot;");
	};
	if (str.indexOf('<') >= 0) {
		str = str.replace(/\</g,"&lt;");
	};
	if (str.indexOf('>') >= 0) {
		str = str.replace(/\>/g,"&gt;");
	};
	return str;
};


var UXA = exports.UXA = {
	
	highlight: function(code,lang){
		return escapeTextContent(code);
	}
};


/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var Imba = __webpack_require__(0);
var Block = __webpack_require__(8).Block;

var Root = Imba.defineTag('Root', function(tag){
	tag.prototype.__editable = {'default': false,watch: 'editableDidSet',name: 'editable'};
	tag.prototype.editable = function(v){ return this._editable; }
	tag.prototype.setEditable = function(v){
		var a = this.editable();
		if(v != a) { this._editable = v; }
		if(v != a) { this.editableDidSet && this.editableDidSet(v,a,this.__editable) }
		return this;
	}
	tag.prototype._editable = false;
	tag.prototype.__value = {watch: 'valueDidSet',name: 'value'};
	tag.prototype.value = function(v){ return this._value; }
	tag.prototype.setValue = function(v){
		var a = this.value();
		if(v != a) { this._value = v; }
		if(v != a) { this.valueDidSet && this.valueDidSet(v,a,this.__value) }
		return this;
	};
	tag.prototype.__data = {watch: 'dataDidSet',name: 'data'};
	tag.prototype.data = function(v){ return this._data; }
	tag.prototype.setData = function(v){
		var a = this.data();
		if(v != a) { this._data = v; }
		if(v != a) { this.dataDidSet && this.dataDidSet(v,a,this.__data) }
		return this;
	};
	tag.prototype.__format = {'default': 'json',name: 'format'};
	tag.prototype.format = function(v){ return this._format; }
	tag.prototype.setFormat = function(v){ this._format = v; return this; }
	tag.prototype._format = 'json'; 
	
	tag.prototype.build = function (){
		return this.flag('uxa-note');
	};
	
	tag.prototype.clear = function (){
		while (this.dom().firstChild){
			this.dom().removeChild(this.dom().firstChild);
		};
		return this;
	};
	
	tag.prototype.render = function (){
		return this;
	};
	
	tag.prototype.rerender = function (){
		for (let i = 0, items = iter$(this.children()), len = items.length; i < len; i++) {
			items[i].render();
		};
		return this;
	};
	
	tag.prototype.setup = function (){
		this.deserialize(this._data || {});
		this._setup = true;
		this._history = [];
		this._redo = [];
		this._mutations = [];
		return this;
	};
	
	tag.prototype.dataDidSet = function (data){
		this._history = [];
		this._redo = [];
		if (data && this._setup) { return this.deserialize(data) };
	};
	
	tag.prototype.editableDidSet = function (bool,prev){
		var self = this;
		if (self._setup) { self.deserialize(self._data) }; 
		
		if (true) {
			if (bool) {
				self._observer || (self._observer = new MutationObserver(function(muts) {
					if (self._setup) { return self.trigger('mutated',muts) };
				}));
				self._observer.observe(self.dom(),{childList: true,subtree: true,characterData: true});
			} else if (self._observer) {
				self._observer.disconnect();
			};
		};
		return self;
	};
	
	tag.prototype.serialize = function (overrides){
		if(overrides === undefined) overrides = {};
		var params = {body: []};
		for (let i = 0, items = iter$(this.children()), len = items.length, item; i < len; i++) {
			item = items[i];
			params.body.push(item.serialize());
			if (i == 0) {
				params.title = item.plaintext();
			};
		};
		return Object.assign({},this.data(),params,overrides);
	};
	
	tag.prototype.block = function (data){
		return Block.deserialize(data,this);
	};
	
	tag.prototype.deserialize = function (data){
		if(data === undefined) data = {};
		this.clear();
		data.type = 'root';
		data.body || (data.body = []);
		
		this.flag('editable',this.editable());
		
		if (data.body.length == 0) {
			data.body.push({type: 'p',body: []});
		};
		
		this._value = this.value();
		
		for (let i = 0, items = iter$(data.body), len = items.length; i < len; i++) {
			this.dom().appendChild(Block.deserialize(items[i],this).dom());
		};
		
		if (this._observer) { this._observer.takeRecords() };
		if (data.caret) { this.deserializeCaret(data.caret) };
		return this;
	};
	
	tag.prototype.serializeCaret = function (){
		// adhoc
		var focus = document.activeElement;
		var block = focus && focus.closest('.Block');
		let sel = {block: [].indexOf.call(this._dom.children,block)};
		try {
			Object.assign(sel,block._tag.selection().serialize());
		} catch (e) { };
		return sel;
	};
	
	tag.prototype.deserializeCaret = function (caret){
		var block;
		if (block = this.dom().children[caret.block]) {
			block._tag.select(caret.start,caret.start + caret.length);
		};
		return this;
	};
	
	
	tag.prototype.markHistoryEntry = function (force){
		if(force === undefined) force = false;
		var time = Date.now();
		var prev = this._history[0];
		var delta = prev ? ((time - prev.ts)) : 0;
		
		var snapshot = this.serialize();
		snapshot.caret = this.serializeCaret();
		snapshot.ts = time;
		
		if (force || !prev || delta > 400 || !this._history[1]) {
			this._history.unshift(snapshot); 
		} else {
			this._history[0] = snapshot;
		};
		this._redo = [];
		this._mutations = [];
		
		return this;
	};
	
	tag.prototype.onselectstart = function (e){
		// log 'onselectstart',e
		var self = this;
		if (!self._history[0]) {
			return setTimeout(function() { return self.markHistoryEntry(true); },50);
		};
	};
	
	tag.prototype.onmutated = function (e,muts){
		var self = this;
		self._mutations = self._mutations.concat(muts);
		clearTimeout(self._mutator);
		return self._mutator = setTimeout(function() { return self.markHistoryEntry(); },30);
	};
	
	tag.prototype.onundo = function (e){
		var prev;
		let state = this._history.shift();
		console.log("undo state",this._history[0]);
		if (prev = this._history[0]) {
			this._redo.unshift(state);
			this.deserialize(prev);
		} else {
			// at first state in history
			this._history.unshift(state);
		};
		return this;
	};
	
	tag.prototype.onredo = function (e){
		var state;
		this.log('redo');
		if (state = this._redo.shift()) {
			this._history.unshift(state);
			this.deserialize(state);
		};
		return this;
	};
	
	
	
	
})
exports.Root = Root;


/***/ }),
/* 48 */
/***/ (function(module, exports) {


var blocks = exports.blocks = [
	{name: "Header",desc: "A large header with margin"},
	{name: "Sub Header",desc: "A smaller header"},
	{name: "Bulleted List",desc: "Create a simple bulleted list"},
	{name: "Numbered List",desc: "Create a list with numbering"}
];

var md = exports.md = "# Header\n\n## Sub Header\n\nParagraph of text\n\n```imba\nvar hello = 100\n```";

var post = exports.post = {
	markdown: md,
	json: {
		type: 'root',
		body: [
			{type: 'h1',body: ["Header"]},
			{type: 'h2',body: ["Sub header"]},
			{type: 'code',language: "imba",body: ["var hello = 100"]},
			{type: 'p',body: ["Paragraph of text"]},
			{type: 'code',language: "imba",body: ["if true\n\tvar hello = 100\n\tvar other = 200"]}
		]
	}
};

var note = exports.note = post.json;


/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };
var self = {}, i;

var monarch = __webpack_require__(50);
var languages = __webpack_require__(51);
var Theme = __webpack_require__(61).Theme;


var raw = Theme.toMonaco();
var theme = exports.theme = monarch.TokenTheme.createFromRawTokenTheme(raw.rules);

var css = [];
for (let i = 0, items = iter$(theme.getColorMap()), len = items.length; i < len; i++) {
	if (i <= 0) { continue; };
	css[i] = (".tok" + i + " \{ color: " + items[i] + "; \}");
};

let mkt = theme._match("delimiter.access.imba");
if (i = mkt._foreground) {
	css[i] += ("\n.tok" + i + ":before") + '{	position: absolute;	content: ".";	color: #ea9b80;}';
};

theme.CSS = css.join("\n");

var cache = {};
var styleElement;

exports.styles = self.styles = function (){
	return css;
};

var registeredLanguages = {};



exports.getLanguage = self.getLanguage = function (lang){
	if (true && !styleElement) {
		styleElement = document.createElement('style');
		styleElement.innerHTML = css.join("\n");
		document.head.appendChild(styleElement);
	};
	
	if (registeredLanguages[lang]) {
		return registeredLanguages[lang];
	};
	if (languages[lang]) {
		monarch.register(lang,languages[lang].language.language);
		return registeredLanguages[lang] = true;
	};
	return false;
};

self.getLanguage('javascript');

exports.tokenize = self.tokenize = function (lang,code,options){
	if(options === undefined) options = {};
	if (false) {
		// not on the web -- for now
		var compiler = require('imba/compiler');
		var helpers = require('imba/lib/compiler/helpers');
		let analysis = compiler.analyze(code,{target: 'web'});
		var locmap = helpers.locationToLineColMap(code);
		var vars = [];
		for (let j = 0, items = iter$(analysis.scopes), len = items.length, scope; j < len; j++) {
			scope = items[j];
			for (let k = 0, ary = iter$(scope.vars), len = ary.length, item; k < len; k++) {
				item = ary[k];
				for (let i_ = 0, array = iter$(item.refs), len = array.length; i_ < len; i_++) {
					let loc = locmap[array[i_].loc[0]].concat('identifier.l' + item.type);
					vars.push(loc);
				};
			};
		};
		
		vars = vars.sort(function(a,b) {
			if (a[0] == b[0]) {
				return a[1] - b[1];
			} else {
				return a[0] - b[0];
			};
		});
		
		
		
		options.decorations = vars;
	};
	
	
	if (!self.getLanguage(lang)) {
		console.log("could not find language");
		if (code.indexOf('"') >= 0) {
			code = code.replace(/\"/g,"&quot;");
		};
		if (code.indexOf('<') >= 0) {
			code = code.replace(/\</g,"&lt;");
		};
		if (code.indexOf('>') >= 0) {
			code = code.replace(/\>/g,"&gt;");
		};
		return code;
	};
	
	var theme = options.theme;
	var decorations = (options.decorations || []).slice();
	var lexer = monarch.getLexer(lang);
	var types = theme ? null : [];
	var map = {};
	var state = lexer.getInitialState();
	var lines = [];
	var dec = decorations.shift();
	
	
	for (let ln = 0, items = iter$(code.split('\n')), len = items.length, line; ln < len; ln++) {
		line = items[ln];
		var result = lexer.tokenize(line,state,0);
		let tokens = result.tokens.filter(function(tok) { return tok.type.indexOf("white") == -1; });
		let offset = 0;
		let lstr = "";
		
		for (let i = 0, ary = iter$(tokens), len = ary.length, token; i < len; i++) {
			// skip whitespace
			token = ary[i];
			let tref;
			
			
			if (dec && dec[0] == ln && dec[1] == token.offset) {
				// console.log "found decoration!!!",dec
				token.type = dec[2];
				dec = decorations.shift();
			};
			
			let next = tokens[i + 1];
			if (theme) {
				tref = theme._match(token.type);
				tref = tref._foreground;
			} else {
				let type = token.type.replace(/\./g,' ').replace(lang,'').trim();
				tref = map[type];
				if (tref == undefined) {
					tref = map[type] = (types.push(type) - 1);
				};
			};
			
			let end = next ? next.offset : line.length;
			lstr += String.fromCharCode(64 + tref);
			let move = (end) - offset;
			lstr += String.fromCharCode(64 + move);
			offset += move;
		};
		
		state = result.endState;
		lines.push(lstr);
	};
	
	return [code,lines.join('\n'),types];
};

exports.htmlify = self.htmlify = function (code,lineCount){
	if(lineCount === undefined) lineCount = 30;
	var out = "";
	
	var raw = code[0];
	var tokens = code[1].split('\n');
	var types = code[2];
	
	var i = 0;
	var start = 0;
	var l = tokens.length;
	var lines = raw.split('\n');
	
	out = [];
	
	for (let li = 0, items = iter$(lines), len = items.length, line; li < len; li++) {
		line = items[li];
		let start = 0;
		let desc = tokens[li];
		let k = 0;
		let s = "<span class='line'>";
		while (k < desc.length){
			let code = desc.charCodeAt(k++) - 64;
			if (k % 2 == 0) { // move
				let content = line.slice(start,start = start + code);
				s += content.replace(/\</g,'&lt;').replace(/\>/g,'&gt;');
				s += '</span>';
			} else {
				s += '<span class="' + (types ? types[code] : (('tok' + code))) + '">';
			};
		};
		s += '</span>';
		out.push(s);
	};
	
	return out.join('\n');
};

exports.highlight = self.highlight = function (code,lang,options){
	if(options === undefined) options = {};
	let langconf = self.getLanguage(lang);
	if (!langconf) { return code };
	(options.theme == null) ? (options.theme = theme) : options.theme;
	var tokens = self.tokenize(lang,code,options);
	return self.htmlify(tokens);
};



/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

Object.defineProperty(exports, '__esModule', { value: true });

function arrayToHash(array) {
    const result = {};
    for (let i = 0; i < array.length; ++i) {
        result[array[i]] = true;
    }
    return result;
}
function createKeywordMatcher(arr, caseInsensitive = false) {
    if (caseInsensitive) {
        arr = arr.map(function (x) { return x.toLowerCase(); });
    }
    const hash = arrayToHash(arr);
    if (caseInsensitive) {
        return function (word) {
            return hash[word.toLowerCase()] !== undefined && hash.hasOwnProperty(word.toLowerCase());
        };
    }
    else {
        return function (word) {
            return hash[word] !== undefined && hash.hasOwnProperty(word);
        };
    }
}

function isFuzzyActionArr(what) {
    return (Array.isArray(what));
}
function isFuzzyAction(what) {
    return !isFuzzyActionArr(what);
}
function isString$1(what) {
    return (typeof what === 'string');
}
function isIAction(what) {
    return !isString$1(what);
}
function empty(s) {
    return (s ? false : true);
}
function fixCase(lexer, str) {
    return (lexer.ignoreCase && str ? str.toLowerCase() : str);
}
function sanitize(s) {
    return s.replace(/[&<>'"_]/g, '-');
}
function log(lexer, msg) {
    console.log(`${lexer.languageId}: ${msg}`);
}
function throwError(lexer, msg) {
    throw new Error(`${lexer.languageId}: ${msg}`);
}
function substituteMatches(lexer, str, id, matches, state) {
    var re = /\$((\$)|(#)|(\d\d?)|[sS](\d\d?)|@(\w+))/g;
    var stateMatches = null;
    return str.replace(re, function (full, sub, dollar, hash, n, s, attr, ofs, total) {
        if (!empty(dollar)) {
            return '$';
        }
        if (!empty(hash)) {
            return fixCase(lexer, id);
        }
        if (!empty(n) && n < matches.length) {
            return fixCase(lexer, matches[n]);
        }
        if (!empty(attr) && lexer && typeof (lexer[attr]) === 'string') {
            return lexer[attr];
        }
        if (stateMatches === null) {
            stateMatches = state.split('.');
            stateMatches.unshift(state);
        }
        if (!empty(s) && s < stateMatches.length) {
            return fixCase(lexer, stateMatches[s]);
        }
        return '';
    });
}
function findRules(lexer, state) {
    while (state && state.length > 0) {
        var rules = lexer.tokenizer[state];
        if (rules) {
            return rules;
        }
        var idx = state.lastIndexOf('.');
        if (idx < 0) {
            state = null;
        }
        else {
            state = state.substr(0, idx);
        }
    }
    return null;
}
function stateExists(lexer, state) {
    while (state && state.length > 0) {
        var exist = lexer.stateNames[state];
        if (exist) {
            return true;
        }
        var idx = state.lastIndexOf('.');
        if (idx < 0) {
            state = null;
        }
        else {
            state = state.substr(0, idx);
        }
    }
    return false;
}

function isArrayOf(elemType, obj) {
    if (!obj) {
        return false;
    }
    if (!(Array.isArray(obj))) {
        return false;
    }
    var idx;
    for (idx in obj) {
        if (obj.hasOwnProperty(idx)) {
            if (!(elemType(obj[idx]))) {
                return false;
            }
        }
    }
    return true;
}
function bool(prop, def, onerr) {
    if (typeof (prop) === 'boolean') {
        return prop;
    }
    if (onerr && (prop || def === undefined)) {
        onerr();
    }
    return (def === undefined ? null : def);
}
function string(prop, def, onerr) {
    if (typeof (prop) === 'string') {
        return prop;
    }
    if (onerr && (prop || def === undefined)) {
        onerr();
    }
    return (def === undefined ? null : def);
}
function compileRegExp(lexer, str) {
    if (typeof (str) !== 'string') {
        return null;
    }
    var n = 0;
    while (str.indexOf('@') >= 0 && n < 5) {
        n++;
        str = str.replace(/@(\w+)/g, function (s, attr) {
            var sub = '';
            if (typeof (lexer[attr]) === 'string') {
                sub = lexer[attr];
            }
            else if (lexer[attr] && lexer[attr] instanceof RegExp) {
                sub = lexer[attr].source;
            }
            else {
                if (lexer[attr] === undefined) {
                    throwError(lexer, 'language definition does not contain attribute \'' + attr + '\', used at: ' + str);
                }
                else {
                    throwError(lexer, 'attribute reference \'' + attr + '\' must be a string, used at: ' + str);
                }
            }
            return (empty(sub) ? '' : '(?:' + sub + ')');
        });
    }
    return new RegExp(str, (lexer.ignoreCase ? 'i' : ''));
}
function selectScrutinee(id, matches, state, num) {
    if (num < 0) {
        return id;
    }
    if (num < matches.length) {
        return matches[num];
    }
    if (num >= 100) {
        num = num - 100;
        var parts = state.split('.');
        parts.unshift(state);
        if (num < parts.length) {
            return parts[num];
        }
    }
    return null;
}
function createGuard(lexer, ruleName, tkey, val) {
    var scrut = -1;
    var oppat = tkey;
    var matches = tkey.match(/^\$(([sS]?)(\d\d?)|#)(.*)$/);
    if (matches) {
        if (matches[3]) {
            scrut = parseInt(matches[3]);
            if (matches[2]) {
                scrut = scrut + 100;
            }
        }
        oppat = matches[4];
    }
    var op = '~';
    var pat = oppat;
    if (!oppat || oppat.length === 0) {
        op = '!=';
        pat = '';
    }
    else if (/^\w*$/.test(pat)) {
        op = '==';
    }
    else {
        matches = oppat.match(/^(@|!@|~|!~|==|!=)(.*)$/);
        if (matches) {
            op = matches[1];
            pat = matches[2];
        }
    }
    var tester;
    if ((op === '~' || op === '!~') && /^(\w|\|)*$/.test(pat)) {
        var inWords = createKeywordMatcher(pat.split('|'), lexer.ignoreCase);
        tester = function (s) { return (op === '~' ? inWords(s) : !inWords(s)); };
    }
    else if (op === '@' || op === '!@') {
        var words = lexer[pat];
        if (!words) {
            throwError(lexer, 'the @ match target \'' + pat + '\' is not defined, in rule: ' + ruleName);
        }
        if (!(isArrayOf(function (elem) { return (typeof (elem) === 'string'); }, words))) {
            throwError(lexer, 'the @ match target \'' + pat + '\' must be an array of strings, in rule: ' + ruleName);
        }
        var inWords = createKeywordMatcher(words, lexer.ignoreCase);
        tester = function (s) { return (op === '@' ? inWords(s) : !inWords(s)); };
    }
    else if (op === '~' || op === '!~') {
        if (pat.indexOf('$') < 0) {
            var re = compileRegExp(lexer, '^' + pat + '$');
            tester = function (s) { return (op === '~' ? re.test(s) : !re.test(s)); };
        }
        else {
            tester = function (s, id, matches, state) {
                var re = compileRegExp(lexer, '^' + substituteMatches(lexer, pat, id, matches, state) + '$');
                return re.test(s);
            };
        }
    }
    else {
        if (pat.indexOf('$') < 0) {
            var patx = fixCase(lexer, pat);
            tester = function (s) { return (op === '==' ? s === patx : s !== patx); };
        }
        else {
            var patx = fixCase(lexer, pat);
            tester = function (s, id, matches, state, eos) {
                var patexp = substituteMatches(lexer, patx, id, matches, state);
                return (op === '==' ? s === patexp : s !== patexp);
            };
        }
    }
    if (scrut === -1) {
        return {
            name: tkey, value: val, test: function (id, matches, state, eos) {
                return tester(id, id, matches, state, eos);
            }
        };
    }
    else {
        return {
            name: tkey, value: val, test: function (id, matches, state, eos) {
                var scrutinee = selectScrutinee(id, matches, state, scrut);
                return tester(!scrutinee ? '' : scrutinee, id, matches, state, eos);
            }
        };
    }
}
function compileAction(lexer, ruleName, action) {
    if (!action) {
        return { token: '' };
    }
    else if (typeof (action) === 'string') {
        return action;
    }
    else if (action.token || action.token === '') {
        if (typeof (action.token) !== 'string') {
            throwError(lexer, 'a \'token\' attribute must be of type string, in rule: ' + ruleName);
            return { token: '' };
        }
        else {
            var newAction = { token: action.token };
            if (action.token.indexOf('$') >= 0) {
                newAction.tokenSubst = true;
            }
            if (typeof (action.bracket) === 'string') {
                if (action.bracket === '@open') {
                    newAction.bracket = 1;
                }
                else if (action.bracket === '@close') {
                    newAction.bracket = -1;
                }
                else {
                    throwError(lexer, 'a \'bracket\' attribute must be either \'@open\' or \'@close\', in rule: ' + ruleName);
                }
            }
            if (action.next) {
                if (typeof (action.next) !== 'string') {
                    throwError(lexer, 'the next state must be a string value in rule: ' + ruleName);
                }
                else {
                    var next = action.next;
                    if (!/^(@pop|@push|@popall)$/.test(next)) {
                        if (next[0] === '@') {
                            next = next.substr(1);
                        }
                        if (next.indexOf('$') < 0) {
                            if (!stateExists(lexer, substituteMatches(lexer, next, '', [], ''))) {
                                throwError(lexer, 'the next state \'' + action.next + '\' is not defined in rule: ' + ruleName);
                            }
                        }
                    }
                    newAction.next = next;
                }
            }
            if (typeof (action.goBack) === 'number') {
                newAction.goBack = action.goBack;
            }
            if (typeof (action.switchTo) === 'string') {
                newAction.switchTo = action.switchTo;
            }
            if (typeof (action.log) === 'string') {
                newAction.log = action.log;
            }
            if (typeof (action.nextEmbedded) === 'string') {
                newAction.nextEmbedded = action.nextEmbedded;
                lexer.usesEmbedded = true;
            }
            return newAction;
        }
    }
    else if (Array.isArray(action)) {
        var results = [];
        var idx;
        for (idx in action) {
            if (action.hasOwnProperty(idx)) {
                results[idx] = compileAction(lexer, ruleName, action[idx]);
            }
        }
        return { group: results };
    }
    else if (action.cases) {
        var cases = [];
        var tkey;
        for (tkey in action.cases) {
            if (action.cases.hasOwnProperty(tkey)) {
                var val = compileAction(lexer, ruleName, action.cases[tkey]);
                if (tkey === '@default' || tkey === '@' || tkey === '') {
                    cases.push({ test: null, value: val, name: tkey });
                }
                else if (tkey === '@eos') {
                    cases.push({ test: function (id, matches, state, eos) { return eos; }, value: val, name: tkey });
                }
                else {
                    cases.push(createGuard(lexer, ruleName, tkey, val));
                }
            }
        }
        var def = lexer.defaultToken;
        return {
            test: function (id, matches, state, eos) {
                var idx;
                for (idx in cases) {
                    if (cases.hasOwnProperty(idx)) {
                        var didmatch = (!cases[idx].test || cases[idx].test(id, matches, state, eos));
                        if (didmatch) {
                            return cases[idx].value;
                        }
                    }
                }
                return def;
            }
        };
    }
    else {
        throwError(lexer, 'an action must be a string, an object with a \'token\' or \'cases\' attribute, or an array of actions; in rule: ' + ruleName);
        return '';
    }
}
class Rule {
    constructor(name) {
        this.regex = new RegExp('');
        this.action = { token: '' };
        this.matchOnlyAtLineStart = false;
        this.name = '';
        this.name = name;
    }
    setRegex(lexer, re) {
        var sregex;
        if (typeof (re) === 'string') {
            sregex = re;
        }
        else if (re instanceof RegExp) {
            sregex = re.source;
        }
        else {
            throwError(lexer, 'rules must start with a match string or regular expression: ' + this.name);
        }
        this.matchOnlyAtLineStart = (sregex.length > 0 && sregex[0] === '^');
        this.name = this.name + ': ' + sregex;
        this.regex = compileRegExp(lexer, '^(?:' + (this.matchOnlyAtLineStart ? sregex.substr(1) : sregex) + ')');
    }
    setAction(lexer, act) {
        this.action = compileAction(lexer, this.name, act);
    }
}
function compile(languageId, json) {
    if (!json || typeof (json) !== 'object') {
        throw new Error('Monarch: expecting a language definition object');
    }
    var lexer = {};
    lexer.languageId = languageId;
    lexer.noThrow = false;
    lexer.maxStack = 100;
    lexer.start = string(json.start);
    lexer.ignoreCase = bool(json.ignoreCase, false);
    lexer.tokenPostfix = string(json.tokenPostfix, '.' + lexer.languageId);
    lexer.defaultToken = string(json.defaultToken, 'source', function () { throwError(lexer, 'the \'defaultToken\' must be a string'); });
    lexer.usesEmbedded = false;
    var lexerMin = json;
    lexerMin.languageId = languageId;
    lexerMin.ignoreCase = lexer.ignoreCase;
    lexerMin.noThrow = lexer.noThrow;
    lexerMin.usesEmbedded = lexer.usesEmbedded;
    lexerMin.stateNames = json.tokenizer;
    lexerMin.defaultToken = lexer.defaultToken;
    function addRules(state, newrules, rules) {
        var idx;
        for (idx in rules) {
            if (rules.hasOwnProperty(idx)) {
                var rule = rules[idx];
                var include = rule.include;
                if (include) {
                    if (typeof (include) !== 'string') {
                        throwError(lexer, 'an \'include\' attribute must be a string at: ' + state);
                    }
                    if (include[0] === '@') {
                        include = include.substr(1);
                    }
                    if (!json.tokenizer[include]) {
                        throwError(lexer, 'include target \'' + include + '\' is not defined at: ' + state);
                    }
                    addRules(state + '.' + include, newrules, json.tokenizer[include]);
                }
                else {
                    var newrule = new Rule(state);
                    if (Array.isArray(rule) && rule.length >= 1 && rule.length <= 3) {
                        newrule.setRegex(lexerMin, rule[0]);
                        if (rule.length >= 3) {
                            if (typeof (rule[1]) === 'string') {
                                newrule.setAction(lexerMin, { token: rule[1], next: rule[2] });
                            }
                            else if (typeof (rule[1]) === 'object') {
                                var rule1 = rule[1];
                                rule1.next = rule[2];
                                newrule.setAction(lexerMin, rule1);
                            }
                            else {
                                throwError(lexer, 'a next state as the last element of a rule can only be given if the action is either an object or a string, at: ' + state);
                            }
                        }
                        else {
                            newrule.setAction(lexerMin, rule[1]);
                        }
                    }
                    else {
                        if (!rule.regex) {
                            throwError(lexer, 'a rule must either be an array, or an object with a \'regex\' or \'include\' field at: ' + state);
                        }
                        if (rule.name) {
                            newrule.name = string(rule.name);
                        }
                        if (rule.matchOnlyAtStart) {
                            newrule.matchOnlyAtLineStart = bool(rule.matchOnlyAtLineStart);
                        }
                        newrule.setRegex(lexerMin, rule.regex);
                        newrule.setAction(lexerMin, rule.action);
                    }
                    newrules.push(newrule);
                }
            }
        }
    }
    if (!json.tokenizer || typeof (json.tokenizer) !== 'object') {
        throwError(lexer, 'a language definition must define the \'tokenizer\' attribute as an object');
    }
    lexer.tokenizer = [];
    var key;
    for (key in json.tokenizer) {
        if (json.tokenizer.hasOwnProperty(key)) {
            if (!lexer.start) {
                lexer.start = key;
            }
            var rules = json.tokenizer[key];
            lexer.tokenizer[key] = new Array();
            addRules('tokenizer.' + key, lexer.tokenizer[key], rules);
        }
    }
    lexer.usesEmbedded = lexerMin.usesEmbedded;
    if (json.brackets) {
        if (!(Array.isArray(json.brackets))) {
            throwError(lexer, 'the \'brackets\' attribute must be defined as an array');
        }
    }
    else {
        json.brackets = [
            { open: '{', close: '}', token: 'delimiter.curly' },
            { open: '[', close: ']', token: 'delimiter.square' },
            { open: '(', close: ')', token: 'delimiter.parenthesis' },
            { open: '<', close: '>', token: 'delimiter.angle' }
        ];
    }
    var brackets = [];
    for (var bracketIdx in json.brackets) {
        if (json.brackets.hasOwnProperty(bracketIdx)) {
            var desc = json.brackets[bracketIdx];
            if (desc && Array.isArray(desc) && desc.length === 3) {
                desc = { token: desc[2], open: desc[0], close: desc[1] };
            }
            if (desc.open === desc.close) {
                throwError(lexer, 'open and close brackets in a \'brackets\' attribute must be different: ' + desc.open +
                    '\n hint: use the \'bracket\' attribute if matching on equal brackets is required.');
            }
            if (typeof (desc.open) === 'string' && typeof (desc.token) === 'string') {
                brackets.push({
                    token: string(desc.token) + lexer.tokenPostfix,
                    open: fixCase(lexer, string(desc.open)),
                    close: fixCase(lexer, string(desc.close))
                });
            }
            else {
                throwError(lexer, 'every element in the \'brackets\' array must be a \'{open,close,token}\' object or array');
            }
        }
    }
    lexer.brackets = brackets;
    lexer.noThrow = true;
    return lexer;
}

const empty$1 = Object.freeze({
    dispose() { }
});

let _isWindows = false;
let _isMacintosh = false;
let _isLinux = false;
let _isRootUser = false;
let _isNative = false;
let _locale = undefined;

if (typeof navigator === 'object') {
    let userAgent = navigator.userAgent;
    _isWindows = userAgent.indexOf('Windows') >= 0;
    _isMacintosh = userAgent.indexOf('Macintosh') >= 0;
    _isLinux = userAgent.indexOf('Linux') >= 0;
    _locale = navigator.language;
    
}
var Platform;
(function (Platform) {
    Platform[Platform["Web"] = 0] = "Web";
    Platform[Platform["Mac"] = 1] = "Mac";
    Platform[Platform["Linux"] = 2] = "Linux";
    Platform[Platform["Windows"] = 3] = "Windows";
})(Platform || (Platform = {}));
let _platform = Platform.Web;
if (_isNative) {
    if (_isMacintosh) {
        _platform = Platform.Mac;
    }
    else if (_isWindows) {
        _platform = Platform.Windows;
    }
    else if (_isLinux) {
        _platform = Platform.Linux;
    }
}









const _globals = (typeof self === 'object' ? self : global);


const setTimeout$1 = _globals.setTimeout.bind(_globals);
const clearTimeout$1 = _globals.clearTimeout.bind(_globals);
const setInterval = _globals.setInterval.bind(_globals);
const clearInterval = _globals.clearInterval.bind(_globals);

/**
 * Extracted from https://github.com/winjs/winjs
 * Version: 4.4.0(ec3258a9f3a36805a187848984e3bb938044178d)
 * Copyright (c) Microsoft Corporation.
 * All Rights Reserved.
 * Licensed under the MIT License.
 */
var win = (function() {

	var _modules = {};
	_modules["WinJS/Core/_WinJS"] = {};

	var _winjs = function(moduleId, deps, factory) {
		var exports = {};
		var exportsPassedIn = false;

		var depsValues = deps.map(function(dep) {
			if (dep === 'exports') {
				exportsPassedIn = true;
				return exports;
			}
			return _modules[dep];
		});

		var result = factory.apply({}, depsValues);

		_modules[moduleId] = exportsPassedIn ? exports : result;
	};


	_winjs("WinJS/Core/_Global", [], function () {
		var globalObject =
			typeof window !== 'undefined' ? window :
			typeof self !== 'undefined' ? self :
			typeof global !== 'undefined' ? global :
			{};
		return globalObject;
	});

	_winjs("WinJS/Core/_BaseCoreUtils", ["WinJS/Core/_Global"], function baseCoreUtilsInit(_Global) {
		var hasWinRT = !!_Global.Windows;

		function markSupportedForProcessing(func) {
			/// <signature helpKeyword="WinJS.Utilities.markSupportedForProcessing">
			/// <summary locid="WinJS.Utilities.markSupportedForProcessing">
			/// Marks a function as being compatible with declarative processing, such as WinJS.UI.processAll
			/// or WinJS.Binding.processAll.
			/// </summary>
			/// <param name="func" type="Function" locid="WinJS.Utilities.markSupportedForProcessing_p:func">
			/// The function to be marked as compatible with declarative processing.
			/// </param>
			/// <returns type="Function" locid="WinJS.Utilities.markSupportedForProcessing_returnValue">
			/// The input function.
			/// </returns>
			/// </signature>
			func.supportedForProcessing = true;
			return func;
		}

		return {
			hasWinRT: hasWinRT,
			markSupportedForProcessing: markSupportedForProcessing,
			_setImmediate: _Global.setImmediate ? _Global.setImmediate.bind(_Global) : function (handler) {
				_Global.setTimeout(handler, 0);
			}
		};
	});
	_winjs("WinJS/Core/_WriteProfilerMark", ["WinJS/Core/_Global"], function profilerInit(_Global) {
		return _Global.msWriteProfilerMark || function () { };
	});
	_winjs("WinJS/Core/_Base", ["WinJS/Core/_WinJS","WinJS/Core/_Global","WinJS/Core/_BaseCoreUtils","WinJS/Core/_WriteProfilerMark"], function baseInit(_WinJS, _Global, _BaseCoreUtils, _WriteProfilerMark) {
		function initializeProperties(target, members, prefix) {
			var keys = Object.keys(members);
			var isArray = Array.isArray(target);
			var properties;
			var i, len;
			for (i = 0, len = keys.length; i < len; i++) {
				var key = keys[i];
				var enumerable = key.charCodeAt(0) !== /*_*/95;
				var member = members[key];
				if (member && typeof member === 'object') {
					if (member.value !== undefined || typeof member.get === 'function' || typeof member.set === 'function') {
						if (member.enumerable === undefined) {
							member.enumerable = enumerable;
						}
						if (prefix && member.setName && typeof member.setName === 'function') {
							member.setName(prefix + "." + key);
						}
						properties = properties || {};
						properties[key] = member;
						continue;
					}
				}
				if (!enumerable) {
					properties = properties || {};
					properties[key] = { value: member, enumerable: enumerable, configurable: true, writable: true };
					continue;
				}
				if (isArray) {
					target.forEach(function (target) {
						target[key] = member;
					});
				} else {
					target[key] = member;
				}
			}
			if (properties) {
				if (isArray) {
					target.forEach(function (target) {
						Object.defineProperties(target, properties);
					});
				} else {
					Object.defineProperties(target, properties);
				}
			}
		}

		(function () {

			var _rootNamespace = _WinJS;
			if (!_rootNamespace.Namespace) {
				_rootNamespace.Namespace = Object.create(Object.prototype);
			}

			function createNamespace(parentNamespace, name) {
				var currentNamespace = parentNamespace || {};
				if (name) {
					var namespaceFragments = name.split(".");
					if (currentNamespace === _Global && namespaceFragments[0] === "WinJS") {
						currentNamespace = _WinJS;
						namespaceFragments.splice(0, 1);
					}
					for (var i = 0, len = namespaceFragments.length; i < len; i++) {
						var namespaceName = namespaceFragments[i];
						if (!currentNamespace[namespaceName]) {
							Object.defineProperty(currentNamespace, namespaceName,
								{ value: {}, writable: false, enumerable: true, configurable: true }
							);
						}
						currentNamespace = currentNamespace[namespaceName];
					}
				}
				return currentNamespace;
			}

			function defineWithParent(parentNamespace, name, members) {
				/// <signature helpKeyword="WinJS.Namespace.defineWithParent">
				/// <summary locid="WinJS.Namespace.defineWithParent">
				/// Defines a new namespace with the specified name under the specified parent namespace.
				/// </summary>
				/// <param name="parentNamespace" type="Object" locid="WinJS.Namespace.defineWithParent_p:parentNamespace">
				/// The parent namespace.
				/// </param>
				/// <param name="name" type="String" locid="WinJS.Namespace.defineWithParent_p:name">
				/// The name of the new namespace.
				/// </param>
				/// <param name="members" type="Object" locid="WinJS.Namespace.defineWithParent_p:members">
				/// The members of the new namespace.
				/// </param>
				/// <returns type="Object" locid="WinJS.Namespace.defineWithParent_returnValue">
				/// The newly-defined namespace.
				/// </returns>
				/// </signature>
				var currentNamespace = createNamespace(parentNamespace, name);

				if (members) {
					initializeProperties(currentNamespace, members, name || "<ANONYMOUS>");
				}

				return currentNamespace;
			}

			function define(name, members) {
				/// <signature helpKeyword="WinJS.Namespace.define">
				/// <summary locid="WinJS.Namespace.define">
				/// Defines a new namespace with the specified name.
				/// </summary>
				/// <param name="name" type="String" locid="WinJS.Namespace.define_p:name">
				/// The name of the namespace. This could be a dot-separated name for nested namespaces.
				/// </param>
				/// <param name="members" type="Object" locid="WinJS.Namespace.define_p:members">
				/// The members of the new namespace.
				/// </param>
				/// <returns type="Object" locid="WinJS.Namespace.define_returnValue">
				/// The newly-defined namespace.
				/// </returns>
				/// </signature>
				return defineWithParent(_Global, name, members);
			}

			var LazyStates = {
				uninitialized: 1,
				working: 2,
				initialized: 3,
			};

			function lazy(f) {
				var name;
				var state = LazyStates.uninitialized;
				var result;
				return {
					setName: function (value) {
						name = value;
					},
					get: function () {
						switch (state) {
							case LazyStates.initialized:
								return result;

							case LazyStates.uninitialized:
								state = LazyStates.working;
								try {
									_WriteProfilerMark("WinJS.Namespace._lazy:" + name + ",StartTM");
									result = f();
								} finally {
									_WriteProfilerMark("WinJS.Namespace._lazy:" + name + ",StopTM");
									state = LazyStates.uninitialized;
								}
								f = null;
								state = LazyStates.initialized;
								return result;

							case LazyStates.working:
								throw "Illegal: reentrancy on initialization";

							default:
								throw "Illegal";
						}
					},
					set: function (value) {
						switch (state) {
							case LazyStates.working:
								throw "Illegal: reentrancy on initialization";

							default:
								state = LazyStates.initialized;
								result = value;
								break;
						}
					},
					enumerable: true,
					configurable: true,
				};
			}

			// helper for defining AMD module members
			function moduleDefine(exports, name, members) {
				var target = [exports];
				var publicNS = null;
				if (name) {
					publicNS = createNamespace(_Global, name);
					target.push(publicNS);
				}
				initializeProperties(target, members, name || "<ANONYMOUS>");
				return publicNS;
			}

			// Establish members of the "WinJS.Namespace" namespace
			Object.defineProperties(_rootNamespace.Namespace, {

				defineWithParent: { value: defineWithParent, writable: true, enumerable: true, configurable: true },

				define: { value: define, writable: true, enumerable: true, configurable: true },

				_lazy: { value: lazy, writable: true, enumerable: true, configurable: true },

				_moduleDefine: { value: moduleDefine, writable: true, enumerable: true, configurable: true }

			});

		})();

		(function () {

			function define(constructor, instanceMembers, staticMembers) {
				/// <signature helpKeyword="WinJS.Class.define">
				/// <summary locid="WinJS.Class.define">
				/// Defines a class using the given constructor and the specified instance members.
				/// </summary>
				/// <param name="constructor" type="Function" locid="WinJS.Class.define_p:constructor">
				/// A constructor function that is used to instantiate this class.
				/// </param>
				/// <param name="instanceMembers" type="Object" locid="WinJS.Class.define_p:instanceMembers">
				/// The set of instance fields, properties, and methods made available on the class.
				/// </param>
				/// <param name="staticMembers" type="Object" locid="WinJS.Class.define_p:staticMembers">
				/// The set of static fields, properties, and methods made available on the class.
				/// </param>
				/// <returns type="Function" locid="WinJS.Class.define_returnValue">
				/// The newly-defined class.
				/// </returns>
				/// </signature>
				constructor = constructor || function () { };
				_BaseCoreUtils.markSupportedForProcessing(constructor);
				if (instanceMembers) {
					initializeProperties(constructor.prototype, instanceMembers);
				}
				if (staticMembers) {
					initializeProperties(constructor, staticMembers);
				}
				return constructor;
			}

			function derive(baseClass, constructor, instanceMembers, staticMembers) {
				/// <signature helpKeyword="WinJS.Class.derive">
				/// <summary locid="WinJS.Class.derive">
				/// Creates a sub-class based on the supplied baseClass parameter, using prototypal inheritance.
				/// </summary>
				/// <param name="baseClass" type="Function" locid="WinJS.Class.derive_p:baseClass">
				/// The class to inherit from.
				/// </param>
				/// <param name="constructor" type="Function" locid="WinJS.Class.derive_p:constructor">
				/// A constructor function that is used to instantiate this class.
				/// </param>
				/// <param name="instanceMembers" type="Object" locid="WinJS.Class.derive_p:instanceMembers">
				/// The set of instance fields, properties, and methods to be made available on the class.
				/// </param>
				/// <param name="staticMembers" type="Object" locid="WinJS.Class.derive_p:staticMembers">
				/// The set of static fields, properties, and methods to be made available on the class.
				/// </param>
				/// <returns type="Function" locid="WinJS.Class.derive_returnValue">
				/// The newly-defined class.
				/// </returns>
				/// </signature>
				if (baseClass) {
					constructor = constructor || function () { };
					var basePrototype = baseClass.prototype;
					constructor.prototype = Object.create(basePrototype);
					_BaseCoreUtils.markSupportedForProcessing(constructor);
					Object.defineProperty(constructor.prototype, "constructor", { value: constructor, writable: true, configurable: true, enumerable: true });
					if (instanceMembers) {
						initializeProperties(constructor.prototype, instanceMembers);
					}
					if (staticMembers) {
						initializeProperties(constructor, staticMembers);
					}
					return constructor;
				} else {
					return define(constructor, instanceMembers, staticMembers);
				}
			}

			function mix(constructor) {
				/// <signature helpKeyword="WinJS.Class.mix">
				/// <summary locid="WinJS.Class.mix">
				/// Defines a class using the given constructor and the union of the set of instance members
				/// specified by all the mixin objects. The mixin parameter list is of variable length.
				/// </summary>
				/// <param name="constructor" locid="WinJS.Class.mix_p:constructor">
				/// A constructor function that is used to instantiate this class.
				/// </param>
				/// <returns type="Function" locid="WinJS.Class.mix_returnValue">
				/// The newly-defined class.
				/// </returns>
				/// </signature>
				constructor = constructor || function () { };
				var i, len;
				for (i = 1, len = arguments.length; i < len; i++) {
					initializeProperties(constructor.prototype, arguments[i]);
				}
				return constructor;
			}

			// Establish members of "WinJS.Class" namespace
			_WinJS.Namespace.define("WinJS.Class", {
				define: define,
				derive: derive,
				mix: mix
			});

		})();

		return {
			Namespace: _WinJS.Namespace,
			Class: _WinJS.Class
		};

	});
	_winjs("WinJS/Core/_ErrorFromName", ["WinJS/Core/_Base"], function errorsInit(_Base) {
		var ErrorFromName = _Base.Class.derive(Error, function (name, message) {
			/// <signature helpKeyword="WinJS.ErrorFromName">
			/// <summary locid="WinJS.ErrorFromName">
			/// Creates an Error object with the specified name and message properties.
			/// </summary>
			/// <param name="name" type="String" locid="WinJS.ErrorFromName_p:name">The name of this error. The name is meant to be consumed programmatically and should not be localized.</param>
			/// <param name="message" type="String" optional="true" locid="WinJS.ErrorFromName_p:message">The message for this error. The message is meant to be consumed by humans and should be localized.</param>
			/// <returns type="Error" locid="WinJS.ErrorFromName_returnValue">Error instance with .name and .message properties populated</returns>
			/// </signature>
			this.name = name;
			this.message = message || name;
		}, {
			/* empty */
		}, {
			supportedForProcessing: false,
		});

		_Base.Namespace.define("WinJS", {
			// ErrorFromName establishes a simple pattern for returning error codes.
			//
			ErrorFromName: ErrorFromName
		});

		return ErrorFromName;

	});


	_winjs("WinJS/Core/_Events", ["exports","WinJS/Core/_Base"], function eventsInit(exports, _Base) {
		function createEventProperty(name) {
			var eventPropStateName = "_on" + name + "state";

			return {
				get: function () {
					var state = this[eventPropStateName];
					return state && state.userHandler;
				},
				set: function (handler) {
					var state = this[eventPropStateName];
					if (handler) {
						if (!state) {
							state = { wrapper: function (evt) { return state.userHandler(evt); }, userHandler: handler };
							Object.defineProperty(this, eventPropStateName, { value: state, enumerable: false, writable:true, configurable: true });
							this.addEventListener(name, state.wrapper, false);
						}
						state.userHandler = handler;
					} else if (state) {
						this.removeEventListener(name, state.wrapper, false);
						this[eventPropStateName] = null;
					}
				},
				enumerable: true
			};
		}

		function createEventProperties() {
			/// <signature helpKeyword="WinJS.Utilities.createEventProperties">
			/// <summary locid="WinJS.Utilities.createEventProperties">
			/// Creates an object that has one property for each name passed to the function.
			/// </summary>
			/// <param name="events" locid="WinJS.Utilities.createEventProperties_p:events">
			/// A variable list of property names.
			/// </param>
			/// <returns type="Object" locid="WinJS.Utilities.createEventProperties_returnValue">
			/// The object with the specified properties. The names of the properties are prefixed with 'on'.
			/// </returns>
			/// </signature>
			var props = {};
			for (var i = 0, len = arguments.length; i < len; i++) {
				var name = arguments[i];
				props["on" + name] = createEventProperty(name);
			}
			return props;
		}

		var EventMixinEvent = _Base.Class.define(
			function EventMixinEvent_ctor(type, detail, target) {
				this.detail = detail;
				this.target = target;
				this.timeStamp = Date.now();
				this.type = type;
			},
			{
				bubbles: { value: false, writable: false },
				cancelable: { value: false, writable: false },
				currentTarget: {
					get: function () { return this.target; }
				},
				defaultPrevented: {
					get: function () { return this._preventDefaultCalled; }
				},
				trusted: { value: false, writable: false },
				eventPhase: { value: 0, writable: false },
				target: null,
				timeStamp: null,
				type: null,

				preventDefault: function () {
					this._preventDefaultCalled = true;
				},
				stopImmediatePropagation: function () {
					this._stopImmediatePropagationCalled = true;
				},
				stopPropagation: function () {
				}
			}, {
				supportedForProcessing: false,
			}
		);

		var eventMixin = {
			_listeners: null,

			addEventListener: function (type, listener, useCapture) {
				/// <signature helpKeyword="WinJS.Utilities.eventMixin.addEventListener">
				/// <summary locid="WinJS.Utilities.eventMixin.addEventListener">
				/// Adds an event listener to the control.
				/// </summary>
				/// <param name="type" locid="WinJS.Utilities.eventMixin.addEventListener_p:type">
				/// The type (name) of the event.
				/// </param>
				/// <param name="listener" locid="WinJS.Utilities.eventMixin.addEventListener_p:listener">
				/// The listener to invoke when the event is raised.
				/// </param>
				/// <param name="useCapture" locid="WinJS.Utilities.eventMixin.addEventListener_p:useCapture">
				/// if true initiates capture, otherwise false.
				/// </param>
				/// </signature>
				useCapture = useCapture || false;
				this._listeners = this._listeners || {};
				var eventListeners = (this._listeners[type] = this._listeners[type] || []);
				for (var i = 0, len = eventListeners.length; i < len; i++) {
					var l = eventListeners[i];
					if (l.useCapture === useCapture && l.listener === listener) {
						return;
					}
				}
				eventListeners.push({ listener: listener, useCapture: useCapture });
			},
			dispatchEvent: function (type, details) {
				/// <signature helpKeyword="WinJS.Utilities.eventMixin.dispatchEvent">
				/// <summary locid="WinJS.Utilities.eventMixin.dispatchEvent">
				/// Raises an event of the specified type and with the specified additional properties.
				/// </summary>
				/// <param name="type" locid="WinJS.Utilities.eventMixin.dispatchEvent_p:type">
				/// The type (name) of the event.
				/// </param>
				/// <param name="details" locid="WinJS.Utilities.eventMixin.dispatchEvent_p:details">
				/// The set of additional properties to be attached to the event object when the event is raised.
				/// </param>
				/// <returns type="Boolean" locid="WinJS.Utilities.eventMixin.dispatchEvent_returnValue">
				/// true if preventDefault was called on the event.
				/// </returns>
				/// </signature>
				var listeners = this._listeners && this._listeners[type];
				if (listeners) {
					var eventValue = new EventMixinEvent(type, details, this);
					// Need to copy the array to protect against people unregistering while we are dispatching
					listeners = listeners.slice(0, listeners.length);
					for (var i = 0, len = listeners.length; i < len && !eventValue._stopImmediatePropagationCalled; i++) {
						listeners[i].listener(eventValue);
					}
					return eventValue.defaultPrevented || false;
				}
				return false;
			},
			removeEventListener: function (type, listener, useCapture) {
				/// <signature helpKeyword="WinJS.Utilities.eventMixin.removeEventListener">
				/// <summary locid="WinJS.Utilities.eventMixin.removeEventListener">
				/// Removes an event listener from the control.
				/// </summary>
				/// <param name="type" locid="WinJS.Utilities.eventMixin.removeEventListener_p:type">
				/// The type (name) of the event.
				/// </param>
				/// <param name="listener" locid="WinJS.Utilities.eventMixin.removeEventListener_p:listener">
				/// The listener to remove.
				/// </param>
				/// <param name="useCapture" locid="WinJS.Utilities.eventMixin.removeEventListener_p:useCapture">
				/// Specifies whether to initiate capture.
				/// </param>
				/// </signature>
				useCapture = useCapture || false;
				var listeners = this._listeners && this._listeners[type];
				if (listeners) {
					for (var i = 0, len = listeners.length; i < len; i++) {
						var l = listeners[i];
						if (l.listener === listener && l.useCapture === useCapture) {
							listeners.splice(i, 1);
							if (listeners.length === 0) {
								delete this._listeners[type];
							}
							// Only want to remove one element for each call to removeEventListener
							break;
						}
					}
				}
			}
		};

		_Base.Namespace._moduleDefine(exports, "WinJS.Utilities", {
			_createEventProperty: createEventProperty,
			createEventProperties: createEventProperties,
			eventMixin: eventMixin
		});

	});


	_winjs("WinJS/Core/_Trace", ["WinJS/Core/_Global"], function traceInit(_Global) {
		function nop(v) {
			return v;
		}

		return {
			_traceAsyncOperationStarting: (_Global.Debug && _Global.Debug.msTraceAsyncOperationStarting && _Global.Debug.msTraceAsyncOperationStarting.bind(_Global.Debug)) || nop,
			_traceAsyncOperationCompleted: (_Global.Debug && _Global.Debug.msTraceAsyncOperationCompleted && _Global.Debug.msTraceAsyncOperationCompleted.bind(_Global.Debug)) || nop,
			_traceAsyncCallbackStarting: (_Global.Debug && _Global.Debug.msTraceAsyncCallbackStarting && _Global.Debug.msTraceAsyncCallbackStarting.bind(_Global.Debug)) || nop,
			_traceAsyncCallbackCompleted: (_Global.Debug && _Global.Debug.msTraceAsyncCallbackCompleted && _Global.Debug.msTraceAsyncCallbackCompleted.bind(_Global.Debug)) || nop
		};
	});
	_winjs("WinJS/Promise/_StateMachine", ["WinJS/Core/_Global","WinJS/Core/_BaseCoreUtils","WinJS/Core/_Base","WinJS/Core/_ErrorFromName","WinJS/Core/_Events","WinJS/Core/_Trace"], function promiseStateMachineInit(_Global, _BaseCoreUtils, _Base, _ErrorFromName, _Events, _Trace) {
		_Global.Debug && (_Global.Debug.setNonUserCodeExceptions = true);

		var ListenerType = _Base.Class.mix(_Base.Class.define(null, { /*empty*/ }, { supportedForProcessing: false }), _Events.eventMixin);
		var promiseEventListeners = new ListenerType();
		// make sure there is a listeners collection so that we can do a more trivial check below
		promiseEventListeners._listeners = {};
		var errorET = "error";
		var canceledName = "Canceled";
		var tagWithStack = false;
		var tag = {
			promise: 0x01,
			thenPromise: 0x02,
			errorPromise: 0x04,
			exceptionPromise: 0x08,
			completePromise: 0x10,
		};
		tag.all = tag.promise | tag.thenPromise | tag.errorPromise | tag.exceptionPromise | tag.completePromise;

		//
		// Global error counter, for each error which enters the system we increment this once and then
		// the error number travels with the error as it traverses the tree of potential handlers.
		//
		// When someone has registered to be told about errors (WinJS.Promise.callonerror) promises
		// which are in error will get tagged with a ._errorId field. This tagged field is the
		// contract by which nested promises with errors will be identified as chaining for the
		// purposes of the callonerror semantics. If a nested promise in error is encountered without
		// a ._errorId it will be assumed to be foreign and treated as an interop boundary and
		// a new error id will be minted.
		//
		var error_number = 1;

		//
		// The state machine has a interesting hiccup in it with regards to notification, in order
		// to flatten out notification and avoid recursion for synchronous completion we have an
		// explicit set of *_notify states which are responsible for notifying their entire tree
		// of children. They can do this because they know that immediate children are always
		// ThenPromise instances and we can therefore reach into their state to access the
		// _listeners collection.
		//
		// So, what happens is that a Promise will be fulfilled through the _completed or _error
		// messages at which point it will enter a *_notify state and be responsible for to move
		// its children into an (as appropriate) success or error state and also notify that child's
		// listeners of the state transition, until leaf notes are reached.
		//

		var state_created,              // -> working
			state_working,              // -> error | error_notify | success | success_notify | canceled | waiting
			state_waiting,              // -> error | error_notify | success | success_notify | waiting_canceled
			state_waiting_canceled,     // -> error | error_notify | success | success_notify | canceling
			state_canceled,             // -> error | error_notify | success | success_notify | canceling
			state_canceling,            // -> error_notify
			state_success_notify,       // -> success
			state_success,              // -> .
			state_error_notify,         // -> error
			state_error;                // -> .

		// Noop function, used in the various states to indicate that they don't support a given
		// message. Named with the somewhat cute name '_' because it reads really well in the states.

		function _() { }

		// Initial state
		//
		state_created = {
			name: "created",
			enter: function (promise) {
				promise._setState(state_working);
			},
			cancel: _,
			done: _,
			then: _,
			_completed: _,
			_error: _,
			_notify: _,
			_progress: _,
			_setCompleteValue: _,
			_setErrorValue: _
		};

		// Ready state, waiting for a message (completed/error/progress), able to be canceled
		//
		state_working = {
			name: "working",
			enter: _,
			cancel: function (promise) {
				promise._setState(state_canceled);
			},
			done: done,
			then: then,
			_completed: completed,
			_error: error,
			_notify: _,
			_progress: progress,
			_setCompleteValue: setCompleteValue,
			_setErrorValue: setErrorValue
		};

		// Waiting state, if a promise is completed with a value which is itself a promise
		// (has a then() method) it signs up to be informed when that child promise is
		// fulfilled at which point it will be fulfilled with that value.
		//
		state_waiting = {
			name: "waiting",
			enter: function (promise) {
				var waitedUpon = promise._value;
				// We can special case our own intermediate promises which are not in a
				//  terminal state by just pushing this promise as a listener without
				//  having to create new indirection functions
				if (waitedUpon instanceof ThenPromise &&
					waitedUpon._state !== state_error &&
					waitedUpon._state !== state_success) {
					pushListener(waitedUpon, { promise: promise });
				} else {
					var error = function (value) {
						if (waitedUpon._errorId) {
							promise._chainedError(value, waitedUpon);
						} else {
							// Because this is an interop boundary we want to indicate that this
							//  error has been handled by the promise infrastructure before we
							//  begin a new handling chain.
							//
							callonerror(promise, value, detailsForHandledError, waitedUpon, error);
							promise._error(value);
						}
					};
					error.handlesOnError = true;
					waitedUpon.then(
						promise._completed.bind(promise),
						error,
						promise._progress.bind(promise)
					);
				}
			},
			cancel: function (promise) {
				promise._setState(state_waiting_canceled);
			},
			done: done,
			then: then,
			_completed: completed,
			_error: error,
			_notify: _,
			_progress: progress,
			_setCompleteValue: setCompleteValue,
			_setErrorValue: setErrorValue
		};

		// Waiting canceled state, when a promise has been in a waiting state and receives a
		// request to cancel its pending work it will forward that request to the child promise
		// and then waits to be informed of the result. This promise moves itself into the
		// canceling state but understands that the child promise may instead push it to a
		// different state.
		//
		state_waiting_canceled = {
			name: "waiting_canceled",
			enter: function (promise) {
				// Initiate a transition to canceling. Triggering a cancel on the promise
				// that we are waiting upon may result in a different state transition
				// before the state machine pump runs again.
				promise._setState(state_canceling);
				var waitedUpon = promise._value;
				if (waitedUpon.cancel) {
					waitedUpon.cancel();
				}
			},
			cancel: _,
			done: done,
			then: then,
			_completed: completed,
			_error: error,
			_notify: _,
			_progress: progress,
			_setCompleteValue: setCompleteValue,
			_setErrorValue: setErrorValue
		};

		// Canceled state, moves to the canceling state and then tells the promise to do
		// whatever it might need to do on cancelation.
		//
		state_canceled = {
			name: "canceled",
			enter: function (promise) {
				// Initiate a transition to canceling. The _cancelAction may change the state
				// before the state machine pump runs again.
				promise._setState(state_canceling);
				promise._cancelAction();
			},
			cancel: _,
			done: done,
			then: then,
			_completed: completed,
			_error: error,
			_notify: _,
			_progress: progress,
			_setCompleteValue: setCompleteValue,
			_setErrorValue: setErrorValue
		};

		// Canceling state, commits to the promise moving to an error state with an error
		// object whose 'name' and 'message' properties contain the string "Canceled"
		//
		state_canceling = {
			name: "canceling",
			enter: function (promise) {
				var error = new Error(canceledName);
				error.name = error.message;
				promise._value = error;
				promise._setState(state_error_notify);
			},
			cancel: _,
			done: _,
			then: _,
			_completed: _,
			_error: _,
			_notify: _,
			_progress: _,
			_setCompleteValue: _,
			_setErrorValue: _
		};

		// Success notify state, moves a promise to the success state and notifies all children
		//
		state_success_notify = {
			name: "complete_notify",
			enter: function (promise) {
				promise.done = CompletePromise.prototype.done;
				promise.then = CompletePromise.prototype.then;
				if (promise._listeners) {
					var queue = [promise];
					var p;
					while (queue.length) {
						p = queue.shift();
						p._state._notify(p, queue);
					}
				}
				promise._setState(state_success);
			},
			cancel: _,
			done: null, /*error to get here */
			then: null, /*error to get here */
			_completed: _,
			_error: _,
			_notify: notifySuccess,
			_progress: _,
			_setCompleteValue: _,
			_setErrorValue: _
		};

		// Success state, moves a promise to the success state and does NOT notify any children.
		// Some upstream promise is owning the notification pass.
		//
		state_success = {
			name: "success",
			enter: function (promise) {
				promise.done = CompletePromise.prototype.done;
				promise.then = CompletePromise.prototype.then;
				promise._cleanupAction();
			},
			cancel: _,
			done: null, /*error to get here */
			then: null, /*error to get here */
			_completed: _,
			_error: _,
			_notify: notifySuccess,
			_progress: _,
			_setCompleteValue: _,
			_setErrorValue: _
		};

		// Error notify state, moves a promise to the error state and notifies all children
		//
		state_error_notify = {
			name: "error_notify",
			enter: function (promise) {
				promise.done = ErrorPromise.prototype.done;
				promise.then = ErrorPromise.prototype.then;
				if (promise._listeners) {
					var queue = [promise];
					var p;
					while (queue.length) {
						p = queue.shift();
						p._state._notify(p, queue);
					}
				}
				promise._setState(state_error);
			},
			cancel: _,
			done: null, /*error to get here*/
			then: null, /*error to get here*/
			_completed: _,
			_error: _,
			_notify: notifyError,
			_progress: _,
			_setCompleteValue: _,
			_setErrorValue: _
		};

		// Error state, moves a promise to the error state and does NOT notify any children.
		// Some upstream promise is owning the notification pass.
		//
		state_error = {
			name: "error",
			enter: function (promise) {
				promise.done = ErrorPromise.prototype.done;
				promise.then = ErrorPromise.prototype.then;
				promise._cleanupAction();
			},
			cancel: _,
			done: null, /*error to get here*/
			then: null, /*error to get here*/
			_completed: _,
			_error: _,
			_notify: notifyError,
			_progress: _,
			_setCompleteValue: _,
			_setErrorValue: _
		};

		//
		// The statemachine implementation follows a very particular pattern, the states are specified
		// as static stateless bags of functions which are then indirected through the state machine
		// instance (a Promise). As such all of the functions on each state have the promise instance
		// passed to them explicitly as a parameter and the Promise instance members do a little
		// dance where they indirect through the state and insert themselves in the argument list.
		//
		// We could instead call directly through the promise states however then every caller
		// would have to remember to do things like pumping the state machine to catch state transitions.
		//

		var PromiseStateMachine = _Base.Class.define(null, {
			_listeners: null,
			_nextState: null,
			_state: null,
			_value: null,

			cancel: function () {
				/// <signature helpKeyword="WinJS.PromiseStateMachine.cancel">
				/// <summary locid="WinJS.PromiseStateMachine.cancel">
				/// Attempts to cancel the fulfillment of a promised value. If the promise hasn't
				/// already been fulfilled and cancellation is supported, the promise enters
				/// the error state with a value of Error("Canceled").
				/// </summary>
				/// </signature>
				this._state.cancel(this);
				this._run();
			},
			done: function Promise_done(onComplete, onError, onProgress) {
				/// <signature helpKeyword="WinJS.PromiseStateMachine.done">
				/// <summary locid="WinJS.PromiseStateMachine.done">
				/// Allows you to specify the work to be done on the fulfillment of the promised value,
				/// the error handling to be performed if the promise fails to fulfill
				/// a value, and the handling of progress notifications along the way.
				///
				/// After the handlers have finished executing, this function throws any error that would have been returned
				/// from then() as a promise in the error state.
				/// </summary>
				/// <param name='onComplete' type='Function' locid="WinJS.PromiseStateMachine.done_p:onComplete">
				/// The function to be called if the promise is fulfilled successfully with a value.
				/// The fulfilled value is passed as the single argument. If the value is null,
				/// the fulfilled value is returned. The value returned
				/// from the function becomes the fulfilled value of the promise returned by
				/// then(). If an exception is thrown while executing the function, the promise returned
				/// by then() moves into the error state.
				/// </param>
				/// <param name='onError' type='Function' optional='true' locid="WinJS.PromiseStateMachine.done_p:onError">
				/// The function to be called if the promise is fulfilled with an error. The error
				/// is passed as the single argument. If it is null, the error is forwarded.
				/// The value returned from the function is the fulfilled value of the promise returned by then().
				/// </param>
				/// <param name='onProgress' type='Function' optional='true' locid="WinJS.PromiseStateMachine.done_p:onProgress">
				/// the function to be called if the promise reports progress. Data about the progress
				/// is passed as the single argument. Promises are not required to support
				/// progress.
				/// </param>
				/// </signature>
				this._state.done(this, onComplete, onError, onProgress);
			},
			then: function Promise_then(onComplete, onError, onProgress) {
				/// <signature helpKeyword="WinJS.PromiseStateMachine.then">
				/// <summary locid="WinJS.PromiseStateMachine.then">
				/// Allows you to specify the work to be done on the fulfillment of the promised value,
				/// the error handling to be performed if the promise fails to fulfill
				/// a value, and the handling of progress notifications along the way.
				/// </summary>
				/// <param name='onComplete' type='Function' locid="WinJS.PromiseStateMachine.then_p:onComplete">
				/// The function to be called if the promise is fulfilled successfully with a value.
				/// The value is passed as the single argument. If the value is null, the value is returned.
				/// The value returned from the function becomes the fulfilled value of the promise returned by
				/// then(). If an exception is thrown while this function is being executed, the promise returned
				/// by then() moves into the error state.
				/// </param>
				/// <param name='onError' type='Function' optional='true' locid="WinJS.PromiseStateMachine.then_p:onError">
				/// The function to be called if the promise is fulfilled with an error. The error
				/// is passed as the single argument. If it is null, the error is forwarded.
				/// The value returned from the function becomes the fulfilled value of the promise returned by then().
				/// </param>
				/// <param name='onProgress' type='Function' optional='true' locid="WinJS.PromiseStateMachine.then_p:onProgress">
				/// The function to be called if the promise reports progress. Data about the progress
				/// is passed as the single argument. Promises are not required to support
				/// progress.
				/// </param>
				/// <returns type="WinJS.Promise" locid="WinJS.PromiseStateMachine.then_returnValue">
				/// The promise whose value is the result of executing the complete or
				/// error function.
				/// </returns>
				/// </signature>
				return this._state.then(this, onComplete, onError, onProgress);
			},

			_chainedError: function (value, context) {
				var result = this._state._error(this, value, detailsForChainedError, context);
				this._run();
				return result;
			},
			_completed: function (value) {
				var result = this._state._completed(this, value);
				this._run();
				return result;
			},
			_error: function (value) {
				var result = this._state._error(this, value, detailsForError);
				this._run();
				return result;
			},
			_progress: function (value) {
				this._state._progress(this, value);
			},
			_setState: function (state) {
				this._nextState = state;
			},
			_setCompleteValue: function (value) {
				this._state._setCompleteValue(this, value);
				this._run();
			},
			_setChainedErrorValue: function (value, context) {
				var result = this._state._setErrorValue(this, value, detailsForChainedError, context);
				this._run();
				return result;
			},
			_setExceptionValue: function (value) {
				var result = this._state._setErrorValue(this, value, detailsForException);
				this._run();
				return result;
			},
			_run: function () {
				while (this._nextState) {
					this._state = this._nextState;
					this._nextState = null;
					this._state.enter(this);
				}
			}
		}, {
			supportedForProcessing: false
		});

		//
		// Implementations of shared state machine code.
		//

		function completed(promise, value) {
			var targetState;
			if (value && typeof value === "object" && typeof value.then === "function") {
				targetState = state_waiting;
			} else {
				targetState = state_success_notify;
			}
			promise._value = value;
			promise._setState(targetState);
		}
		function createErrorDetails(exception, error, promise, id, parent, handler) {
			return {
				exception: exception,
				error: error,
				promise: promise,
				handler: handler,
				id: id,
				parent: parent
			};
		}
		function detailsForHandledError(promise, errorValue, context, handler) {
			var exception = context._isException;
			var errorId = context._errorId;
			return createErrorDetails(
				exception ? errorValue : null,
				exception ? null : errorValue,
				promise,
				errorId,
				context,
				handler
			);
		}
		function detailsForChainedError(promise, errorValue, context) {
			var exception = context._isException;
			var errorId = context._errorId;
			setErrorInfo(promise, errorId, exception);
			return createErrorDetails(
				exception ? errorValue : null,
				exception ? null : errorValue,
				promise,
				errorId,
				context
			);
		}
		function detailsForError(promise, errorValue) {
			var errorId = ++error_number;
			setErrorInfo(promise, errorId);
			return createErrorDetails(
				null,
				errorValue,
				promise,
				errorId
			);
		}
		function detailsForException(promise, exceptionValue) {
			var errorId = ++error_number;
			setErrorInfo(promise, errorId, true);
			return createErrorDetails(
				exceptionValue,
				null,
				promise,
				errorId
			);
		}
		function done(promise, onComplete, onError, onProgress) {
			var asyncOpID = _Trace._traceAsyncOperationStarting("WinJS.Promise.done");
			pushListener(promise, { c: onComplete, e: onError, p: onProgress, asyncOpID: asyncOpID });
		}
		function error(promise, value, onerrorDetails, context) {
			promise._value = value;
			callonerror(promise, value, onerrorDetails, context);
			promise._setState(state_error_notify);
		}
		function notifySuccess(promise, queue) {
			var value = promise._value;
			var listeners = promise._listeners;
			if (!listeners) {
				return;
			}
			promise._listeners = null;
			var i, len;
			for (i = 0, len = Array.isArray(listeners) ? listeners.length : 1; i < len; i++) {
				var listener = len === 1 ? listeners : listeners[i];
				var onComplete = listener.c;
				var target = listener.promise;

				_Trace._traceAsyncOperationCompleted(listener.asyncOpID, _Global.Debug && _Global.Debug.MS_ASYNC_OP_STATUS_SUCCESS);

				if (target) {
					_Trace._traceAsyncCallbackStarting(listener.asyncOpID);
					try {
						target._setCompleteValue(onComplete ? onComplete(value) : value);
					} catch (ex) {
						target._setExceptionValue(ex);
					} finally {
						_Trace._traceAsyncCallbackCompleted();
					}
					if (target._state !== state_waiting && target._listeners) {
						queue.push(target);
					}
				} else {
					CompletePromise.prototype.done.call(promise, onComplete);
				}
			}
		}
		function notifyError(promise, queue) {
			var value = promise._value;
			var listeners = promise._listeners;
			if (!listeners) {
				return;
			}
			promise._listeners = null;
			var i, len;
			for (i = 0, len = Array.isArray(listeners) ? listeners.length : 1; i < len; i++) {
				var listener = len === 1 ? listeners : listeners[i];
				var onError = listener.e;
				var target = listener.promise;

				var errorID = _Global.Debug && (value && value.name === canceledName ? _Global.Debug.MS_ASYNC_OP_STATUS_CANCELED : _Global.Debug.MS_ASYNC_OP_STATUS_ERROR);
				_Trace._traceAsyncOperationCompleted(listener.asyncOpID, errorID);

				if (target) {
					var asyncCallbackStarted = false;
					try {
						if (onError) {
							_Trace._traceAsyncCallbackStarting(listener.asyncOpID);
							asyncCallbackStarted = true;
							if (!onError.handlesOnError) {
								callonerror(target, value, detailsForHandledError, promise, onError);
							}
							target._setCompleteValue(onError(value));
						} else {
							target._setChainedErrorValue(value, promise);
						}
					} catch (ex) {
						target._setExceptionValue(ex);
					} finally {
						if (asyncCallbackStarted) {
							_Trace._traceAsyncCallbackCompleted();
						}
					}
					if (target._state !== state_waiting && target._listeners) {
						queue.push(target);
					}
				} else {
					ErrorPromise.prototype.done.call(promise, null, onError);
				}
			}
		}
		function callonerror(promise, value, onerrorDetailsGenerator, context, handler) {
			if (promiseEventListeners._listeners[errorET]) {
				if (value instanceof Error && value.message === canceledName) {
					return;
				}
				promiseEventListeners.dispatchEvent(errorET, onerrorDetailsGenerator(promise, value, context, handler));
			}
		}
		function progress(promise, value) {
			var listeners = promise._listeners;
			if (listeners) {
				var i, len;
				for (i = 0, len = Array.isArray(listeners) ? listeners.length : 1; i < len; i++) {
					var listener = len === 1 ? listeners : listeners[i];
					var onProgress = listener.p;
					if (onProgress) {
						try { onProgress(value); } catch (ex) { }
					}
					if (!(listener.c || listener.e) && listener.promise) {
						listener.promise._progress(value);
					}
				}
			}
		}
		function pushListener(promise, listener) {
			var listeners = promise._listeners;
			if (listeners) {
				// We may have either a single listener (which will never be wrapped in an array)
				// or 2+ listeners (which will be wrapped). Since we are now adding one more listener
				// we may have to wrap the single listener before adding the second.
				listeners = Array.isArray(listeners) ? listeners : [listeners];
				listeners.push(listener);
			} else {
				listeners = listener;
			}
			promise._listeners = listeners;
		}
		// The difference beween setCompleteValue()/setErrorValue() and complete()/error() is that setXXXValue() moves
		// a promise directly to the success/error state without starting another notification pass (because one
		// is already ongoing).
		function setErrorInfo(promise, errorId, isException) {
			promise._isException = isException || false;
			promise._errorId = errorId;
		}
		function setErrorValue(promise, value, onerrorDetails, context) {
			promise._value = value;
			callonerror(promise, value, onerrorDetails, context);
			promise._setState(state_error);
		}
		function setCompleteValue(promise, value) {
			var targetState;
			if (value && typeof value === "object" && typeof value.then === "function") {
				targetState = state_waiting;
			} else {
				targetState = state_success;
			}
			promise._value = value;
			promise._setState(targetState);
		}
		function then(promise, onComplete, onError, onProgress) {
			var result = new ThenPromise(promise);
			var asyncOpID = _Trace._traceAsyncOperationStarting("WinJS.Promise.then");
			pushListener(promise, { promise: result, c: onComplete, e: onError, p: onProgress, asyncOpID: asyncOpID });
			return result;
		}

		//
		// Internal implementation detail promise, ThenPromise is created when a promise needs
		// to be returned from a then() method.
		//
		var ThenPromise = _Base.Class.derive(PromiseStateMachine,
			function (creator) {

				if (tagWithStack && (tagWithStack === true || (tagWithStack & tag.thenPromise))) {
					this._stack = Promise._getStack();
				}

				this._creator = creator;
				this._setState(state_created);
				this._run();
			}, {
				_creator: null,

				_cancelAction: function () { if (this._creator) { this._creator.cancel(); } },
				_cleanupAction: function () { this._creator = null; }
			}, {
				supportedForProcessing: false
			}
		);

		//
		// Slim promise implementations for already completed promises, these are created
		// under the hood on synchronous completion paths as well as by WinJS.Promise.wrap
		// and WinJS.Promise.wrapError.
		//

		var ErrorPromise = _Base.Class.define(
			function ErrorPromise_ctor(value) {

				if (tagWithStack && (tagWithStack === true || (tagWithStack & tag.errorPromise))) {
					this._stack = Promise._getStack();
				}

				this._value = value;
				callonerror(this, value, detailsForError);
			}, {
				cancel: function () {
					/// <signature helpKeyword="WinJS.PromiseStateMachine.cancel">
					/// <summary locid="WinJS.PromiseStateMachine.cancel">
					/// Attempts to cancel the fulfillment of a promised value. If the promise hasn't
					/// already been fulfilled and cancellation is supported, the promise enters
					/// the error state with a value of Error("Canceled").
					/// </summary>
					/// </signature>
				},
				done: function ErrorPromise_done(unused, onError) {
					/// <signature helpKeyword="WinJS.PromiseStateMachine.done">
					/// <summary locid="WinJS.PromiseStateMachine.done">
					/// Allows you to specify the work to be done on the fulfillment of the promised value,
					/// the error handling to be performed if the promise fails to fulfill
					/// a value, and the handling of progress notifications along the way.
					///
					/// After the handlers have finished executing, this function throws any error that would have been returned
					/// from then() as a promise in the error state.
					/// </summary>
					/// <param name='onComplete' type='Function' locid="WinJS.PromiseStateMachine.done_p:onComplete">
					/// The function to be called if the promise is fulfilled successfully with a value.
					/// The fulfilled value is passed as the single argument. If the value is null,
					/// the fulfilled value is returned. The value returned
					/// from the function becomes the fulfilled value of the promise returned by
					/// then(). If an exception is thrown while executing the function, the promise returned
					/// by then() moves into the error state.
					/// </param>
					/// <param name='onError' type='Function' optional='true' locid="WinJS.PromiseStateMachine.done_p:onError">
					/// The function to be called if the promise is fulfilled with an error. The error
					/// is passed as the single argument. If it is null, the error is forwarded.
					/// The value returned from the function is the fulfilled value of the promise returned by then().
					/// </param>
					/// <param name='onProgress' type='Function' optional='true' locid="WinJS.PromiseStateMachine.done_p:onProgress">
					/// the function to be called if the promise reports progress. Data about the progress
					/// is passed as the single argument. Promises are not required to support
					/// progress.
					/// </param>
					/// </signature>
					var value = this._value;
					if (onError) {
						try {
							if (!onError.handlesOnError) {
								callonerror(null, value, detailsForHandledError, this, onError);
							}
							var result = onError(value);
							if (result && typeof result === "object" && typeof result.done === "function") {
								// If a promise is returned we need to wait on it.
								result.done();
							}
							return;
						} catch (ex) {
							value = ex;
						}
					}
					if (value instanceof Error && value.message === canceledName) {
						// suppress cancel
						return;
					}
					// force the exception to be thrown asyncronously to avoid any try/catch blocks
					//
					Promise._doneHandler(value);
				},
				then: function ErrorPromise_then(unused, onError) {
					/// <signature helpKeyword="WinJS.PromiseStateMachine.then">
					/// <summary locid="WinJS.PromiseStateMachine.then">
					/// Allows you to specify the work to be done on the fulfillment of the promised value,
					/// the error handling to be performed if the promise fails to fulfill
					/// a value, and the handling of progress notifications along the way.
					/// </summary>
					/// <param name='onComplete' type='Function' locid="WinJS.PromiseStateMachine.then_p:onComplete">
					/// The function to be called if the promise is fulfilled successfully with a value.
					/// The value is passed as the single argument. If the value is null, the value is returned.
					/// The value returned from the function becomes the fulfilled value of the promise returned by
					/// then(). If an exception is thrown while this function is being executed, the promise returned
					/// by then() moves into the error state.
					/// </param>
					/// <param name='onError' type='Function' optional='true' locid="WinJS.PromiseStateMachine.then_p:onError">
					/// The function to be called if the promise is fulfilled with an error. The error
					/// is passed as the single argument. If it is null, the error is forwarded.
					/// The value returned from the function becomes the fulfilled value of the promise returned by then().
					/// </param>
					/// <param name='onProgress' type='Function' optional='true' locid="WinJS.PromiseStateMachine.then_p:onProgress">
					/// The function to be called if the promise reports progress. Data about the progress
					/// is passed as the single argument. Promises are not required to support
					/// progress.
					/// </param>
					/// <returns type="WinJS.Promise" locid="WinJS.PromiseStateMachine.then_returnValue">
					/// The promise whose value is the result of executing the complete or
					/// error function.
					/// </returns>
					/// </signature>

					// If the promise is already in a error state and no error handler is provided
					// we optimize by simply returning the promise instead of creating a new one.
					//
					if (!onError) { return this; }
					var result;
					var value = this._value;
					try {
						if (!onError.handlesOnError) {
							callonerror(null, value, detailsForHandledError, this, onError);
						}
						result = new CompletePromise(onError(value));
					} catch (ex) {
						// If the value throw from the error handler is the same as the value
						// provided to the error handler then there is no need for a new promise.
						//
						if (ex === value) {
							result = this;
						} else {
							result = new ExceptionPromise(ex);
						}
					}
					return result;
				}
			}, {
				supportedForProcessing: false
			}
		);

		var ExceptionPromise = _Base.Class.derive(ErrorPromise,
			function ExceptionPromise_ctor(value) {

				if (tagWithStack && (tagWithStack === true || (tagWithStack & tag.exceptionPromise))) {
					this._stack = Promise._getStack();
				}

				this._value = value;
				callonerror(this, value, detailsForException);
			}, {
				/* empty */
			}, {
				supportedForProcessing: false
			}
		);

		var CompletePromise = _Base.Class.define(
			function CompletePromise_ctor(value) {

				if (tagWithStack && (tagWithStack === true || (tagWithStack & tag.completePromise))) {
					this._stack = Promise._getStack();
				}

				if (value && typeof value === "object" && typeof value.then === "function") {
					var result = new ThenPromise(null);
					result._setCompleteValue(value);
					return result;
				}
				this._value = value;
			}, {
				cancel: function () {
					/// <signature helpKeyword="WinJS.PromiseStateMachine.cancel">
					/// <summary locid="WinJS.PromiseStateMachine.cancel">
					/// Attempts to cancel the fulfillment of a promised value. If the promise hasn't
					/// already been fulfilled and cancellation is supported, the promise enters
					/// the error state with a value of Error("Canceled").
					/// </summary>
					/// </signature>
				},
				done: function CompletePromise_done(onComplete) {
					/// <signature helpKeyword="WinJS.PromiseStateMachine.done">
					/// <summary locid="WinJS.PromiseStateMachine.done">
					/// Allows you to specify the work to be done on the fulfillment of the promised value,
					/// the error handling to be performed if the promise fails to fulfill
					/// a value, and the handling of progress notifications along the way.
					///
					/// After the handlers have finished executing, this function throws any error that would have been returned
					/// from then() as a promise in the error state.
					/// </summary>
					/// <param name='onComplete' type='Function' locid="WinJS.PromiseStateMachine.done_p:onComplete">
					/// The function to be called if the promise is fulfilled successfully with a value.
					/// The fulfilled value is passed as the single argument. If the value is null,
					/// the fulfilled value is returned. The value returned
					/// from the function becomes the fulfilled value of the promise returned by
					/// then(). If an exception is thrown while executing the function, the promise returned
					/// by then() moves into the error state.
					/// </param>
					/// <param name='onError' type='Function' optional='true' locid="WinJS.PromiseStateMachine.done_p:onError">
					/// The function to be called if the promise is fulfilled with an error. The error
					/// is passed as the single argument. If it is null, the error is forwarded.
					/// The value returned from the function is the fulfilled value of the promise returned by then().
					/// </param>
					/// <param name='onProgress' type='Function' optional='true' locid="WinJS.PromiseStateMachine.done_p:onProgress">
					/// the function to be called if the promise reports progress. Data about the progress
					/// is passed as the single argument. Promises are not required to support
					/// progress.
					/// </param>
					/// </signature>
					if (!onComplete) { return; }
					try {
						var result = onComplete(this._value);
						if (result && typeof result === "object" && typeof result.done === "function") {
							result.done();
						}
					} catch (ex) {
						// force the exception to be thrown asynchronously to avoid any try/catch blocks
						Promise._doneHandler(ex);
					}
				},
				then: function CompletePromise_then(onComplete) {
					/// <signature helpKeyword="WinJS.PromiseStateMachine.then">
					/// <summary locid="WinJS.PromiseStateMachine.then">
					/// Allows you to specify the work to be done on the fulfillment of the promised value,
					/// the error handling to be performed if the promise fails to fulfill
					/// a value, and the handling of progress notifications along the way.
					/// </summary>
					/// <param name='onComplete' type='Function' locid="WinJS.PromiseStateMachine.then_p:onComplete">
					/// The function to be called if the promise is fulfilled successfully with a value.
					/// The value is passed as the single argument. If the value is null, the value is returned.
					/// The value returned from the function becomes the fulfilled value of the promise returned by
					/// then(). If an exception is thrown while this function is being executed, the promise returned
					/// by then() moves into the error state.
					/// </param>
					/// <param name='onError' type='Function' optional='true' locid="WinJS.PromiseStateMachine.then_p:onError">
					/// The function to be called if the promise is fulfilled with an error. The error
					/// is passed as the single argument. If it is null, the error is forwarded.
					/// The value returned from the function becomes the fulfilled value of the promise returned by then().
					/// </param>
					/// <param name='onProgress' type='Function' optional='true' locid="WinJS.PromiseStateMachine.then_p:onProgress">
					/// The function to be called if the promise reports progress. Data about the progress
					/// is passed as the single argument. Promises are not required to support
					/// progress.
					/// </param>
					/// <returns type="WinJS.Promise" locid="WinJS.PromiseStateMachine.then_returnValue">
					/// The promise whose value is the result of executing the complete or
					/// error function.
					/// </returns>
					/// </signature>
					try {
						// If the value returned from the completion handler is the same as the value
						// provided to the completion handler then there is no need for a new promise.
						//
						var newValue = onComplete ? onComplete(this._value) : this._value;
						return newValue === this._value ? this : new CompletePromise(newValue);
					} catch (ex) {
						return new ExceptionPromise(ex);
					}
				}
			}, {
				supportedForProcessing: false
			}
		);

		//
		// Promise is the user-creatable WinJS.Promise object.
		//

		function timeout(timeoutMS) {
			var id;
			return new Promise(
				function (c) {
					if (timeoutMS) {
						id = _Global.setTimeout(c, timeoutMS);
					} else {
						_BaseCoreUtils._setImmediate(c);
					}
				},
				function () {
					if (id) {
						_Global.clearTimeout(id);
					}
				}
			);
		}

		function timeoutWithPromise(timeout, promise) {
			var cancelPromise = function () { promise.cancel(); };
			var cancelTimeout = function () { timeout.cancel(); };
			timeout.then(cancelPromise);
			promise.then(cancelTimeout, cancelTimeout);
			return promise;
		}

		var staticCanceledPromise;

		var Promise = _Base.Class.derive(PromiseStateMachine,
			function Promise_ctor(init, oncancel) {
				/// <signature helpKeyword="WinJS.Promise">
				/// <summary locid="WinJS.Promise">
				/// A promise provides a mechanism to schedule work to be done on a value that
				/// has not yet been computed. It is a convenient abstraction for managing
				/// interactions with asynchronous APIs.
				/// </summary>
				/// <param name="init" type="Function" locid="WinJS.Promise_p:init">
				/// The function that is called during construction of the  promise. The function
				/// is given three arguments (complete, error, progress). Inside this function
				/// you should add event listeners for the notifications supported by this value.
				/// </param>
				/// <param name="oncancel" optional="true" locid="WinJS.Promise_p:oncancel">
				/// The function to call if a consumer of this promise wants
				/// to cancel its undone work. Promises are not required to
				/// support cancellation.
				/// </param>
				/// </signature>

				if (tagWithStack && (tagWithStack === true || (tagWithStack & tag.promise))) {
					this._stack = Promise._getStack();
				}

				this._oncancel = oncancel;
				this._setState(state_created);
				this._run();

				try {
					var complete = this._completed.bind(this);
					var error = this._error.bind(this);
					var progress = this._progress.bind(this);
					init(complete, error, progress);
				} catch (ex) {
					this._setExceptionValue(ex);
				}
			}, {
				_oncancel: null,

				_cancelAction: function () {
					// BEGIN monaco change
					try {
						if (this._oncancel) {
							this._oncancel();
						} else {
							throw new Error('Promise did not implement oncancel');
						}
					} catch (ex) {
						// Access fields to get them created
						var msg = ex.message;
						var stack = ex.stack;
						promiseEventListeners.dispatchEvent('error', ex);
					}
					// END monaco change
				},
				_cleanupAction: function () { this._oncancel = null; }
			}, {

				addEventListener: function Promise_addEventListener(eventType, listener, capture) {
					/// <signature helpKeyword="WinJS.Promise.addEventListener">
					/// <summary locid="WinJS.Promise.addEventListener">
					/// Adds an event listener to the control.
					/// </summary>
					/// <param name="eventType" locid="WinJS.Promise.addEventListener_p:eventType">
					/// The type (name) of the event.
					/// </param>
					/// <param name="listener" locid="WinJS.Promise.addEventListener_p:listener">
					/// The listener to invoke when the event is raised.
					/// </param>
					/// <param name="capture" locid="WinJS.Promise.addEventListener_p:capture">
					/// Specifies whether or not to initiate capture.
					/// </param>
					/// </signature>
					promiseEventListeners.addEventListener(eventType, listener, capture);
				},
				any: function Promise_any(values) {
					/// <signature helpKeyword="WinJS.Promise.any">
					/// <summary locid="WinJS.Promise.any">
					/// Returns a promise that is fulfilled when one of the input promises
					/// has been fulfilled.
					/// </summary>
					/// <param name="values" type="Array" locid="WinJS.Promise.any_p:values">
					/// An array that contains promise objects or objects whose property
					/// values include promise objects.
					/// </param>
					/// <returns type="WinJS.Promise" locid="WinJS.Promise.any_returnValue">
					/// A promise that on fulfillment yields the value of the input (complete or error).
					/// </returns>
					/// </signature>
					return new Promise(
						function (complete, error) {
							var keys = Object.keys(values);
							if (keys.length === 0) {
								complete();
							}
							var canceled = 0;
							keys.forEach(function (key) {
								Promise.as(values[key]).then(
									function () { complete({ key: key, value: values[key] }); },
									function (e) {
										if (e instanceof Error && e.name === canceledName) {
											if ((++canceled) === keys.length) {
												complete(Promise.cancel);
											}
											return;
										}
										error({ key: key, value: values[key] });
									}
								);
							});
						},
						function () {
							var keys = Object.keys(values);
							keys.forEach(function (key) {
								var promise = Promise.as(values[key]);
								if (typeof promise.cancel === "function") {
									promise.cancel();
								}
							});
						}
					);
				},
				as: function Promise_as(value) {
					/// <signature helpKeyword="WinJS.Promise.as">
					/// <summary locid="WinJS.Promise.as">
					/// Returns a promise. If the object is already a promise it is returned;
					/// otherwise the object is wrapped in a promise.
					/// </summary>
					/// <param name="value" locid="WinJS.Promise.as_p:value">
					/// The value to be treated as a promise.
					/// </param>
					/// <returns type="WinJS.Promise" locid="WinJS.Promise.as_returnValue">
					/// A promise.
					/// </returns>
					/// </signature>
					if (value && typeof value === "object" && typeof value.then === "function") {
						return value;
					}
					return new CompletePromise(value);
				},
				/// <field type="WinJS.Promise" helpKeyword="WinJS.Promise.cancel" locid="WinJS.Promise.cancel">
				/// Canceled promise value, can be returned from a promise completion handler
				/// to indicate cancelation of the promise chain.
				/// </field>
				cancel: {
					get: function () {
						return (staticCanceledPromise = staticCanceledPromise || new ErrorPromise(new _ErrorFromName(canceledName)));
					}
				},
				dispatchEvent: function Promise_dispatchEvent(eventType, details) {
					/// <signature helpKeyword="WinJS.Promise.dispatchEvent">
					/// <summary locid="WinJS.Promise.dispatchEvent">
					/// Raises an event of the specified type and properties.
					/// </summary>
					/// <param name="eventType" locid="WinJS.Promise.dispatchEvent_p:eventType">
					/// The type (name) of the event.
					/// </param>
					/// <param name="details" locid="WinJS.Promise.dispatchEvent_p:details">
					/// The set of additional properties to be attached to the event object.
					/// </param>
					/// <returns type="Boolean" locid="WinJS.Promise.dispatchEvent_returnValue">
					/// Specifies whether preventDefault was called on the event.
					/// </returns>
					/// </signature>
					return promiseEventListeners.dispatchEvent(eventType, details);
				},
				is: function Promise_is(value) {
					/// <signature helpKeyword="WinJS.Promise.is">
					/// <summary locid="WinJS.Promise.is">
					/// Determines whether a value fulfills the promise contract.
					/// </summary>
					/// <param name="value" locid="WinJS.Promise.is_p:value">
					/// A value that may be a promise.
					/// </param>
					/// <returns type="Boolean" locid="WinJS.Promise.is_returnValue">
					/// true if the specified value is a promise, otherwise false.
					/// </returns>
					/// </signature>
					return value && typeof value === "object" && typeof value.then === "function";
				},
				join: function Promise_join(values) {
					/// <signature helpKeyword="WinJS.Promise.join">
					/// <summary locid="WinJS.Promise.join">
					/// Creates a promise that is fulfilled when all the values are fulfilled.
					/// </summary>
					/// <param name="values" type="Object" locid="WinJS.Promise.join_p:values">
					/// An object whose fields contain values, some of which may be promises.
					/// </param>
					/// <returns type="WinJS.Promise" locid="WinJS.Promise.join_returnValue">
					/// A promise whose value is an object with the same field names as those of the object in the values parameter, where
					/// each field value is the fulfilled value of a promise.
					/// </returns>
					/// </signature>
					return new Promise(
						function (complete, error, progress) {
							var keys = Object.keys(values);
							var errors = Array.isArray(values) ? [] : {};
							var results = Array.isArray(values) ? [] : {};
							var undefineds = 0;
							var pending = keys.length;
							var argDone = function (key) {
								if ((--pending) === 0) {
									var errorCount = Object.keys(errors).length;
									if (errorCount === 0) {
										complete(results);
									} else {
										var canceledCount = 0;
										keys.forEach(function (key) {
											var e = errors[key];
											if (e instanceof Error && e.name === canceledName) {
												canceledCount++;
											}
										});
										if (canceledCount === errorCount) {
											complete(Promise.cancel);
										} else {
											error(errors);
										}
									}
								} else {
									progress({ Key: key, Done: true });
								}
							};
							keys.forEach(function (key) {
								var value = values[key];
								if (value === undefined) {
									undefineds++;
								} else {
									Promise.then(value,
										function (value) { results[key] = value; argDone(key); },
										function (value) { errors[key] = value; argDone(key); }
									);
								}
							});
							pending -= undefineds;
							if (pending === 0) {
								complete(results);
								return;
							}
						},
						function () {
							Object.keys(values).forEach(function (key) {
								var promise = Promise.as(values[key]);
								if (typeof promise.cancel === "function") {
									promise.cancel();
								}
							});
						}
					);
				},
				removeEventListener: function Promise_removeEventListener(eventType, listener, capture) {
					/// <signature helpKeyword="WinJS.Promise.removeEventListener">
					/// <summary locid="WinJS.Promise.removeEventListener">
					/// Removes an event listener from the control.
					/// </summary>
					/// <param name='eventType' locid="WinJS.Promise.removeEventListener_eventType">
					/// The type (name) of the event.
					/// </param>
					/// <param name='listener' locid="WinJS.Promise.removeEventListener_listener">
					/// The listener to remove.
					/// </param>
					/// <param name='capture' locid="WinJS.Promise.removeEventListener_capture">
					/// Specifies whether or not to initiate capture.
					/// </param>
					/// </signature>
					promiseEventListeners.removeEventListener(eventType, listener, capture);
				},
				supportedForProcessing: false,
				then: function Promise_then(value, onComplete, onError, onProgress) {
					/// <signature helpKeyword="WinJS.Promise.then">
					/// <summary locid="WinJS.Promise.then">
					/// A static version of the promise instance method then().
					/// </summary>
					/// <param name="value" locid="WinJS.Promise.then_p:value">
					/// the value to be treated as a promise.
					/// </param>
					/// <param name="onComplete" type="Function" locid="WinJS.Promise.then_p:complete">
					/// The function to be called if the promise is fulfilled with a value.
					/// If it is null, the promise simply
					/// returns the value. The value is passed as the single argument.
					/// </param>
					/// <param name="onError" type="Function" optional="true" locid="WinJS.Promise.then_p:error">
					/// The function to be called if the promise is fulfilled with an error. The error
					/// is passed as the single argument.
					/// </param>
					/// <param name="onProgress" type="Function" optional="true" locid="WinJS.Promise.then_p:progress">
					/// The function to be called if the promise reports progress. Data about the progress
					/// is passed as the single argument. Promises are not required to support
					/// progress.
					/// </param>
					/// <returns type="WinJS.Promise" locid="WinJS.Promise.then_returnValue">
					/// A promise whose value is the result of executing the provided complete function.
					/// </returns>
					/// </signature>
					return Promise.as(value).then(onComplete, onError, onProgress);
				},
				thenEach: function Promise_thenEach(values, onComplete, onError, onProgress) {
					/// <signature helpKeyword="WinJS.Promise.thenEach">
					/// <summary locid="WinJS.Promise.thenEach">
					/// Performs an operation on all the input promises and returns a promise
					/// that has the shape of the input and contains the result of the operation
					/// that has been performed on each input.
					/// </summary>
					/// <param name="values" locid="WinJS.Promise.thenEach_p:values">
					/// A set of values (which could be either an array or an object) of which some or all are promises.
					/// </param>
					/// <param name="onComplete" type="Function" locid="WinJS.Promise.thenEach_p:complete">
					/// The function to be called if the promise is fulfilled with a value.
					/// If the value is null, the promise returns the value.
					/// The value is passed as the single argument.
					/// </param>
					/// <param name="onError" type="Function" optional="true" locid="WinJS.Promise.thenEach_p:error">
					/// The function to be called if the promise is fulfilled with an error. The error
					/// is passed as the single argument.
					/// </param>
					/// <param name="onProgress" type="Function" optional="true" locid="WinJS.Promise.thenEach_p:progress">
					/// The function to be called if the promise reports progress. Data about the progress
					/// is passed as the single argument. Promises are not required to support
					/// progress.
					/// </param>
					/// <returns type="WinJS.Promise" locid="WinJS.Promise.thenEach_returnValue">
					/// A promise that is the result of calling Promise.join on the values parameter.
					/// </returns>
					/// </signature>
					var result = Array.isArray(values) ? [] : {};
					Object.keys(values).forEach(function (key) {
						result[key] = Promise.as(values[key]).then(onComplete, onError, onProgress);
					});
					return Promise.join(result);
				},
				timeout: function Promise_timeout(time, promise) {
					/// <signature helpKeyword="WinJS.Promise.timeout">
					/// <summary locid="WinJS.Promise.timeout">
					/// Creates a promise that is fulfilled after a timeout.
					/// </summary>
					/// <param name="timeout" type="Number" optional="true" locid="WinJS.Promise.timeout_p:timeout">
					/// The timeout period in milliseconds. If this value is zero or not specified
					/// setImmediate is called, otherwise setTimeout is called.
					/// </param>
					/// <param name="promise" type="Promise" optional="true" locid="WinJS.Promise.timeout_p:promise">
					/// A promise that will be canceled if it doesn't complete before the
					/// timeout has expired.
					/// </param>
					/// <returns type="WinJS.Promise" locid="WinJS.Promise.timeout_returnValue">
					/// A promise that is completed asynchronously after the specified timeout.
					/// </returns>
					/// </signature>
					var to = timeout(time);
					return promise ? timeoutWithPromise(to, promise) : to;
				},
				wrap: function Promise_wrap(value) {
					/// <signature helpKeyword="WinJS.Promise.wrap">
					/// <summary locid="WinJS.Promise.wrap">
					/// Wraps a non-promise value in a promise. You can use this function if you need
					/// to pass a value to a function that requires a promise.
					/// </summary>
					/// <param name="value" locid="WinJS.Promise.wrap_p:value">
					/// Some non-promise value to be wrapped in a promise.
					/// </param>
					/// <returns type="WinJS.Promise" locid="WinJS.Promise.wrap_returnValue">
					/// A promise that is successfully fulfilled with the specified value
					/// </returns>
					/// </signature>
					return new CompletePromise(value);
				},
				wrapError: function Promise_wrapError(error) {
					/// <signature helpKeyword="WinJS.Promise.wrapError">
					/// <summary locid="WinJS.Promise.wrapError">
					/// Wraps a non-promise error value in a promise. You can use this function if you need
					/// to pass an error to a function that requires a promise.
					/// </summary>
					/// <param name="error" locid="WinJS.Promise.wrapError_p:error">
					/// A non-promise error value to be wrapped in a promise.
					/// </param>
					/// <returns type="WinJS.Promise" locid="WinJS.Promise.wrapError_returnValue">
					/// A promise that is in an error state with the specified value.
					/// </returns>
					/// </signature>
					return new ErrorPromise(error);
				},

				_veryExpensiveTagWithStack: {
					get: function () { return tagWithStack; },
					set: function (value) { tagWithStack = value; }
				},
				_veryExpensiveTagWithStack_tag: tag,
				_getStack: function () {
					if (_Global.Debug && _Global.Debug.debuggerEnabled) {
						try { throw new Error(); } catch (e) { return e.stack; }
					}
				},

				_cancelBlocker: function Promise__cancelBlocker(input, oncancel) {
					//
					// Returns a promise which on cancelation will still result in downstream cancelation while
					//  protecting the promise 'input' from being  canceled which has the effect of allowing
					//  'input' to be shared amoung various consumers.
					//
					if (!Promise.is(input)) {
						return Promise.wrap(input);
					}
					var complete;
					var error;
					var output = new Promise(
						function (c, e) {
							complete = c;
							error = e;
						},
						function () {
							complete = null;
							error = null;
							oncancel && oncancel();
						}
					);
					input.then(
						function (v) { complete && complete(v); },
						function (e) { error && error(e); }
					);
					return output;
				},

			}
		);
		Object.defineProperties(Promise, _Events.createEventProperties(errorET));

		Promise._doneHandler = function (value) {
			_BaseCoreUtils._setImmediate(function Promise_done_rethrow() {
				throw value;
			});
		};

		return {
			PromiseStateMachine: PromiseStateMachine,
			Promise: Promise,
			state_created: state_created
		};
	});

	_winjs("WinJS/Promise", ["WinJS/Core/_Base","WinJS/Promise/_StateMachine"], function promiseInit( _Base, _StateMachine) {
		_Base.Namespace.define("WinJS", {
			Promise: _StateMachine.Promise
		});

		return _StateMachine.Promise;
	});

	var exported = _modules["WinJS/Core/_WinJS"];
	return exported;
})();

var Promise$1 = win.Promise;
var TPromise = win.Promise;
var PPromise = win.Promise;

let outstandingPromiseErrors = {};
function promiseErrorHandler(e) {
    const details = e.detail;
    const id = details.id;
    if (details.parent) {
        if (details.handler && outstandingPromiseErrors) {
            delete outstandingPromiseErrors[id];
        }
        return;
    }
    outstandingPromiseErrors[id] = details;
    if (Object.keys(outstandingPromiseErrors).length === 1) {
        setTimeout(function () {
            const errors = outstandingPromiseErrors;
            outstandingPromiseErrors = {};
            Object.keys(errors).forEach(function (errorId) {
                const error = errors[errorId];
                if (error.exception) {
                    onUnexpectedError(error.exception);
                }
                else if (error.error) {
                    onUnexpectedError(error.error);
                }
                console.log('WARNING: Promise with no error callback:' + error.id);
                console.log(error);
                if (error.exception) {
                    console.log(error.exception.stack);
                }
            });
        }, 0);
    }
}
TPromise.addEventListener('error', promiseErrorHandler);
class ErrorHandler {
    constructor() {
        this.listeners = [];
        this.unexpectedErrorHandler = function (e) {
            setTimeout$1(() => {
                if (e.stack) {
                    throw new Error(e.message + '\n\n' + e.stack);
                }
                throw e;
            }, 0);
        };
    }
    addListener(listener) {
        this.listeners.push(listener);
        return () => {
            this._removeListener(listener);
        };
    }
    emit(e) {
        this.listeners.forEach((listener) => {
            listener(e);
        });
    }
    _removeListener(listener) {
        this.listeners.splice(this.listeners.indexOf(listener), 1);
    }
    setUnexpectedErrorHandler(newUnexpectedErrorHandler) {
        this.unexpectedErrorHandler = newUnexpectedErrorHandler;
    }
    getUnexpectedErrorHandler() {
        return this.unexpectedErrorHandler;
    }
    onUnexpectedError(e) {
        this.unexpectedErrorHandler(e);
        this.emit(e);
    }
    onUnexpectedExternalError(e) {
        this.unexpectedErrorHandler(e);
    }
}
const errorHandler = new ErrorHandler();

function onUnexpectedError(e) {
    if (!isPromiseCanceledError(e)) {
        errorHandler.onUnexpectedError(e);
    }
    return undefined;
}



const canceledName = 'Canceled';
function isPromiseCanceledError(error) {
    return error instanceof Error && error.name === canceledName && error.message === canceledName;
}

class Node {
    constructor(element) {
        this.element = element;
    }
}
class LinkedList {
    isEmpty() {
        return !this._first;
    }
    unshift(element) {
        return this.insert(element, false);
    }
    push(element) {
        return this.insert(element, true);
    }
    insert(element, atTheEnd) {
        const newNode = new Node(element);
        if (!this._first) {
            this._first = newNode;
            this._last = newNode;
        }
        else if (atTheEnd) {
            const oldLast = this._last;
            this._last = newNode;
            newNode.prev = oldLast;
            oldLast.next = newNode;
        }
        else {
            const oldFirst = this._first;
            this._first = newNode;
            newNode.next = oldFirst;
            oldFirst.prev = newNode;
        }
        return () => {
            for (let candidate = this._first; candidate instanceof Node; candidate = candidate.next) {
                if (candidate !== newNode) {
                    continue;
                }
                if (candidate.prev && candidate.next) {
                    let anchor = candidate.prev;
                    anchor.next = candidate.next;
                    candidate.next.prev = anchor;
                }
                else if (!candidate.prev && !candidate.next) {
                    this._first = undefined;
                    this._last = undefined;
                }
                else if (!candidate.next) {
                    this._last = this._last.prev;
                    this._last.next = undefined;
                }
                else if (!candidate.prev) {
                    this._first = this._first.next;
                    this._first.prev = undefined;
                }
                break;
            }
        };
    }
    iterator() {
        let _done;
        let _value;
        let element = {
            get done() { return _done; },
            get value() { return _value; }
        };
        let node = this._first;
        return {
            next() {
                if (!node) {
                    _done = true;
                    _value = undefined;
                }
                else {
                    _done = false;
                    _value = node.element;
                    node = node.next;
                }
                return element;
            }
        };
    }
    toArray() {
        let result = [];
        for (let node = this._first; node instanceof Node; node = node.next) {
            result.push(node.element);
        }
        return result;
    }
}

class CallbackList {
    add(callback, context = null, bucket) {
        if (!this._callbacks) {
            this._callbacks = new LinkedList();
        }
        const remove = this._callbacks.push([callback, context]);
        if (Array.isArray(bucket)) {
            bucket.push({ dispose: remove });
        }
        return remove;
    }
    invoke(...args) {
        if (!this._callbacks) {
            return undefined;
        }
        const ret = [];
        const elements = this._callbacks.toArray();
        for (const [callback, context] of elements) {
            try {
                ret.push(callback.apply(context, args));
            }
            catch (e) {
                onUnexpectedError(e);
            }
        }
        return ret;
    }
    entries() {
        if (!this._callbacks) {
            return [];
        }
        return this._callbacks
            ? this._callbacks.toArray()
            : [];
    }
    isEmpty() {
        return !this._callbacks || this._callbacks.isEmpty();
    }
    dispose() {
        this._callbacks = undefined;
    }
}

var Event;
(function (Event) {
    const _disposable = { dispose() { } };
    Event.None = function () { return _disposable; };
})(Event || (Event = {}));
class Emitter {
    constructor(_options) {
        this._options = _options;
    }
    get event() {
        if (!this._event) {
            this._event = (listener, thisArgs, disposables) => {
                if (!this._callbacks) {
                    this._callbacks = new CallbackList();
                }
                const firstListener = this._callbacks.isEmpty();
                if (firstListener && this._options && this._options.onFirstListenerAdd) {
                    this._options.onFirstListenerAdd(this);
                }
                const remove = this._callbacks.add(listener, thisArgs);
                if (firstListener && this._options && this._options.onFirstListenerDidAdd) {
                    this._options.onFirstListenerDidAdd(this);
                }
                if (this._options && this._options.onListenerDidAdd) {
                    this._options.onListenerDidAdd(this, listener, thisArgs);
                }
                let result;
                result = {
                    dispose: () => {
                        result.dispose = Emitter._noop;
                        if (!this._disposed) {
                            remove();
                            if (this._options && this._options.onLastListenerRemove && this._callbacks.isEmpty()) {
                                this._options.onLastListenerRemove(this);
                            }
                        }
                    }
                };
                if (Array.isArray(disposables)) {
                    disposables.push(result);
                }
                return result;
            };
        }
        return this._event;
    }
    fire(event) {
        if (this._callbacks) {
            this._callbacks.invoke.call(this._callbacks, event);
        }
    }
    dispose() {
        if (this._callbacks) {
            this._callbacks.dispose();
            this._callbacks = undefined;
            this._disposed = true;
        }
    }
}
Emitter._noop = function () { };

class BoundedMap {
    constructor(limit = Number.MAX_VALUE, ratio = 1, value) {
        this.limit = limit;
        this.map = new Map();
        this.ratio = limit * ratio;
        if (value) {
            value.entries.forEach(entry => {
                this.set(entry.key, entry.value);
            });
        }
    }
    setLimit(limit) {
        if (limit < 0) {
            return;
        }
        this.limit = limit;
        while (this.map.size > this.limit) {
            this.trim();
        }
    }
    serialize() {
        const serialized = { entries: [] };
        this.map.forEach(entry => {
            serialized.entries.push({ key: entry.key, value: entry.value });
        });
        return serialized;
    }
    get size() {
        return this.map.size;
    }
    set(key, value) {
        if (this.map.has(key)) {
            return false;
        }
        const entry = { key, value };
        this.push(entry);
        if (this.size > this.limit) {
            this.trim();
        }
        return true;
    }
    get(key) {
        const entry = this.map.get(key);
        return entry ? entry.value : null;
    }
    getOrSet(k, t) {
        const res = this.get(k);
        if (res) {
            return res;
        }
        this.set(k, t);
        return t;
    }
    delete(key) {
        const entry = this.map.get(key);
        if (entry) {
            this.map.delete(key);
            if (entry.next) {
                entry.next.prev = entry.prev;
            }
            else {
                this.head = entry.prev;
            }
            if (entry.prev) {
                entry.prev.next = entry.next;
            }
            else {
                this.tail = entry.next;
            }
            return entry.value;
        }
        return null;
    }
    has(key) {
        return this.map.has(key);
    }
    clear() {
        this.map.clear();
        this.head = null;
        this.tail = null;
    }
    push(entry) {
        if (this.head) {
            entry.prev = this.head;
            this.head.next = entry;
        }
        if (!this.tail) {
            this.tail = entry;
        }
        this.head = entry;
        this.map.set(entry.key, entry);
    }
    trim() {
        if (this.tail) {
            if (this.ratio < this.limit) {
                let index = 0;
                let current = this.tail;
                while (current.next) {
                    this.map.delete(current.key);
                    if (index === this.ratio) {
                        this.tail = current.next;
                        this.tail.prev = null;
                        break;
                    }
                    current = current.next;
                    index++;
                }
            }
            else {
                this.map.delete(this.tail.key);
                this.tail = this.tail.next;
                if (this.tail) {
                    this.tail.prev = null;
                }
            }
        }
    }
}

class PathIterator {
    reset(key) {
        this._value = key.replace(/\\$|\/$/, '');
        this._from = 0;
        this._to = 0;
        return this.next();
    }
    hasNext() {
        return this._to < this._value.length;
    }
    join(parts) {
        return parts.join('/');
    }
    next() {
        this._from = this._to;
        let justSeps = true;
        for (; this._to < this._value.length; this._to++) {
            const ch = this._value.charCodeAt(this._to);
            if (ch === PathIterator._fwd || ch === PathIterator._bwd) {
                if (justSeps) {
                    this._from++;
                }
                else {
                    break;
                }
            }
            else {
                justSeps = false;
            }
        }
        return this;
    }
    cmp(a) {
        let aPos = 0;
        let aLen = a.length;
        let thisPos = this._from;
        while (aPos < aLen && thisPos < this._to) {
            let cmp = a.charCodeAt(aPos) - this._value.charCodeAt(thisPos);
            if (cmp !== 0) {
                return cmp;
            }
            aPos += 1;
            thisPos += 1;
        }
        if (aLen === this._to - this._from) {
            return 0;
        }
        else if (aPos < aLen) {
            return -1;
        }
        else {
            return 1;
        }
    }
    value() {
        return this._value.substring(this._from, this._to);
    }
}
PathIterator._fwd = '/'.charCodeAt(0);
PathIterator._bwd = '\\'.charCodeAt(0);



var Touch;
(function (Touch) {
    Touch.None = 0;
    Touch.First = 1;
    Touch.Last = 2;
})(Touch || (Touch = {}));

const nfcCache = new BoundedMap(10000);

const nfdCache = new BoundedMap(10000);

const CACHE = new BoundedMap(10000);

class TokenizationRegistryImpl {
    constructor() {
        this._onDidChange = new Emitter();
        this.onDidChange = this._onDidChange.event;
        this._map = Object.create(null);
        this._colorMap = null;
    }
    fire(languages) {
        this._onDidChange.fire({
            changedLanguages: languages,
            changedColorMap: false
        });
    }
    register(language, support) {
        this._map[language] = support;
        this.fire([language]);
        return {
            dispose: () => {
                if (this._map[language] !== support) {
                    return;
                }
                delete this._map[language];
                this.fire([language]);
            }
        };
    }
    get(language) {
        return (this._map[language] || null);
    }
    setColorMap(colorMap) {
        this._colorMap = colorMap;
        this._onDidChange.fire({
            changedLanguages: Object.keys(this._map),
            changedColorMap: true
        });
    }
    getColorMap() {
        return this._colorMap;
    }
    getDefaultForeground() {
        return this._colorMap[1];
    }
    getDefaultBackground() {
        return this._colorMap[2];
    }
}

var SuggestTriggerKind;
(function (SuggestTriggerKind) {
    SuggestTriggerKind[SuggestTriggerKind["Invoke"] = 0] = "Invoke";
    SuggestTriggerKind[SuggestTriggerKind["TriggerCharacter"] = 1] = "TriggerCharacter";
})(SuggestTriggerKind || (SuggestTriggerKind = {}));
var DocumentHighlightKind;
(function (DocumentHighlightKind) {
    DocumentHighlightKind[DocumentHighlightKind["Text"] = 0] = "Text";
    DocumentHighlightKind[DocumentHighlightKind["Read"] = 1] = "Read";
    DocumentHighlightKind[DocumentHighlightKind["Write"] = 2] = "Write";
})(DocumentHighlightKind || (DocumentHighlightKind = {}));
var SymbolKind;
(function (SymbolKind) {
    SymbolKind[SymbolKind["File"] = 0] = "File";
    SymbolKind[SymbolKind["Module"] = 1] = "Module";
    SymbolKind[SymbolKind["Namespace"] = 2] = "Namespace";
    SymbolKind[SymbolKind["Package"] = 3] = "Package";
    SymbolKind[SymbolKind["Class"] = 4] = "Class";
    SymbolKind[SymbolKind["Method"] = 5] = "Method";
    SymbolKind[SymbolKind["Property"] = 6] = "Property";
    SymbolKind[SymbolKind["Field"] = 7] = "Field";
    SymbolKind[SymbolKind["Constructor"] = 8] = "Constructor";
    SymbolKind[SymbolKind["Enum"] = 9] = "Enum";
    SymbolKind[SymbolKind["Interface"] = 10] = "Interface";
    SymbolKind[SymbolKind["Function"] = 11] = "Function";
    SymbolKind[SymbolKind["Variable"] = 12] = "Variable";
    SymbolKind[SymbolKind["Constant"] = 13] = "Constant";
    SymbolKind[SymbolKind["String"] = 14] = "String";
    SymbolKind[SymbolKind["Number"] = 15] = "Number";
    SymbolKind[SymbolKind["Boolean"] = 16] = "Boolean";
    SymbolKind[SymbolKind["Array"] = 17] = "Array";
    SymbolKind[SymbolKind["Object"] = 18] = "Object";
    SymbolKind[SymbolKind["Key"] = 19] = "Key";
    SymbolKind[SymbolKind["Null"] = 20] = "Null";
    SymbolKind[SymbolKind["EnumMember"] = 21] = "EnumMember";
    SymbolKind[SymbolKind["Struct"] = 22] = "Struct";
    SymbolKind[SymbolKind["Event"] = 23] = "Event";
    SymbolKind[SymbolKind["Operator"] = 24] = "Operator";
    SymbolKind[SymbolKind["TypeParameter"] = 25] = "TypeParameter";
})(SymbolKind || (SymbolKind = {}));
const symbolKindToCssClass = (function () {
    const _fromMapping = Object.create(null);
    _fromMapping[SymbolKind.File] = 'file';
    _fromMapping[SymbolKind.Module] = 'module';
    _fromMapping[SymbolKind.Namespace] = 'namespace';
    _fromMapping[SymbolKind.Package] = 'package';
    _fromMapping[SymbolKind.Class] = 'class';
    _fromMapping[SymbolKind.Method] = 'method';
    _fromMapping[SymbolKind.Property] = 'property';
    _fromMapping[SymbolKind.Field] = 'field';
    _fromMapping[SymbolKind.Constructor] = 'constructor';
    _fromMapping[SymbolKind.Enum] = 'enum';
    _fromMapping[SymbolKind.Interface] = 'interface';
    _fromMapping[SymbolKind.Function] = 'function';
    _fromMapping[SymbolKind.Variable] = 'variable';
    _fromMapping[SymbolKind.Constant] = 'constant';
    _fromMapping[SymbolKind.String] = 'string';
    _fromMapping[SymbolKind.Number] = 'number';
    _fromMapping[SymbolKind.Boolean] = 'boolean';
    _fromMapping[SymbolKind.Array] = 'array';
    _fromMapping[SymbolKind.Object] = 'object';
    _fromMapping[SymbolKind.Key] = 'key';
    _fromMapping[SymbolKind.Null] = 'null';
    _fromMapping[SymbolKind.EnumMember] = 'enum-member';
    _fromMapping[SymbolKind.Struct] = 'struct';
    _fromMapping[SymbolKind.Event] = 'event';
    _fromMapping[SymbolKind.Operator] = 'operator';
    _fromMapping[SymbolKind.TypeParameter] = 'type-parameter';
    return function toCssClassName(kind) {
        return _fromMapping[kind] || 'property';
    };
})();

















const TokenizationRegistry = new TokenizationRegistryImpl();

class Token {
    constructor(offset, type, language) {
        this.offset = offset | 0;
        this.type = type;
        this.language = language;
    }
    toString() {
        return '(' + this.offset + ', ' + this.type + ')';
    }
}
class TokenizationResult {
    constructor(tokens, endState) {
        this.tokens = tokens;
        this.endState = endState;
    }
}
class TokenizationResult2 {
    constructor(tokens, endState) {
        this.tokens = tokens;
        this.endState = endState;
    }
}

class NullStateImpl {
    clone() {
        return this;
    }
    equals(other) {
        return (this === other);
    }
}
const NULL_STATE = new NullStateImpl();
const NULL_MODE_ID = 'vs.editor.nullMode';

const CACHE_STACK_DEPTH = 5;
class MonarchStackElementFactory {
    constructor(maxCacheDepth) {
        this._maxCacheDepth = maxCacheDepth;
        this._entries = Object.create(null);
    }
    static create(parent, state) {
        return this._INSTANCE.create(parent, state);
    }
    create(parent, state) {
        if (parent !== null && parent.depth >= this._maxCacheDepth) {
            return new MonarchStackElement(parent, state);
        }
        let stackElementId = MonarchStackElement.getStackElementId(parent);
        if (stackElementId.length > 0) {
            stackElementId += '|';
        }
        stackElementId += state;
        let result = this._entries[stackElementId];
        if (result) {
            return result;
        }
        result = new MonarchStackElement(parent, state);
        this._entries[stackElementId] = result;
        return result;
    }
}
MonarchStackElementFactory._INSTANCE = new MonarchStackElementFactory(CACHE_STACK_DEPTH);
class MonarchStackElement {
    constructor(parent, state) {
        this.parent = parent;
        this.state = state;
        this.depth = (this.parent ? this.parent.depth : 0) + 1;
    }
    static getStackElementId(element) {
        let result = '';
        while (element !== null) {
            if (result.length > 0) {
                result += '|';
            }
            result += element.state;
            element = element.parent;
        }
        return result;
    }
    static _equals(a, b) {
        while (a !== null && b !== null) {
            if (a === b) {
                return true;
            }
            if (a.state !== b.state) {
                return false;
            }
            a = a.parent;
            b = b.parent;
        }
        if (a === null && b === null) {
            return true;
        }
        return false;
    }
    equals(other) {
        return MonarchStackElement._equals(this, other);
    }
    push(state) {
        return MonarchStackElementFactory.create(this, state);
    }
    pop() {
        return this.parent;
    }
    popall() {
        let result = this;
        while (result.parent) {
            result = result.parent;
        }
        return result;
    }
    switchTo(state) {
        return MonarchStackElementFactory.create(this.parent, state);
    }
}
class EmbeddedModeData {
    constructor(modeId, state) {
        this.modeId = modeId;
        this.state = state;
    }
    equals(other) {
        return (this.modeId === other.modeId
            && this.state.equals(other.state));
    }
    clone() {
        let stateClone = this.state.clone();
        if (stateClone === this.state) {
            return this;
        }
        return new EmbeddedModeData(this.modeId, this.state);
    }
}
class MonarchLineStateFactory {
    constructor(maxCacheDepth) {
        this._maxCacheDepth = maxCacheDepth;
        this._entries = Object.create(null);
    }
    static create(stack, embeddedModeData) {
        return this._INSTANCE.create(stack, embeddedModeData);
    }
    create(stack, embeddedModeData) {
        if (embeddedModeData !== null) {
            return new MonarchLineState(stack, embeddedModeData);
        }
        if (stack !== null && stack.depth >= this._maxCacheDepth) {
            return new MonarchLineState(stack, embeddedModeData);
        }
        let stackElementId = MonarchStackElement.getStackElementId(stack);
        let result = this._entries[stackElementId];
        if (result) {
            return result;
        }
        result = new MonarchLineState(stack, null);
        this._entries[stackElementId] = result;
        return result;
    }
}
MonarchLineStateFactory._INSTANCE = new MonarchLineStateFactory(CACHE_STACK_DEPTH);
class MonarchLineState {
    constructor(stack, embeddedModeData) {
        this.stack = stack;
        this.embeddedModeData = embeddedModeData;
    }
    clone() {
        let embeddedModeDataClone = this.embeddedModeData ? this.embeddedModeData.clone() : null;
        if (embeddedModeDataClone === this.embeddedModeData) {
            return this;
        }
        return MonarchLineStateFactory.create(this.stack, this.embeddedModeData);
    }
    equals(other) {
        if (!(other instanceof MonarchLineState)) {
            return false;
        }
        if (!this.stack.equals(other.stack)) {
            return false;
        }
        if (this.embeddedModeData === null && other.embeddedModeData === null) {
            return true;
        }
        if (this.embeddedModeData === null || other.embeddedModeData === null) {
            return false;
        }
        return this.embeddedModeData.equals(other.embeddedModeData);
    }
}
const hasOwnProperty$2 = Object.hasOwnProperty;
class MonarchClassicTokensCollector {
    constructor() {
        this._tokens = [];
        this._language = null;
        this._lastTokenType = null;
        this._lastTokenLanguage = null;
    }
    enterMode(startOffset, modeId) {
        this._language = modeId;
    }
    emit(startOffset, type) {
        if (this._lastTokenType === type && this._lastTokenLanguage === this._language) {
            return;
        }
        this._lastTokenType = type;
        this._lastTokenLanguage = this._language;
        this._tokens.push(new Token(startOffset, type, this._language));
    }
    nestedModeTokenize(embeddedModeLine, embeddedModeData, offsetDelta) {
        const nestedModeId = embeddedModeData.modeId;
        const embeddedModeState = embeddedModeData.state;
        const nestedModeTokenizationSupport = TokenizationRegistry.get(nestedModeId);
        if (!nestedModeTokenizationSupport) {
            this.enterMode(offsetDelta, nestedModeId);
            this.emit(offsetDelta, '');
            return embeddedModeState;
        }
        let nestedResult = nestedModeTokenizationSupport.tokenize(embeddedModeLine, embeddedModeState, offsetDelta);
        this._tokens = this._tokens.concat(nestedResult.tokens);
        this._lastTokenType = null;
        this._lastTokenLanguage = null;
        this._language = null;
        return nestedResult.endState;
    }
    finalize(endState) {
        return new TokenizationResult(this._tokens, endState);
    }
}
class MonarchModernTokensCollector {
    constructor(modeService, theme) {
        this._modeService = modeService;
        this._theme = theme;
        this._prependTokens = null;
        this._tokens = [];
        this._currentLanguageId = 0;
        this._lastTokenMetadata = 0;
    }
    enterMode(startOffset, modeId) {
        this._currentLanguageId = this._modeService.getLanguageIdentifier(modeId).id;
    }
    emit(startOffset, type) {
        let metadata = this._theme.match(this._currentLanguageId, type);
        if (this._lastTokenMetadata === metadata) {
            return;
        }
        this._lastTokenMetadata = metadata;
        this._tokens.push(startOffset);
        this._tokens.push(metadata);
    }
    static _merge(a, b, c) {
        let aLen = (a !== null ? a.length : 0);
        let bLen = b.length;
        let cLen = (c !== null ? c.length : 0);
        if (aLen === 0 && bLen === 0 && cLen === 0) {
            return new Uint32Array(0);
        }
        if (aLen === 0 && bLen === 0) {
            return c;
        }
        if (bLen === 0 && cLen === 0) {
            return a;
        }
        let result = new Uint32Array(aLen + bLen + cLen);
        if (a !== null) {
            result.set(a);
        }
        for (let i = 0; i < bLen; i++) {
            result[aLen + i] = b[i];
        }
        if (c !== null) {
            result.set(c, aLen + bLen);
        }
        return result;
    }
    nestedModeTokenize(embeddedModeLine, embeddedModeData, offsetDelta) {
        const nestedModeId = embeddedModeData.modeId;
        const embeddedModeState = embeddedModeData.state;
        const nestedModeTokenizationSupport = TokenizationRegistry.get(nestedModeId);
        if (!nestedModeTokenizationSupport) {
            this.enterMode(offsetDelta, nestedModeId);
            this.emit(offsetDelta, '');
            return embeddedModeState;
        }
        let nestedResult = nestedModeTokenizationSupport.tokenize2(embeddedModeLine, embeddedModeState, offsetDelta);
        this._prependTokens = MonarchModernTokensCollector._merge(this._prependTokens, this._tokens, nestedResult.tokens);
        this._tokens = [];
        this._currentLanguageId = 0;
        this._lastTokenMetadata = 0;
        return nestedResult.endState;
    }
    finalize(endState) {
        return new TokenizationResult2(MonarchModernTokensCollector._merge(this._prependTokens, this._tokens, null), endState);
    }
}
class MonarchTokenizer {
    constructor(modeService, standaloneThemeService, modeId, lexer) {
        this._modeService = modeService;
        this._standaloneThemeService = standaloneThemeService;
        this._modeId = modeId;
        this._lexer = lexer;
        this._embeddedModes = Object.create(null);
        let emitting = false;
        this._tokenizationRegistryListener = TokenizationRegistry.onDidChange((e) => {
            if (emitting) {
                return;
            }
            let isOneOfMyEmbeddedModes = false;
            for (let i = 0, len = e.changedLanguages.length; i < len; i++) {
                let language = e.changedLanguages[i];
                if (this._embeddedModes[language]) {
                    isOneOfMyEmbeddedModes = true;
                    break;
                }
            }
            if (isOneOfMyEmbeddedModes) {
                emitting = true;
                TokenizationRegistry.fire([this._modeId]);
                emitting = false;
            }
        });
    }
    dispose() {
        this._tokenizationRegistryListener.dispose();
    }
    getInitialState() {
        let rootState = MonarchStackElementFactory.create(null, this._lexer.start);
        return MonarchLineStateFactory.create(rootState, null);
    }
    tokenize(line, lineState, offsetDelta) {
        let tokensCollector = new MonarchClassicTokensCollector();
        let endLineState = this._tokenize(line, lineState, offsetDelta, tokensCollector);
        return tokensCollector.finalize(endLineState);
    }
    tokenize2(line, lineState, offsetDelta) {
        let tokensCollector = new MonarchModernTokensCollector(this._modeService, this._standaloneThemeService.getTheme().tokenTheme);
        let endLineState = this._tokenize(line, lineState, offsetDelta, tokensCollector);
        return tokensCollector.finalize(endLineState);
    }
    _tokenize(line, lineState, offsetDelta, collector) {
        if (lineState.embeddedModeData) {
            return this._nestedTokenize(line, lineState, offsetDelta, collector);
        }
        else {
            return this._myTokenize(line, lineState, offsetDelta, collector);
        }
    }
    _findLeavingNestedModeOffset(line, state) {
        let rules = this._lexer.tokenizer[state.stack.state];
        if (!rules) {
            rules = findRules(this._lexer, state.stack.state);
            if (!rules) {
                throwError(this._lexer, 'tokenizer state is not defined: ' + state.stack.state);
            }
        }
        let popOffset = -1;
        let hasEmbeddedPopRule = false;
        for (let idx in rules) {
            if (!hasOwnProperty$2.call(rules, idx)) {
                continue;
            }
            let rule = rules[idx];
            if (isIAction(rule.action) && rule.action.nextEmbedded !== '@pop') {
                continue;
            }
            hasEmbeddedPopRule = true;
            let regex = rule.regex;
            let regexSource = rule.regex.source;
            if (regexSource.substr(0, 4) === '^(?:' && regexSource.substr(regexSource.length - 1, 1) === ')') {
                regex = new RegExp(regexSource.substr(4, regexSource.length - 5), regex.ignoreCase ? 'i' : '');
            }
            let result = line.search(regex);
            if (result === -1) {
                continue;
            }
            if (popOffset === -1 || result < popOffset) {
                popOffset = result;
            }
        }
        if (!hasEmbeddedPopRule) {
            throwError(this._lexer, 'no rule containing nextEmbedded: "@pop" in tokenizer embedded state: ' + state.stack.state);
        }
        return popOffset;
    }
    _nestedTokenize(line, lineState, offsetDelta, tokensCollector) {
        let popOffset = this._findLeavingNestedModeOffset(line, lineState);
        if (popOffset === -1) {
            let nestedEndState = tokensCollector.nestedModeTokenize(line, lineState.embeddedModeData, offsetDelta);
            return MonarchLineStateFactory.create(lineState.stack, new EmbeddedModeData(lineState.embeddedModeData.modeId, nestedEndState));
        }
        let nestedModeLine = line.substring(0, popOffset);
        if (nestedModeLine.length > 0) {
            tokensCollector.nestedModeTokenize(nestedModeLine, lineState.embeddedModeData, offsetDelta);
        }
        let restOfTheLine = line.substring(popOffset);
        return this._myTokenize(restOfTheLine, lineState, offsetDelta + popOffset, tokensCollector);
    }
    _myTokenize(line, lineState, offsetDelta, tokensCollector) {
        tokensCollector.enterMode(offsetDelta, this._modeId);
        const lineLength = line.length;
        let embeddedModeData = lineState.embeddedModeData;
        let stack = lineState.stack;
        let pos = 0;
        let groupActions = null;
        let groupMatches = null;
        let groupMatched = null;
        let groupRule = null;
        while (pos < lineLength) {
            const pos0 = pos;
            const stackLen0 = stack.depth;
            const groupLen0 = groupActions ? groupActions.length : 0;
            const state = stack.state;
            let matches = null;
            let matched = null;
            let action = null;
            let rule = null;
            let enteringEmbeddedMode = null;
            if (groupActions) {
                matches = groupMatches;
                matched = groupMatched.shift();
                action = groupActions.shift();
                rule = groupRule;
                if (groupActions.length === 0) {
                    groupActions = null;
                    groupMatches = null;
                    groupMatched = null;
                    groupRule = null;
                }
            }
            else {
                if (pos >= lineLength) {
                    break;
                }
                let rules = this._lexer.tokenizer[state];
                if (!rules) {
                    rules = findRules(this._lexer, state);
                    if (!rules) {
                        throwError(this._lexer, 'tokenizer state is not defined: ' + state);
                    }
                }
                let restOfLine = line.substr(pos);
                for (let idx in rules) {
                    if (hasOwnProperty$2.call(rules, idx)) {
                        let rule = rules[idx];
                        if (pos === 0 || !rule.matchOnlyAtLineStart) {
                            matches = restOfLine.match(rule.regex);
                            if (matches) {
                                matched = matches[0];
                                action = rule.action;
                                break;
                            }
                        }
                    }
                }
            }
            if (!matches) {
                matches = [''];
                matched = '';
            }
            if (!action) {
                if (pos < lineLength) {
                    matches = [line.charAt(pos)];
                    matched = matches[0];
                }
                action = this._lexer.defaultToken;
            }
            pos += matched.length;
            while (isFuzzyAction(action) && isIAction(action) && action.test) {
                action = action.test(matched, matches, state, pos === lineLength);
            }
            let result = null;
            if (typeof action === 'string' || Array.isArray(action)) {
                result = action;
            }
            else if (action.group) {
                result = action.group;
            }
            else if (action.token !== null && action.token !== undefined) {
                if (action.tokenSubst) {
                    result = substituteMatches(this._lexer, action.token, matched, matches, state);
                }
                else {
                    result = action.token;
                }
                if (action.nextEmbedded) {
                    if (action.nextEmbedded === '@pop') {
                        if (!embeddedModeData) {
                            throwError(this._lexer, 'cannot pop embedded mode if not inside one');
                        }
                        embeddedModeData = null;
                    }
                    else if (embeddedModeData) {
                        throwError(this._lexer, 'cannot enter embedded mode from within an embedded mode');
                    }
                    else {
                        enteringEmbeddedMode = substituteMatches(this._lexer, action.nextEmbedded, matched, matches, state);
                    }
                }
                if (action.goBack) {
                    pos = Math.max(0, pos - action.goBack);
                }
                if (action.switchTo && typeof action.switchTo === 'string') {
                    let nextState = substituteMatches(this._lexer, action.switchTo, matched, matches, state);
                    if (nextState[0] === '@') {
                        nextState = nextState.substr(1);
                    }
                    if (!findRules(this._lexer, nextState)) {
                        throwError(this._lexer, 'trying to switch to a state \'' + nextState + '\' that is undefined in rule: ' + rule.name);
                    }
                    else {
                        stack = stack.switchTo(nextState);
                    }
                }
                else if (action.transform && typeof action.transform === 'function') {
                    throwError(this._lexer, 'action.transform not supported');
                }
                else if (action.next) {
                    if (action.next === '@push') {
                        if (stack.depth >= this._lexer.maxStack) {
                            throwError(this._lexer, 'maximum tokenizer stack size reached: [' +
                                stack.state + ',' + stack.parent.state + ',...]');
                        }
                        else {
                            stack = stack.push(state);
                        }
                    }
                    else if (action.next === '@pop') {
                        if (stack.depth <= 1) {
                            throwError(this._lexer, 'trying to pop an empty stack in rule: ' + rule.name);
                        }
                        else {
                            stack = stack.pop();
                        }
                    }
                    else if (action.next === '@popall') {
                        stack = stack.popall();
                    }
                    else {
                        let nextState = substituteMatches(this._lexer, action.next, matched, matches, state);
                        if (nextState[0] === '@') {
                            nextState = nextState.substr(1);
                        }
                        if (!findRules(this._lexer, nextState)) {
                            throwError(this._lexer, 'trying to set a next state \'' + nextState + '\' that is undefined in rule: ' + rule.name);
                        }
                        else {
                            stack = stack.push(nextState);
                        }
                    }
                }
                if (action.log && typeof (action.log) === 'string') {
                    log(this._lexer, this._lexer.languageId + ': ' + substituteMatches(this._lexer, action.log, matched, matches, state));
                }
            }
            if (result === null) {
                throwError(this._lexer, 'lexer rule has no well-defined action in rule: ' + rule.name);
            }
            if (Array.isArray(result)) {
                if (groupActions && groupActions.length > 0) {
                    throwError(this._lexer, 'groups cannot be nested: ' + rule.name);
                }
                if (matches.length !== result.length + 1) {
                    throwError(this._lexer, 'matched number of groups does not match the number of actions in rule: ' + rule.name);
                }
                let totalLen = 0;
                for (let i = 1; i < matches.length; i++) {
                    totalLen += matches[i].length;
                }
                if (totalLen !== matched.length) {
                    throwError(this._lexer, 'with groups, all characters should be matched in consecutive groups in rule: ' + rule.name);
                }
                groupMatches = matches;
                groupMatched = matches.slice(1);
                groupActions = result.slice(0);
                groupRule = rule;
                pos -= matched.length;
                continue;
            }
            else {
                if (result === '@rematch') {
                    pos -= matched.length;
                    matched = '';
                    matches = null;
                    result = '';
                }
                if (matched.length === 0) {
                    if (stackLen0 !== stack.depth || state !== stack.state || (!groupActions ? 0 : groupActions.length) !== groupLen0) {
                        continue;
                    }
                    else {
                        throwError(this._lexer, 'no progress in tokenizer in rule: ' + rule.name);
                        pos = lineLength;
                    }
                }
                let tokenType = null;
                if (isString$1(result) && result.indexOf('@brackets') === 0) {
                    let rest = result.substr('@brackets'.length);
                    let bracket = findBracket(this._lexer, matched);
                    if (!bracket) {
                        throwError(this._lexer, '@brackets token returned but no bracket defined as: ' + matched);
                        bracket = { token: '', bracketType: 0 };
                    }
                    tokenType = sanitize(bracket.token + rest);
                }
                else {
                    let token = (result === '' ? '' : result + this._lexer.tokenPostfix);
                    tokenType = sanitize(token);
                }
                tokensCollector.emit(pos0 + offsetDelta, tokenType);
            }
            if (enteringEmbeddedMode !== null) {
                let enteringEmbeddedModeId = this._modeService.getModeIdForLanguageName(enteringEmbeddedMode);
                if (enteringEmbeddedModeId) {
                    enteringEmbeddedMode = enteringEmbeddedModeId;
                }
                let embeddedModeData = this._getNestedEmbeddedModeData(enteringEmbeddedMode);
                if (pos < lineLength) {
                    let restOfLine = line.substr(pos);
                    return this._nestedTokenize(restOfLine, MonarchLineStateFactory.create(stack, embeddedModeData), offsetDelta + pos, tokensCollector);
                }
                else {
                    return MonarchLineStateFactory.create(stack, embeddedModeData);
                }
            }
        }
        return MonarchLineStateFactory.create(stack, embeddedModeData);
    }
    _getNestedEmbeddedModeData(mimetypeOrModeId) {
        let nestedMode = this._locateMode(mimetypeOrModeId);
        if (nestedMode) {
            let tokenizationSupport = TokenizationRegistry.get(nestedMode.getId());
            if (tokenizationSupport) {
                return new EmbeddedModeData(nestedMode.getId(), tokenizationSupport.getInitialState());
            }
        }
        let nestedModeId = nestedMode ? nestedMode.getId() : NULL_MODE_ID;
        return new EmbeddedModeData(nestedModeId, NULL_STATE);
    }
    _locateMode(mimetypeOrModeId) {
        if (!mimetypeOrModeId || !this._modeService.isRegisteredMode(mimetypeOrModeId)) {
            return null;
        }
        let modeId = this._modeService.getModeId(mimetypeOrModeId);
        this._modeService.getOrCreateMode(modeId);
        let mode = this._modeService.getMode(modeId);
        if (mode) {
            this._embeddedModes[modeId] = true;
            return mode;
        }
        this._embeddedModes[modeId] = true;
        return null;
    }
}
function findBracket(lexer, matched) {
    if (!matched) {
        return null;
    }
    matched = fixCase(lexer, matched);
    var brackets = lexer.brackets;
    for (var i = 0; i < brackets.length; i++) {
        var bracket = brackets[i];
        if (bracket.open === matched) {
            return { token: bracket.token, bracketType: 1 };
        }
        else if (bracket.close === matched) {
            return { token: bracket.token, bracketType: -1 };
        }
    }
    return null;
}
function createTokenizationSupport(modeService, standaloneThemeService, modeId, lexer) {
    return new MonarchTokenizer(modeService, standaloneThemeService, modeId, lexer);
}

function roundFloat(number, decimalPoints) {
    const decimal = Math.pow(10, decimalPoints);
    return Math.round(number * decimal) / decimal;
}
class RGBA {
    constructor(r, g, b, a = 1) {
        this.r = Math.min(255, Math.max(0, r)) | 0;
        this.g = Math.min(255, Math.max(0, g)) | 0;
        this.b = Math.min(255, Math.max(0, b)) | 0;
        this.a = roundFloat(Math.max(Math.min(1, a), 0), 3);
    }
    static equals(a, b) {
        return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
    }
}
class HSLA {
    constructor(h, s, l, a) {
        this.h = Math.max(Math.min(360, h), 0) | 0;
        this.s = roundFloat(Math.max(Math.min(1, s), 0), 3);
        this.l = roundFloat(Math.max(Math.min(1, l), 0), 3);
        this.a = roundFloat(Math.max(Math.min(1, a), 0), 3);
    }
    static equals(a, b) {
        return a.h === b.h && a.s === b.s && a.l === b.l && a.a === b.a;
    }
    static fromRGBA(rgba) {
        const r = rgba.r / 255;
        const g = rgba.g / 255;
        const b = rgba.b / 255;
        const a = rgba.a;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;
        let s = 0;
        const l = (min + max) / 2;
        const chroma = max - min;
        if (chroma > 0) {
            s = Math.min((l <= 0.5 ? chroma / (2 * l) : chroma / (2 - (2 * l))), 1);
            switch (max) {
                case r:
                    h = (g - b) / chroma + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / chroma + 2;
                    break;
                case b:
                    h = (r - g) / chroma + 4;
                    break;
            }
            h *= 60;
            h = Math.round(h);
        }
        return new HSLA(h, s, l, a);
    }
    static _hue2rgb(p, q, t) {
        if (t < 0) {
            t += 1;
        }
        if (t > 1) {
            t -= 1;
        }
        if (t < 1 / 6) {
            return p + (q - p) * 6 * t;
        }
        if (t < 1 / 2) {
            return q;
        }
        if (t < 2 / 3) {
            return p + (q - p) * (2 / 3 - t) * 6;
        }
        return p;
    }
    static toRGBA(hsla) {
        const h = hsla.h / 360;
        const { s, l, a } = hsla;
        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        }
        else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = HSLA._hue2rgb(p, q, h + 1 / 3);
            g = HSLA._hue2rgb(p, q, h);
            b = HSLA._hue2rgb(p, q, h - 1 / 3);
        }
        return new RGBA(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a);
    }
}
class HSVA {
    constructor(h, s, v, a) {
        this.h = Math.max(Math.min(360, h), 0) | 0;
        this.s = roundFloat(Math.max(Math.min(1, s), 0), 3);
        this.v = roundFloat(Math.max(Math.min(1, v), 0), 3);
        this.a = roundFloat(Math.max(Math.min(1, a), 0), 3);
    }
    static equals(a, b) {
        return a.h === b.h && a.s === b.s && a.v === b.v && a.a === b.a;
    }
    static fromRGBA(rgba) {
        const r = rgba.r / 255;
        const g = rgba.g / 255;
        const b = rgba.b / 255;
        const cmax = Math.max(r, g, b);
        const cmin = Math.min(r, g, b);
        const delta = cmax - cmin;
        const s = cmax === 0 ? 0 : (delta / cmax);
        let m;
        if (delta === 0) {
            m = 0;
        }
        else if (cmax === r) {
            m = ((((g - b) / delta) % 6) + 6) % 6;
        }
        else if (cmax === g) {
            m = ((b - r) / delta) + 2;
        }
        else {
            m = ((r - g) / delta) + 4;
        }
        return new HSVA(m * 60, s, cmax, rgba.a);
    }
    static toRGBA(hsva) {
        const { h, s, v, a } = hsva;
        const c = v * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = v - c;
        let [r, g, b] = [0, 0, 0];
        if (h < 60) {
            r = c;
            g = x;
        }
        else if (h < 120) {
            r = x;
            g = c;
        }
        else if (h < 180) {
            g = c;
            b = x;
        }
        else if (h < 240) {
            g = x;
            b = c;
        }
        else if (h < 300) {
            r = x;
            b = c;
        }
        else if (h < 360) {
            r = c;
            b = x;
        }
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);
        return new RGBA(r, g, b, a);
    }
}
class Color {
    constructor(arg) {
        if (!arg) {
            throw new Error('Color needs a value');
        }
        else if (arg instanceof RGBA) {
            this.rgba = arg;
        }
        else if (arg instanceof HSLA) {
            this._hsla = arg;
            this.rgba = HSLA.toRGBA(arg);
        }
        else if (arg instanceof HSVA) {
            this._hsva = arg;
            this.rgba = HSVA.toRGBA(arg);
        }
        else {
            throw new Error('Invalid color ctor argument');
        }
    }
    static fromHex(hex) {
        return Color.Format.CSS.parseHex(hex) || Color.red;
    }
    get hsla() {
        if (this._hsla) {
            return this._hsla;
        }
        else {
            return HSLA.fromRGBA(this.rgba);
        }
    }
    get hsva() {
        if (this._hsva) {
            return this._hsva;
        }
        return HSVA.fromRGBA(this.rgba);
    }
    equals(other) {
        return !!other && RGBA.equals(this.rgba, other.rgba) && HSLA.equals(this.hsla, other.hsla) && HSVA.equals(this.hsva, other.hsva);
    }
    getRelativeLuminance() {
        const R = Color._relativeLuminanceForComponent(this.rgba.r);
        const G = Color._relativeLuminanceForComponent(this.rgba.g);
        const B = Color._relativeLuminanceForComponent(this.rgba.b);
        const luminance = 0.2126 * R + 0.7152 * G + 0.0722 * B;
        return roundFloat(luminance, 4);
    }
    static _relativeLuminanceForComponent(color) {
        const c = color / 255;
        return (c <= 0.03928) ? c / 12.92 : Math.pow(((c + 0.055) / 1.055), 2.4);
    }
    getContrastRatio(another) {
        const lum1 = this.getRelativeLuminance();
        const lum2 = another.getRelativeLuminance();
        return lum1 > lum2 ? (lum1 + 0.05) / (lum2 + 0.05) : (lum2 + 0.05) / (lum1 + 0.05);
    }
    isDarker() {
        const yiq = (this.rgba.r * 299 + this.rgba.g * 587 + this.rgba.b * 114) / 1000;
        return yiq < 128;
    }
    isLighter() {
        const yiq = (this.rgba.r * 299 + this.rgba.g * 587 + this.rgba.b * 114) / 1000;
        return yiq >= 128;
    }
    isLighterThan(another) {
        const lum1 = this.getRelativeLuminance();
        const lum2 = another.getRelativeLuminance();
        return lum1 > lum2;
    }
    isDarkerThan(another) {
        const lum1 = this.getRelativeLuminance();
        const lum2 = another.getRelativeLuminance();
        return lum1 < lum2;
    }
    lighten(factor) {
        return new Color(new HSLA(this.hsla.h, this.hsla.s, this.hsla.l + this.hsla.l * factor, this.hsla.a));
    }
    darken(factor) {
        return new Color(new HSLA(this.hsla.h, this.hsla.s, this.hsla.l - this.hsla.l * factor, this.hsla.a));
    }
    transparent(factor) {
        const { r, g, b, a } = this.rgba;
        return new Color(new RGBA(r, g, b, a * factor));
    }
    isTransparent() {
        return this.rgba.a === 0;
    }
    isOpaque() {
        return this.rgba.a === 1;
    }
    opposite() {
        return new Color(new RGBA(255 - this.rgba.r, 255 - this.rgba.g, 255 - this.rgba.b, this.rgba.a));
    }
    blend(c) {
        const rgba = c.rgba;
        const thisA = this.rgba.a;
        const colorA = rgba.a;
        let a = thisA + colorA * (1 - thisA);
        if (a < 1.0e-6) {
            return Color.transparent;
        }
        const r = this.rgba.r * thisA / a + rgba.r * colorA * (1 - thisA) / a;
        const g = this.rgba.g * thisA / a + rgba.g * colorA * (1 - thisA) / a;
        const b = this.rgba.b * thisA / a + rgba.b * colorA * (1 - thisA) / a;
        return new Color(new RGBA(r, g, b, a));
    }
    toString() {
        return Color.Format.CSS.format(this);
    }
    static getLighterColor(of, relative, factor) {
        if (of.isLighterThan(relative)) {
            return of;
        }
        factor = factor ? factor : 0.5;
        const lum1 = of.getRelativeLuminance();
        const lum2 = relative.getRelativeLuminance();
        factor = factor * (lum2 - lum1) / lum2;
        return of.lighten(factor);
    }
    static getDarkerColor(of, relative, factor) {
        if (of.isDarkerThan(relative)) {
            return of;
        }
        factor = factor ? factor : 0.5;
        const lum1 = of.getRelativeLuminance();
        const lum2 = relative.getRelativeLuminance();
        factor = factor * (lum1 - lum2) / lum1;
        return of.darken(factor);
    }
}
Color.white = new Color(new RGBA(255, 255, 255, 1));
Color.black = new Color(new RGBA(0, 0, 0, 1));
Color.red = new Color(new RGBA(255, 0, 0, 1));
Color.blue = new Color(new RGBA(0, 0, 255, 1));
Color.green = new Color(new RGBA(0, 255, 0, 1));
Color.cyan = new Color(new RGBA(0, 255, 255, 1));
Color.lightgrey = new Color(new RGBA(211, 211, 211, 1));
Color.transparent = new Color(new RGBA(0, 0, 0, 0));
(function (Color) {
    let Format;
    (function (Format) {
        let CSS;
        (function (CSS) {
            function formatRGB(color) {
                if (color.rgba.a === 1) {
                    return `rgb(${color.rgba.r}, ${color.rgba.g}, ${color.rgba.b})`;
                }
                return Color.Format.CSS.formatRGBA(color);
            }
            CSS.formatRGB = formatRGB;
            function formatRGBA(color) {
                return `rgba(${color.rgba.r}, ${color.rgba.g}, ${color.rgba.b}, ${+(color.rgba.a).toFixed(2)})`;
            }
            CSS.formatRGBA = formatRGBA;
            function formatHSL(color) {
                if (color.hsla.a === 1) {
                    return `hsl(${color.hsla.h}, ${(color.hsla.s * 100).toFixed(2)}%, ${(color.hsla.l * 100).toFixed(2)}%)`;
                }
                return Color.Format.CSS.formatHSLA(color);
            }
            CSS.formatHSL = formatHSL;
            function formatHSLA(color) {
                return `hsla(${color.hsla.h}, ${(color.hsla.s * 100).toFixed(2)}%, ${(color.hsla.l * 100).toFixed(2)}%, ${color.hsla.a.toFixed(2)})`;
            }
            CSS.formatHSLA = formatHSLA;
            function _toTwoDigitHex(n) {
                const r = n.toString(16);
                return r.length !== 2 ? '0' + r : r;
            }
            function formatHex(color) {
                return `#${_toTwoDigitHex(color.rgba.r)}${_toTwoDigitHex(color.rgba.g)}${_toTwoDigitHex(color.rgba.b)}`;
            }
            CSS.formatHex = formatHex;
            function formatHexA(color, compact = false) {
                if (compact && color.rgba.a === 1) {
                    return Color.Format.CSS.formatHex(color);
                }
                return `#${_toTwoDigitHex(color.rgba.r)}${_toTwoDigitHex(color.rgba.g)}${_toTwoDigitHex(color.rgba.b)}${_toTwoDigitHex(Math.round(color.rgba.a * 255))}`;
            }
            CSS.formatHexA = formatHexA;
            function format(color) {
                if (!color) {
                    return null;
                }
                if (color.isOpaque()) {
                    return Color.Format.CSS.formatHex(color);
                }
                return Color.Format.CSS.formatRGBA(color);
            }
            CSS.format = format;
            function parseHex(hex) {
                if (!hex) {
                    return null;
                }
                const length = hex.length;
                if (length === 0) {
                    return null;
                }
                if (hex.charCodeAt(0) !== 35) {
                    return null;
                }
                if (length === 7) {
                    const r = 16 * _parseHexDigit(hex.charCodeAt(1)) + _parseHexDigit(hex.charCodeAt(2));
                    const g = 16 * _parseHexDigit(hex.charCodeAt(3)) + _parseHexDigit(hex.charCodeAt(4));
                    const b = 16 * _parseHexDigit(hex.charCodeAt(5)) + _parseHexDigit(hex.charCodeAt(6));
                    return new Color(new RGBA(r, g, b, 1));
                }
                if (length === 9) {
                    const r = 16 * _parseHexDigit(hex.charCodeAt(1)) + _parseHexDigit(hex.charCodeAt(2));
                    const g = 16 * _parseHexDigit(hex.charCodeAt(3)) + _parseHexDigit(hex.charCodeAt(4));
                    const b = 16 * _parseHexDigit(hex.charCodeAt(5)) + _parseHexDigit(hex.charCodeAt(6));
                    const a = 16 * _parseHexDigit(hex.charCodeAt(7)) + _parseHexDigit(hex.charCodeAt(8));
                    return new Color(new RGBA(r, g, b, a / 255));
                }
                if (length === 4) {
                    const r = _parseHexDigit(hex.charCodeAt(1));
                    const g = _parseHexDigit(hex.charCodeAt(2));
                    const b = _parseHexDigit(hex.charCodeAt(3));
                    return new Color(new RGBA(16 * r + r, 16 * g + g, 16 * b + b));
                }
                if (length === 5) {
                    const r = _parseHexDigit(hex.charCodeAt(1));
                    const g = _parseHexDigit(hex.charCodeAt(2));
                    const b = _parseHexDigit(hex.charCodeAt(3));
                    const a = _parseHexDigit(hex.charCodeAt(4));
                    return new Color(new RGBA(16 * r + r, 16 * g + g, 16 * b + b, (16 * a + a) / 255));
                }
                return null;
            }
            CSS.parseHex = parseHex;
            function _parseHexDigit(charCode) {
                switch (charCode) {
                    case 48: return 0;
                    case 49: return 1;
                    case 50: return 2;
                    case 51: return 3;
                    case 52: return 4;
                    case 53: return 5;
                    case 54: return 6;
                    case 55: return 7;
                    case 56: return 8;
                    case 57: return 9;
                    case 97: return 10;
                    case 65: return 10;
                    case 98: return 11;
                    case 66: return 11;
                    case 99: return 12;
                    case 67: return 12;
                    case 100: return 13;
                    case 68: return 13;
                    case 101: return 14;
                    case 69: return 14;
                    case 102: return 15;
                    case 70: return 15;
                }
                return 0;
            }
        })(CSS = Format.CSS || (Format.CSS = {}));
    })(Format = Color.Format || (Color.Format = {}));
})(Color || (Color = {}));

class ParsedTokenThemeRule {
    constructor(token, index, fontStyle, foreground, background) {
        this.token = token;
        this.index = index;
        this.fontStyle = fontStyle;
        this.foreground = foreground;
        this.background = background;
    }
}
function parseTokenTheme(source) {
    if (!source || !Array.isArray(source)) {
        return [];
    }
    let result = [], resultLen = 0;
    for (let i = 0, len = source.length; i < len; i++) {
        let entry = source[i];
        let fontStyle = -1;
        if (typeof entry.fontStyle === 'string') {
            fontStyle = 0;
            let segments = entry.fontStyle.split(' ');
            for (let j = 0, lenJ = segments.length; j < lenJ; j++) {
                let segment = segments[j];
                switch (segment) {
                    case 'italic':
                        fontStyle = fontStyle | 1;
                        break;
                    case 'bold':
                        fontStyle = fontStyle | 2;
                        break;
                    case 'underline':
                        fontStyle = fontStyle | 4;
                        break;
                }
            }
        }
        let foreground = null;
        if (typeof entry.foreground === 'string') {
            foreground = entry.foreground;
        }
        let background = null;
        if (typeof entry.background === 'string') {
            background = entry.background;
        }
        result[resultLen++] = new ParsedTokenThemeRule(entry.token || '', i, fontStyle, foreground, background);
    }
    return result;
}
function resolveParsedTokenThemeRules(parsedThemeRules) {
    parsedThemeRules.sort((a, b) => {
        let r = strcmp(a.token, b.token);
        if (r !== 0) {
            return r;
        }
        return a.index - b.index;
    });
    let defaultFontStyle = 0;
    let defaultForeground = '000000';
    let defaultBackground = 'ffffff';
    while (parsedThemeRules.length >= 1 && parsedThemeRules[0].token === '') {
        let incomingDefaults = parsedThemeRules.shift();
        if (incomingDefaults.fontStyle !== -1) {
            defaultFontStyle = incomingDefaults.fontStyle;
        }
        if (incomingDefaults.foreground !== null) {
            defaultForeground = incomingDefaults.foreground;
        }
        if (incomingDefaults.background !== null) {
            defaultBackground = incomingDefaults.background;
        }
    }
    let colorMap = new ColorMap();
    let defaults = new ThemeTrieElementRule(defaultFontStyle, colorMap.getId(defaultForeground), colorMap.getId(defaultBackground));
    let root = new ThemeTrieElement(defaults);
    for (let i = 0, len = parsedThemeRules.length; i < len; i++) {
        let rule = parsedThemeRules[i];
        root.insert(rule.token, rule.fontStyle, colorMap.getId(rule.foreground), colorMap.getId(rule.background));
    }
    return new TokenTheme(colorMap, root);
}
class ColorMap {
    constructor() {
        this._lastColorId = 0;
        this._id2color = [];
        this._color2id = new Map();
    }
    getId(color) {
        if (color === null) {
            return 0;
        }
        color = color.toUpperCase();
        if (!/^[0-9A-F]{6}$/.test(color)) {
            throw new Error('Illegal color name: ' + color);
        }
        let value = this._color2id.get(color);
        if (value) {
            return value;
        }
        value = ++this._lastColorId;
        this._color2id.set(color, value);
        this._id2color[value] = Color.fromHex('#' + color);
        return value;
    }
    getColorMap() {
        return this._id2color.slice(0);
    }
}
class TokenTheme {
    static createFromRawTokenTheme(source) {
        return this.createFromParsedTokenTheme(parseTokenTheme(source));
    }
    static createFromParsedTokenTheme(source) {
        return resolveParsedTokenThemeRules(source);
    }
    constructor(colorMap, root) {
        this._colorMap = colorMap;
        this._root = root;
        this._cache = new Map();
    }
    getColorMap() {
        return this._colorMap.getColorMap();
    }
    getThemeTrieElement() {
        return this._root.toExternalThemeTrieElement();
    }
    _match(token) {
        return this._root.match(token);
    }
    match(languageId, token) {
        let result = this._cache.get(token);
        if (typeof result === 'undefined') {
            let rule = this._match(token);
            let standardToken = toStandardTokenType(token);
            result = (rule.metadata
                | (standardToken << 8)) >>> 0;
            this._cache.set(token, result);
        }
        return (result
            | (languageId << 0)) >>> 0;
    }
}
const STANDARD_TOKEN_TYPE_REGEXP = /\b(comment|string|regex)\b/;
function toStandardTokenType(tokenType) {
    let m = tokenType.match(STANDARD_TOKEN_TYPE_REGEXP);
    if (!m) {
        return 0;
    }
    switch (m[1]) {
        case 'comment':
            return 1;
        case 'string':
            return 2;
        case 'regex':
            return 4;
    }
    throw new Error('Unexpected match for standard token type!');
}
function strcmp(a, b) {
    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1;
    }
    return 0;
}
class ThemeTrieElementRule {
    constructor(fontStyle, foreground, background) {
        this._fontStyle = fontStyle;
        this._foreground = foreground;
        this._background = background;
        this.metadata = ((this._fontStyle << 11)
            | (this._foreground << 14)
            | (this._background << 23)) >>> 0;
    }
    clone() {
        return new ThemeTrieElementRule(this._fontStyle, this._foreground, this._background);
    }
    static cloneArr(arr) {
        let r = [];
        for (let i = 0, len = arr.length; i < len; i++) {
            r[i] = arr[i].clone();
        }
        return r;
    }
    acceptOverwrite(fontStyle, foreground, background) {
        if (fontStyle !== -1) {
            this._fontStyle = fontStyle;
        }
        if (foreground !== 0) {
            this._foreground = foreground;
        }
        if (background !== 0) {
            this._background = background;
        }
        this.metadata = ((this._fontStyle << 11)
            | (this._foreground << 14)
            | (this._background << 23)) >>> 0;
    }
}
class ExternalThemeTrieElement {
    constructor(mainRule, children) {
        this.mainRule = mainRule;
        this.children = children || Object.create(null);
    }
}
class ThemeTrieElement {
    constructor(mainRule) {
        this._mainRule = mainRule;
        this._children = new Map();
    }
    toExternalThemeTrieElement() {
        let children = Object.create(null);
        this._children.forEach((element, index) => {
            children[index] = element.toExternalThemeTrieElement();
        });
        return new ExternalThemeTrieElement(this._mainRule, children);
    }
    match(token) {
        if (token === '') {
            return this._mainRule;
        }
        let dotIndex = token.indexOf('.');
        let head;
        let tail;
        if (dotIndex === -1) {
            head = token;
            tail = '';
        }
        else {
            head = token.substring(0, dotIndex);
            tail = token.substring(dotIndex + 1);
        }
        let child = this._children.get(head);
        if (typeof child !== 'undefined') {
            return child.match(tail);
        }
        return this._mainRule;
    }
    insert(token, fontStyle, foreground, background) {
        if (token === '') {
            this._mainRule.acceptOverwrite(fontStyle, foreground, background);
            return;
        }
        let dotIndex = token.indexOf('.');
        let head;
        let tail;
        if (dotIndex === -1) {
            head = token;
            tail = '';
        }
        else {
            head = token.substring(0, dotIndex);
            tail = token.substring(dotIndex + 1);
        }
        let child = this._children.get(head);
        if (typeof child === 'undefined') {
            child = new ThemeTrieElement(this._mainRule.clone());
            this._children.set(head, child);
        }
        child.insert(tail, fontStyle, foreground, background);
    }
}

var languages = {};
var lexers = {};
var aliases = {
    "text/css": "css",
    "application/javascript": "javascript"
}


// create mock modeService
/*
    isRegisteredMode(mimetypeOrModeId: string): boolean;
    getRegisteredModes(): string[];
    getRegisteredLanguageNames(): string[];
    getExtensions(alias: string): string[];
    getFilenames(alias: string): string[];
    getMimeForMode(modeId: string): string;
    getLanguageName(modeId: string): string;
    getModeIdForLanguageName(alias: string): string;
    getModeIdByFilenameOrFirstLine(filename: string, firstLine?: string): string;
    getModeId(commaSeparatedMimetypesOrCommaSeparatedIds: string): string;
    getLanguageIdentifier(modeId: string | LanguageId): LanguageIdentifier;
    getConfigurationFiles(modeId: string): string[];

    // --- instantiation
    lookup(commaSeparatedMimetypesOrCommaSeparatedIds: string): IModeLookupResult[];
    getMode(commaSeparatedMimetypesOrCommaSeparatedIds: string): IMode;
    getOrCreateMode(commaSeparatedMimetypesOrCommaSeparatedIds: string): TPromise<IMode>;
    getOrCreateModeByLanguageName(languageName: string): TPromise<IMode>;
    getOrCreateModeByFilenameOrFirstLine(filename: string, firstLine?: string): TPromise<IMode>;
*/
var modeService = {
    getModeIdForLanguageName(name){
        // console.log("get for langaugeName");
        return aliases[name] || name;
    },

    getModeId(name){
        return aliases[name] || name;
    },

    getMode(langid){
        // console.log(TokenizationRegistry.get(langid));
        return {getId: function(){ return langid; }}
    },

    getOrCreateMode(langid){
        return true;
    },

    isRegisteredMode(name){
        return !!languages[name];
    }
}

function register(langId,config){
	languages[langId] =	languages[langId] || compile(langId,config);
	lexers[langId] = lexers[langId] || createTokenizationSupport(modeService,null,langId,languages[langId]);
	return lexers[langId];
}

function getLexer(langId){
	return lexers[langId];
}

function tokenize(langId,code,state){
	var lexer = lexers[langId];
	var state = state || lexer.getInitialState();
	// var lines = code.split('\n');
	return lexer.tokenize(code,state,0);
}

exports.register = register;
exports.getLexer = getLexer;
exports.tokenize = tokenize;
exports.TokenTheme = TokenTheme;
exports.parseTokenTheme = parseTokenTheme;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {



var imba = exports.imba = {
	id: 'imba',
	extensions: ['.imba'],
	aliases: ['Imba','imba'],
	mimetypes: ['application/imba'],
	language: __webpack_require__(52)
};

var ruby = exports.ruby = {
	id: 'ruby',
	extensions: ['.rb','.rbx','.rjs','.gemspec','.pp'],
	filenames: ['rakefile'],
	aliases: ['Ruby','rb'],
	language: __webpack_require__(53)
};

var javascript = exports.javascript = {
	id: 'javascript',
	extensions: ['.js','.jsx'],
	aliases: ['JavaScript','js'],
	mimetypes: ['text/javascript','application/javascript'],
	language: __webpack_require__(54)
};

var css = exports.css = {
	id: 'css',
	extensions: ['.css','.scss'],
	aliases: ['CSS','css'],
	mimetypes: ['text/css'],
	language: __webpack_require__(55)
};

var python = exports.python = {
	id: 'python',
	extensions: ['.py','.rpy','.pyw','.cpy','.gyp','.gypi'],
	aliases: ['Python','py'],
	firstLine: '^#!/.*\\bpython[0-9.-]*\\b',
	language: __webpack_require__(56)
};

var html = exports.html = {
	id: 'html',
	extensions: ['.html','.htm','.shtml','.xhtml','.mdoc','.jsp','.asp','.aspx','.jshtm'],
	aliases: ['HTML','htm','html','xhtml'],
	mimetypes: ['text/html','text/x-jshtm','text/template','text/ng-template'],
	language: __webpack_require__(57)
};

var less = exports.less = {
	id: 'less',
	extensions: ['.less'],
	aliases: ['Less','less'],
	mimetypes: ['text/x-less','text/less'],
	language: __webpack_require__(58)
};

var xml = exports.xml = {
	id: 'xml',
	extensions: ['.xml','.dtd','.ascx','.csproj','.config','.wxi','.wxl','.wxs','.xaml','.svg','.svgz'],
	firstLine: '(\\<\\?xml.*)|(\\<svg)|(\\<\\!doctype\\s+svg)',
	aliases: ['XML','xml'],
	mimetypes: ['text/xml','application/xml','application/xaml+xml','application/xml-dtd'],
	language: __webpack_require__(59)
};

var java = exports.java = {
	id: 'java',
	extensions: ['.java','.jav'],
	aliases: ['Java','java'],
	mimetypes: ['text/x-java-source','text/x-java'],
	language: __webpack_require__(60)
};


/***/ }),
/* 52 */
/***/ (function(module, exports) {

var names = {
	access: 'delimiter.access',
	ivar: 'variable.instance',
	constant: 'identifier.const'


};
var language = exports.language = {
	defaultToken: 'invalid',
	ignoreCase: false,
	tokenPostfix: '.imba',
	brackets: [
		{open: '{',close: '}',token: 'delimiter.curly'},
		{open: '[',close: ']',token: 'delimiter.square'},
		{open: '(',close: ')',token: 'delimiter.parenthesis'}
	],
	keywords: [
		'def','and','or','is','isnt','not','on','yes','@','no','off',
		'true','false','null','this','self',
		'new','delete','typeof','in','instanceof',
		'return','throw','break','continue','debugger',
		'if','elif','else','switch','for','while','do','try','catch','finally',
		'class','extends','super',
		'undefined','then','unless','until','loop','of','by','when',
		'tag','prop','export','import','extend',
		'var','let','const','require','isa','await'
	],
	boolean: ['true','false','yes','no','undefined'],
	contextual_keywords: [
		'from','global','attr'
	],
	operators: [
		'=','!','~','?',':','!!',
		'&','|','^','%','<<',
		'>>','>>>','+=','-=','*=','/=','&=','|=','?=',
		'^=','%=','<<=','>>=','>>>=','..','...'
	],
	logic: [
		'>','<','==','<=','>=','!=','&&','||','===','!=='
	],
	ranges: ['..','...'],
	dot: ['.'],
	math: [
		'+','-','*','/','++','--'
	],
	
	
	symbols: /[=><!~?&%|+\-*\/\^\.,\:]+/,
	escapes: /\\(?:[abfnrtv\\"'$]|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
	postaccess: /(:(?=\w))?/,
	ivar: /\@[a-zA-Z_]\w*/,
	constant: /[A-Z][A-Za-z\d\-\_]*/,
	className: /[A-Z][A-Za-z\d\-\_]*|[A-Za-z\d\-\_]+/,
	methodName: /[A-Za-z\_][A-Za-z\d\-\_]*\=?/,
	identifier: /[a-z_][A-Za-z\d\-\_]*/,
	
	regEx: /\/(?!\/\/)(?:[^\/\\]|\\.)*\/[igm]*/,
	
	regexpctl: /[(){}\[\]\$\^|\-*+?\.]/,
	regexpesc: /\\(?:[bBdDfnrstvwWn0\\\/]|@regexpctl|c[A-Z]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4})/,
	
	
	tokenizer: {
		root: [
			{include: '@body'}
		],
		body: [
			[/([a-z]\w*)(\:)(?=\w)/,{
				cases: {
					'this:': ['variable.predefined.this','delimiter.access'],
					'self:': ['variable.predefined.self','delimiter.access'],
					'@default': ['identifier','delimiter.access']
				}
			}],
			
			[/(@ivar)(\:)(?=\w)/,[names.ivar,names.access]],
			[/(@constant)(\:)(?=\w)/,[names.constant,names.access]],
			
			[/(class|tag|module)(?=\s)/,{token: 'keyword.$1',next: '@declstart.$1'}],
			[/(def)(?=\s)/,{token: 'keyword.$1',next: '@defstart.$1'}],
			[/(prop|attr)(?=\s)/,{token: 'keyword.$1',next: '@propstart.$1'}],
			
			[/(import)(?=\s)/,{token: 'keyword.$1',next: '@importstart.$1'}],
			
			[/([a-z]\w*)(:?(?!\w))/,{
				cases: {
					'$2': ['key.identifier','delimiter'],
					'this': 'variable.predefined.this',
					'self': 'variable.predefined.self',
					'$1@boolean': {token: 'boolean.$0'},
					'$1@keywords': {token: 'keyword.$0'},
					'$1@contextual_keywords': {token: 'identifier.$0'},
					'@default': ['identifier','delimiter']
				}
			}],
			
			
			
			
			
			
			
			
			
			
			
			
			
			[/\@[a-zA-Z_]\w*/,'variable.instance'],
			[/\$\w+\$/,'identifier.env'],
			[/\$\d+/,'identifier.special'],
			[/\$[a-zA-Z_]\w*/,'identifier.sys'],
			[/[A-Z][A-Za-z\d\-\_]*/,{token: 'identifier.const'}],
			[/[a-z_][A-Za-z\d\-\_]*/,{token: 'identifier'}],
			
			[/\(/,{token: 'paren.open',next: '@parens'}],
			
			
			{include: '@whitespace'},
			{include: '@tag'},
			{include: '@tag_singleton_ref'},
			
			
			[/### (javascript|compiles to)\:/,{token: 'comment',next: '@js_comment',nextEmbedded: 'text/javascript'}],
			
			{include: '@comments'},
			[/(\:)([\@\w\-\_]+)/,['symbol.start','symbol']],
			[/\$\d+/,'entity.special.arg'],
			[/\&/,'operator'],
			
			
			[/\/(?!\ )(?=([^\\\/]|\\.)+\/)/,{token: 'regexp.slash',bracket: '@open',next: '@regexp'}],
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			
			[/}/,{cases: {
				'$S2==interpolatedstring': {token: 'string',next: '@pop'},
				'@default': '@brackets'
			}}],
			[/[\{\}\(\)\[\]]/,'@brackets'],
			{include: '@operators'},
			
			
			{include: '@number'},
			
			[/[,]/,'delimiter.comma'],
			[/[.]/,'delimiter.dot'],
			
			[/"""/,'string','@herestring."""'],
			[/'''/,'string','@herestring.\'\'\''],
			[/"/,{cases: {'@eos': 'string','@default': {token: 'string',next: '@string."'}}}],
			[/'/,{cases: {'@eos': 'string','@default': {token: 'string',next: '@string.\''}}}]
		],
		js_comment: [
			[/###/,{token: 'comment',next: '@pop',nextEmbedded: '@pop'}]
		],
		
		string_start: [
			[/"""/,'string','@herestring."""'],
			[/'''/,'string','@herestring.\'\'\''],
			[/"/,{cases: {'@eos': 'string','@default': {token: 'string',next: '@string."'}}}],
			[/'/,{cases: {'@eos': 'string','@default': {token: 'string',next: '@string.\''}}}]
		],
		value: [
			{include: 'string_start'},
			{include: '@number'}
		],
		unspaced_expr: [
			[/([a-z]\w*)(\:)(?=\w)/,{
				cases: {
					'this:': ['variable.predefined.this','delimiter.access'],
					'self:': ['variable.predefined.self','delimiter.access'],
					'@default': ['identifier','delimiter.access']
				}
			}],
			
			[/(@ivar)(\:)(?=\w)/,[names.ivar,names.access]],
			[/(@constant)(\:)(?=\w)/,[names.constant,names.access]]
		],
		number: [
			[/\d+[eE]([\-+]?\d+)?/,'number.float'],
			[/\d+\.\d+([eE][\-+]?\d+)?/,'number.float'],
			[/0[xX][0-9a-fA-F]+/,'number.hex'],
			[/0[0-7]+(?!\d)/,'number.octal'],
			[/\d+/,'number']
		],
		operators: [
			[/@symbols/,{cases: {
				'@operators': 'operator',
				'@math': 'operator.math',
				'@logic': 'operator.logic',
				'@dot': 'operator.dot',
				'@default': 'delimiter'
			}}],
			[/\&\b/,'operator']
		],
		whitespace: [
			[/[ \t\r\n]+/,'white']
		],
		comments: [
			[/###/,'comment','@comment'],
			[/#(\s.*)?$/,'comment']
		],
		
		tag: [
			[/\<\>/,{token: 'tag.empty'}],
			[/(<)([a-z][a-z\-\d]*(?:\:[A-Za-z\-\d]+)?)/,['tag.open',{token: 'tag.name.tag-$2',next: '@tag_start'}]],
			[/(<)([A-Z][A-Za-z\-\d]*)/,['tag.open',{token: 'tag.name.local',next: '@tag_start'}]],
			[/(<)(?=[a-z\d\#\.\{\@])/,{token: 'tag.open',next: '@tag_start'}]
		],
		tag_singleton_ref: [
			[/\#(-*[a-zA-Z][\w\-]*)+/,'tag.singleton.ref']
		],
		tag_parts: [
			[/\#(-*[a-zA-Z][\w\-]*)/,'tag.id'],
			[/\.(-*[a-zA-Z][\w\-]*)/,'tag.class'],
			[/\@(-*[a-zA-Z][\w\-]*)/,'tag.iref'],
			[/[\#\.\@]\{/,{token: 'tag.interpolated.open',next: '@tag_inter'}]
		],
		tag_start: [
			[/[ \t\r\n]+/,{token: 'white',switchTo: '@tag_content'}],
			{include: 'tag_parts'},
			[/\[/,{token: 'tag.data.open',next: '@tag_data'}],
			[/[\=\-]?\>/,{token: 'tag.close',next: '@pop'}]
		],
		tag_inter: [
			['}',{token: 'tag.interpolated.close',next: '@pop'}],
			{include: 'body'}
		],
		tag_data: [
			[']',{token: 'tag.data.close',next: '@pop'}],
			{include: 'body'}
		],
		tag_content: [
			// [/(\:[a-zA-Z][\w\-]*)((?:\.[a-zA-Z][\w\-]*)+|)\s*(\=)\s*/, ['tag.attribute.listener','tag.attribute.modifier','tag.attribute'], '@tag_attr_value'],
			[/(\:[a-zA-Z][\w\-]*)((?:\.[a-zA-Z][\w\-]*)+)/,['tag.attribute.listener','tag.attribute.modifier']],
			
			[/(\:[a-zA-Z][\w\-]*)/,{token: 'tag.attribute.listener'}],
			
			[/([a-zA-Z\-][\w\-]*(\:[a-zA-Z][\w\-]*)?)/,{token: 'tag.attribute.name'}],
			
			
			
			{include: 'tag_parts'},
			{include: '@whitespace'},
			
			[/[\=\-]?\>/,{token: 'tag.close',next: '@pop'}],
			
			[/(\=)\s*/,{token: 'delimiter.eq.tag',next: '@tag_attr_value'}], 
			[/\(/,{token: 'paren.open.tag',next: '@tag_parens'}]
		],
		tag_attr_value: [
			[/(?=(\:?[\w]+\=))/,{token: '',next: '@pop'}],
			[/(?=(\>|\s))/,{token: '',next: '@pop'}],
			[/\(/,{token: 'paren.open',next: '@parens'}],
			[/\{/,{token: 'brace.open',next: '@braces'}],
			[/\[/,{token: 'bracket.open',next: '@brackets'}],
			{include: 'body'}
		
		
		
		],
		tag_parens: [
			[/\)/,{token: 'paren.close.tag',next: '@pop'}],
			[/(\))(\:?)/,['paren.close.tag','delimiter.colon'],'@pop'],
			{include: 'body'}
		],
		importstart: [
			[/^./,{token: '@rematch',next: '@pop'}],
			[/(from|as)/,{token: 'keyword.$1'}],
			[/[\{\}\,]/,{token: 'keyword'}],
			[/"""/,'string','@herestring."""'],
			[/'''/,'string','@herestring.\'\'\''],
			[/"/,{cases: {'@eos': 'string','@default': {token: 'string',next: '@string."'}}}],
			[/'/,{cases: {'@eos': 'string','@default': {token: 'string',next: '@string.\''}}}],
			[/[a-z_A-Z][A-Za-z\d\-\_]*/,{token: 'identifier.import'}]
		],
		
		parens: [
			[/\)/,{token: 'paren.close',next: '@pop'}],
			[/(\))(\:?)/,['paren.close','delimiter.colon'],'@pop'],
			{include: 'body'}
		],
		braces: [
			['}',{token: 'brace.close',next: '@pop'}],
			{include: 'body'}
		],
		brackets: [
			[']',{token: 'bracket.close',next: '@pop'}],
			{include: 'body'}
		],
		
		declstart: [
			[/^./,{token: '@rematch',next: '@pop'}],
			[/[A-Z][A-Za-z\d\-\_]*/,{token: 'identifier.decl.$S2'}],
			[/\./,{token: 'delimiter.dot'}],
			[/[a-z_][A-Za-z\d\-\_]*/,{token: 'identifier.decl.$S2'}],
			[/[ \t\<\>]+/,'operator.inherits string']
		],
		
		defstart: [
			[/(self)\./,{token: 'identifier.decl.def.self'}],
			[/@methodName/,{token: 'identifier.decl.def',next: '@pop'}],
			[/^./,{token: '@rematch',next: '@pop'}]
		],
		
		propstart: [
			[/@identifier/,{token: 'identifier.decl.$S2',next: '@pop'}],
			[/^./,{token: '@rematch',next: '@pop'}]
		],
		
		
		string: [
			[/[^"'\{\\]+/,'string'],
			[/@escapes/,'string.escape'],
			[/\./,'string.escape.invalid'],
			[/\./,'string.escape.invalid'],
			[/\{/,{cases: {'$S2=="': {token: 'string',next: 'root.interpolatedstring'},'@default': 'string'}}],
			[/["']/,{cases: {'$#==$S2': {token: 'string',next: '@pop'},'@default': 'string'}}],
			[/#/,'string']
		],
		herestring: [
			[/("""|''')/,{cases: {'$1==$S2': {token: 'string',next: '@pop'},'@default': 'string'}}],
			[/[^#\\'"\{]+/,'string'],
			[/['"]+/,'string'],
			[/@escapes/,'string.escape'],
			[/\./,'string.escape.invalid'],
			[/\{/,{cases: {'$S2=="""': {token: 'string',next: 'root.interpolatedstring'},'@default': 'string'}}],
			[/#/,'string']
		],
		comment: [
			[/[^#]+/,'comment'],
			[/###/,'comment','@pop'],
			[/#/,'comment']
		],
		hereregexp: [
			[/[^\\\/#]/,'regexp'],
			[/\\./,'regexp'],
			[/#.*$/,'comment'],
			['///[igm]*',{token: 'regexp',next: '@pop'}],
			[/\//,'regexp']
		],
		
		regexp: [
			[/(\{)(\d+(?:,\d*)?)(\})/,['regexp.escape.control','regexp.escape.control','regexp.escape.control']],
			[/(\[)(\^?)(?=(?:[^\]\\\/]|\\.)+)/,['regexp.escape.control',{token: 'regexp.escape.control',next: '@regexrange'}]],
			[/(\()(\?:|\?=|\?!)/,['regexp.escape.control','regexp.escape.control']],
			[/[()]/,'regexp.escape.control'],
			[/@regexpctl/,'regexp.escape.control'],
			[/[^\\\/]/,'regexp'],
			[/@regexpesc/,'regexp.escape'],
			[/\\\./,'regexp.invalid'],
			['/',{token: 'regexp.slash',bracket: '@close'},'@pop']
		],
		
		regexrange: [
			[/-/,'regexp.escape.control'],
			[/\^/,'regexp.invalid'],
			[/@regexpesc/,'regexp.escape'],
			[/[^\]]/,'regexp'],
			[/\]/,'regexp.escape.control','@pop']
		]
	}
};


/***/ }),
/* 53 */
/***/ (function(module, exports) {

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

exports.conf = {
	comments: {
		lineComment: '#',
		blockComment: ['=begin', '=end'],
	},
	brackets: [
		['(', ')'],
		['{', '}'],
		['[', ']']
	],
	autoClosingPairs: [
		{ open: '{', close: '}' },
		{ open: '[', close: ']' },
		{ open: '(', close: ')' },
		{ open: '"', close: '"' },
		{ open: '\'', close: '\'' },
	],
	surroundingPairs: [
		{ open: '{', close: '}' },
		{ open: '[', close: ']' },
		{ open: '(', close: ')' },
		{ open: '"', close: '"' },
		{ open: '\'', close: '\'' },
	]
};

/*
 * Ruby language definition
 *
 * Quite a complex language due to elaborate escape sequences
 * and quoting of literate strings/regular expressions, and
 * an 'end' keyword that does not always apply to modifiers like until and while,
 * and a 'do' keyword that sometimes starts a block, but sometimes is part of
 * another statement (like 'while').
 *
 * (1) end blocks:
 * 'end' may end declarations like if or until, but sometimes 'if' or 'until'
 * are modifiers where there is no 'end'. Also, 'do' sometimes starts a block
 * that is ended by 'end', but sometimes it is part of a 'while', 'for', or 'until'
 * To do proper brace matching we do some elaborate state manipulation.
 * some examples:
 *
 *   until bla do
 *     work until tired
 *     list.each do
 *       something if test
 *     end
 *   end
 *
 * or
 *
 * if test
 *  something (if test then x end)
 *  bar if bla
 * end
 *
 * or, how about using class as a property..
 *
 * class Test
 *   def endpoint
 *     self.class.endpoint || routes
 *   end
 * end
 *
 * (2) quoting:
 * there are many kinds of strings and escape sequences. But also, one can
 * start many string-like things as '%qx' where q specifies the kind of string
 * (like a command, escape expanded, regular expression, symbol etc.), and x is
 * some character and only another 'x' ends the sequence. Except for brackets
 * where the closing bracket ends the sequence.. and except for a nested bracket
 * inside the string like entity. Also, such strings can contain interpolated
 * ruby expressions again (and span multiple lines). Moreover, expanded
 * regular expression can also contain comments.
 */

exports.language = {
	tokenPostfix: '.ruby',

	keywords: [
		'__LINE__', '__ENCODING__', '__FILE__', 'BEGIN', 'END', 'alias', 'and', 'begin',
		'break', 'case', 'class', 'def', 'defined?', 'do', 'else', 'elsif', 'end',
		'ensure', 'for', 'false', 'if', 'in', 'module', 'next', 'nil', 'not', 'or', 'redo',
		'rescue', 'retry', 'return', 'self', 'super', 'then', 'true', 'undef', 'unless',
		'until', 'when', 'while', 'yield',
	],

	keywordops: [
		'::', '..', '...', '?', ':', '=>'
	],

	builtins: [
		'require', 'public', 'private', 'include', 'extend', 'attr_reader',
		'protected', 'private_class_method', 'protected_class_method', 'new'
	],

	// these are closed by 'end' (if, while and until are handled separately)
	declarations: [
		'module', 'class', 'def', 'case', 'do', 'begin', 'for', 'if', 'while', 'until', 'unless'
	],

	linedecls: [
		'def', 'case', 'do', 'begin', 'for', 'if', 'while', 'until', 'unless'
	],

	operators: [
		'^', '&', '|', '<=>', '==', '===', '!~', '=~', '>', '>=', '<', '<=', '<<', '>>', '+',
		'-', '*', '/', '%', '**', '~', '+@', '-@', '[]', '[]=', '`',
		'+=', '-=', '*=', '**=', '/=', '^=', '%=', '<<=', '>>=', '&=', '&&=', '||=', '|='
	],

	brackets: [
		{ open: '(', close: ')', token: 'delimiter.parenthesis' },
		{ open: '{', close: '}', token: 'delimiter.curly' },
		{ open: '[', close: ']', token: 'delimiter.square' }
	],

	// we include these common regular expressions
	symbols: /[=><!~?:&|+\-*\/\^%\.]+/,

	// escape sequences
	escape: /(?:[abefnrstv\\"'\n\r]|[0-7]{1,3}|x[0-9A-Fa-f]{1,2}|u[0-9A-Fa-f]{4})/,
	escapes: /\\(?:C\-(@escape|.)|c(@escape|.)|@escape)/,

	decpart: /\d(_?\d)*/,
	decimal: /0|@decpart/,

	delim: /[^a-zA-Z0-9\s\n\r]/,
	heredelim: /(?:\w+|'[^']*'|"[^"]*"|`[^`]*`)/,

	regexpctl: /[(){}\[\]\$\^|\-*+?\.]/,
	regexpesc: /\\(?:[AzZbBdDfnrstvwWn0\\\/]|@regexpctl|c[A-Z]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4})?/,


	// The main tokenizer for our languages
	tokenizer: {
		// Main entry.
		// root.<decl> where decl is the current opening declaration (like 'class')
		root: [
			// identifiers and keywords
			// most complexity here is due to matching 'end' correctly with declarations.
			// We distinguish a declaration that comes first on a line, versus declarations further on a line (which are most likey modifiers)
			[/^(\s*)([a-z_]\w*[!?=]?)/, ['white',
				{
					cases: {
						'for|until|while': { token: 'keyword.$2', next: '@dodecl.$2' },
						'@declarations': { token: 'keyword.$2', next: '@root.$2' },
						'end': { token: 'keyword.$S2', next: '@pop' },
						'@keywords': 'keyword',
						'@builtins': 'predefined',
						'@default': 'identifier'
					}
				}]],
			[/[a-z_]\w*[!?=]?/,
				{
					cases: {
						'if|unless|while|until': { token: 'keyword.$0x', next: '@modifier.$0x' },
						'for': { token: 'keyword.$2', next: '@dodecl.$2' },
						'@linedecls': { token: 'keyword.$0', next: '@root.$0' },
						'end': { token: 'keyword.$S2', next: '@pop' },
						'@keywords': 'keyword',
						'@builtins': 'predefined',
						'@default': 'identifier'
					}
				}],

			[/[A-Z][\w]*[!?=]?/, 'constructor.identifier'],     // constant
			[/\$[\w]*/, 'global.constant'],               // global
			[/@[\w]*/, 'namespace.instance.identifier'], // instance
			[/@@[\w]*/, 'namespace.class.identifier'],    // class

			// here document
			[/<<-(@heredelim).*/, { token: 'string.heredoc.delimiter', next: '@heredoc.$1' }],
			[/[ \t\r\n]+<<(@heredelim).*/, { token: 'string.heredoc.delimiter', next: '@heredoc.$1' }],
			[/^<<(@heredelim).*/, { token: 'string.heredoc.delimiter', next: '@heredoc.$1' }],


			// whitespace
			{ include: '@whitespace' },

			// strings
			[/"/, { token: 'string.d.delim', next: '@dstring.d."' }],
			[/'/, { token: 'string.sq.delim', next: '@sstring.sq' }],

			// % literals. For efficiency, rematch in the 'pstring' state
			[/%([rsqxwW]|Q?)/, { token: '@rematch', next: 'pstring' }],

			// commands and symbols
			[/`/, { token: 'string.x.delim', next: '@dstring.x.`' }],
			[/:(\w|[$@])\w*[!?=]?/, 'string.s'],
			[/:"/, { token: 'string.s.delim', next: '@dstring.s."' }],
			[/:'/, { token: 'string.s.delim', next: '@sstring.s' }],

			// regular expressions. Lookahead for a (not escaped) closing forwardslash on the same line
			[/\/(?=(\\\/|[^\/\n])+\/)/, { token: 'regexp.delim', next: '@regexp' }],

			// delimiters and operators
			[/[{}()\[\]]/, '@brackets'],
			[/@symbols/, {
				cases: {
					'@keywordops': 'keyword',
					'@operators': 'operator',
					'@default': ''
				}
			}],

			[/[;,]/, 'delimiter'],

			// numbers
			[/0[xX][0-9a-fA-F](_?[0-9a-fA-F])*/, 'number.hex'],
			[/0[_oO][0-7](_?[0-7])*/, 'number.octal'],
			[/0[bB][01](_?[01])*/, 'number.binary'],
			[/0[dD]@decpart/, 'number'],
			[/@decimal((\.@decpart)?([eE][\-+]?@decpart)?)/, {
				cases: {
					'$1': 'number.float',
					'@default': 'number'
				}
			}],

		],

		// used to not treat a 'do' as a block opener if it occurs on the same
		// line as a 'do' statement: 'while|until|for'
		// dodecl.<decl> where decl is the declarations started, like 'while'
		dodecl: [
			[/^/, { token: '', switchTo: '@root.$S2' }], // get out of do-skipping mode on a new line
			[/[a-z_]\w*[!?=]?/, {
				cases: {
					'end': { token: 'keyword.$S2', next: '@pop' }, // end on same line
					'do': { token: 'keyword', switchTo: '@root.$S2' }, // do on same line: not an open bracket here
					'@linedecls': { token: '@rematch', switchTo: '@root.$S2' }, // other declaration on same line: rematch
					'@keywords': 'keyword',
					'@builtins': 'predefined',
					'@default': 'identifier'
				}
			}],
			{ include: '@root' }
		],

		// used to prevent potential modifiers ('if|until|while|unless') to match
		// with 'end' keywords.
		// modifier.<decl>x where decl is the declaration starter, like 'if'
		modifier: [
			[/^/, '', '@pop'], // it was a modifier: get out of modifier mode on a new line
			[/[a-z_]\w*[!?=]?/, {
				cases: {
					'end': { token: 'keyword.$S2', next: '@pop' }, // end on same line
					'then|else|elsif|do': { token: 'keyword', switchTo: '@root.$S2' }, // real declaration and not a modifier
					'@linedecls': { token: '@rematch', switchTo: '@root.$S2' }, // other declaration => not a modifier
					'@keywords': 'keyword',
					'@builtins': 'predefined',
					'@default': 'identifier'
				}
			}],
			{ include: '@root' }
		],

		// single quote strings (also used for symbols)
		// sstring.<kind>  where kind is 'sq' (single quote) or 's' (symbol)
		sstring: [
			[/[^\\']+/, 'string.$S2'],
			[/\\\\|\\'|\\$/, 'string.$S2.escape'],
			[/\\./, 'string.$S2.invalid'],
			[/'/, { token: 'string.$S2.delim', next: '@pop' }]
		],

		// double quoted "string".
		// dstring.<kind>.<delim> where kind is 'd' (double quoted), 'x' (command), or 's' (symbol)
		// and delim is the ending delimiter (" or `)
		dstring: [
			[/[^\\`"#]+/, 'string.$S2'],
			[/#/, 'string.$S2.escape', '@interpolated'],
			[/\\$/, 'string.$S2.escape'],
			[/@escapes/, 'string.$S2.escape'],
			[/\\./, 'string.$S2.escape.invalid'],
			[/[`"]/, {
				cases: {
					'$#==$S3': { token: 'string.$S2.delim', next: '@pop' },
					'@default': 'string.$S2'
				}
			}]
		],

		// literal documents
		// heredoc.<close> where close is the closing delimiter
		heredoc: [
			[/^(\s*)(@heredelim)$/, {
				cases: {
					'$2==$S2': ['string.heredoc', { token: 'string.heredoc.delimiter', next: '@pop' }],
					'@default': ['string.heredoc', 'string.heredoc']
				}
			}],
			[/.*/, 'string.heredoc'],
		],

		// interpolated sequence
		interpolated: [
			[/\$\w*/, 'global.constant', '@pop'],
			[/@\w*/, 'namespace.class.identifier', '@pop'],
			[/@@\w*/, 'namespace.instance.identifier', '@pop'],
			[/[{]/, { token: 'string.escape.curly', switchTo: '@interpolated_compound' }],
			['', '', '@pop'], // just a # is interpreted as a #
		],

		// any code
		interpolated_compound: [
			[/[}]/, { token: 'string.escape.curly', next: '@pop' }],
			{ include: '@root' },
		],

		// %r quoted regexp
		// pregexp.<open>.<close> where open/close are the open/close delimiter
		pregexp: [
			{ include: '@whitespace' },
			// turns out that you can quote using regex control characters, aargh!
			// for example; %r|kgjgaj| is ok (even though | is used for alternation)
			// so, we need to match those first
			[/[^\(\{\[\\]/, {
				cases: {
					'$#==$S3': { token: 'regexp.delim', next: '@pop' },
					'$#==$S2': { token: 'regexp.delim', next: '@push' }, // nested delimiters are allowed..
					'~[)}\\]]': '@brackets.regexp.escape.control',
					'~@regexpctl': 'regexp.escape.control',
					'@default': 'regexp'
				}
			}],
			{ include: '@regexcontrol' },
		],

		// We match regular expression quite precisely
		regexp: [
			{ include: '@regexcontrol' },
			[/[^\\\/]/, 'regexp'],
			['/[ixmp]*', { token: 'regexp.delim' }, '@pop'],
		],

		regexcontrol: [
			[/(\{)(\d+(?:,\d*)?)(\})/, ['@brackets.regexp.escape.control', 'regexp.escape.control', '@brackets.regexp.escape.control']],
			[/(\[)(\^?)/, ['@brackets.regexp.escape.control', { token: 'regexp.escape.control', next: '@regexrange' }]],
			[/(\()(\?[:=!])/, ['@brackets.regexp.escape.control', 'regexp.escape.control']],
			[/\(\?#/, { token: 'regexp.escape.control', next: '@regexpcomment' }],
			[/[()]/, '@brackets.regexp.escape.control'],
			[/@regexpctl/, 'regexp.escape.control'],
			[/\\$/, 'regexp.escape'],
			[/@regexpesc/, 'regexp.escape'],
			[/\\\./, 'regexp.invalid'],
			[/#/, 'regexp.escape', '@interpolated'],
		],

		regexrange: [
			[/-/, 'regexp.escape.control'],
			[/\^/, 'regexp.invalid'],
			[/\\$/, 'regexp.escape'],
			[/@regexpesc/, 'regexp.escape'],
			[/[^\]]/, 'regexp'],
			[/\]/, '@brackets.regexp.escape.control', '@pop'],
		],

		regexpcomment: [
			[/[^)]+/, 'comment'],
			[/\)/, { token: 'regexp.escape.control', next: '@pop' }]
		],


		// % quoted strings
		// A bit repetitive since we need to often special case the kind of ending delimiter
		pstring: [
			[/%([qws])\(/, { token: 'string.$1.delim', switchTo: '@qstring.$1.(.)' }],
			[/%([qws])\[/, { token: 'string.$1.delim', switchTo: '@qstring.$1.[.]' }],
			[/%([qws])\{/, { token: 'string.$1.delim', switchTo: '@qstring.$1.{.}' }],
			[/%([qws])</, { token: 'string.$1.delim', switchTo: '@qstring.$1.<.>' }],
			[/%([qws])(@delim)/, { token: 'string.$1.delim', switchTo: '@qstring.$1.$2.$2' }],

			[/%r\(/, { token: 'regexp.delim', switchTo: '@pregexp.(.)' }],
			[/%r\[/, { token: 'regexp.delim', switchTo: '@pregexp.[.]' }],
			[/%r\{/, { token: 'regexp.delim', switchTo: '@pregexp.{.}' }],
			[/%r</, { token: 'regexp.delim', switchTo: '@pregexp.<.>' }],
			[/%r(@delim)/, { token: 'regexp.delim', switchTo: '@pregexp.$1.$1' }],

			[/%(x|W|Q?)\(/, { token: 'string.$1.delim', switchTo: '@qqstring.$1.(.)' }],
			[/%(x|W|Q?)\[/, { token: 'string.$1.delim', switchTo: '@qqstring.$1.[.]' }],
			[/%(x|W|Q?)\{/, { token: 'string.$1.delim', switchTo: '@qqstring.$1.{.}' }],
			[/%(x|W|Q?)</, { token: 'string.$1.delim', switchTo: '@qqstring.$1.<.>' }],
			[/%(x|W|Q?)(@delim)/, { token: 'string.$1.delim', switchTo: '@qqstring.$1.$2.$2' }],

			[/%([rqwsxW]|Q?)./, { token: 'invalid', next: '@pop' }], // recover
			[/./, { token: 'invalid', next: '@pop' }], // recover
		],

		// non-expanded quoted string.
		// qstring.<kind>.<open>.<close>
		//  kind = q|w|s  (single quote, array, symbol)
		//  open = open delimiter
		//  close = close delimiter
		qstring: [
			[/\\$/, 'string.$S2.escape'],
			[/\\./, 'string.$S2.escape'],
			[/./, {
				cases: {
					'$#==$S4': { token: 'string.$S2.delim', next: '@pop' },
					'$#==$S3': { token: 'string.$S2.delim', next: '@push' }, // nested delimiters are allowed..
					'@default': 'string.$S2'
				}
			}],
		],

		// expanded quoted string.
		// qqstring.<kind>.<open>.<close>
		//  kind = Q|W|x  (double quote, array, command)
		//  open = open delimiter
		//  close = close delimiter
		qqstring: [
			[/#/, 'string.$S2.escape', '@interpolated'],
			{ include: '@qstring' }
		],


		// whitespace & comments
		whitespace: [
			[/[ \t\r\n]+/, ''],
			[/^\s*=begin\b/, 'comment', '@comment'],
			[/#.*$/, 'comment'],
		],

		comment: [
			[/[^=]+/, 'comment'],
			[/^\s*=begin\b/, 'comment.invalid'],    // nested comment
			[/^\s*=end\b.*/, 'comment', '@pop'],
			[/[=]/, 'comment']
		],
	}
};


/***/ }),
/* 54 */
/***/ (function(module, exports) {

var language = exports.language = {
	tokenPostfix: '.js',
	
	keywords: [
		'boolean','break','byte','case','catch','char','class','const','continue','debugger',
		'default','delete','do','double','else','enum','export','extends','false','final',
		'finally','float','for','function','goto','if','implements','in',
		'instanceof','int','interface','long','native','new','null','package','private',
		'protected','public','return','short','static','super','switch','synchronized','this',
		'throw','throws','transient','true','try','typeof','var','void','volatile','while',
		'with','let','await','async'
	],
	
	builtins: [
		'define','require','window','document','undefined'
	],
	
	operators: [
		'=','>','<','!','~','?',':',
		'==','<=','>=','!=','&&','||','++','--',
		'+','-','*','/','&','|','^','%','<<',
		'>>','>>>','+=','-=','*=','/=','&=','|=',
		'^=','%=','<<=','>>=','>>>='
	],
	
	
	brackets: [
		{open: '(',close: ')',token: 'bracket.parenthesis'},
		{open: '{',close: '}',token: 'bracket.curly'},
		{open: '[',close: ']',token: 'bracket.square'}
	],
	
	
	symbols: /[~!@#%\^&*-+=|\\:`<>.?\/]+/,
	escapes: /\\(?:[btnfr\\"']|[0-7][0-7]?|[0-3][0-7]{2})/,
	exponent: /[eE][\-+]?[0-9]+/,
	
	regexpctl: /[(){}\[\]\$\^|\-*+?\.]/,
	regexpesc: /\\(?:[bBdDfnrstvwWn0\\\/]|@regexpctl|c[A-Z]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4})/,
	
	tokenizer: {
		root: [
			// identifiers and keywords
			[/([a-zA-Z_\$][\w\$]*)(\s*)(:?)/,{
				cases: {
					'$1==import': {token: 'keyword',next: '@import'}, 
					'$1@keywords': ['keyword','white','delimiter'],
					'$3': ['key.identifier','white','delimiter'], 
					'$1@builtins': ['predefined.identifier','white','delimiter'],
					'@default': ['identifier','white','delimiter']
				}
			}],
			
			
			{include: '@whitespace'},
			
			
			[/\/(?=([^\\\/]|\\.)+\/(?!\/))/,{token: 'regexp.slash',bracket: '@open',next: '@regexp'}],
			
			[/(<)([:\w]+)/,['start.delimiter.tag',{token: 'tag',next: '@tagContent'}]],
			
			
			[/[{}()\[\]]/,'@brackets'],
			[/[;,.]/,'delimiter'],
			[/@symbols/,{cases: {'@operators': 'operator','@default': ''}}],
			
			
			[/\d+\.\d*(@exponent)?/,'number.float'],
			[/\.\d+(@exponent)?/,'number.float'],
			[/\d+@exponent/,'number.float'],
			[/0[xX][\da-fA-F]+/,'number.hex'],
			[/0[0-7]+/,'number.octal'],
			[/\d+/,'number'],
			
			{include: '@strings'}
		],
		
		strings: [
			// strings: recover on non-terminated strings
			[/"([^"\\]|\\.)*$/,'string.invalid'], 
			[/'([^'\\]|\\.)*$/,'string.invalid'], 
			[/"/,'string','@string."'],
			[/'/,'string','@string.\'']
		],
		
		rootInBrace: [
			[/\}/,'delimiter','@pop'],
			{include: '@root'}
		],
		
		tagContent: [
			[/\/\s*>/,'delimiter','@pop'],
			[/>/,{token: 'end.delimiter.tag',switchTo: '@tagBody'}],
			[/"([^"]*)"/,'attribute.value'],
			[/'([^']*)'/,'attribute.value'],
			[/[\w\-]+/,'attribute.name'],
			[/\=/,'delimiter'],
			[/\{/,'delimiter','@rootInBrace'],
			{include: '@whitespace'}
		],
		
		tagBody: [
			[/\{/,'delimiter','@rootInBrace'],
			[/(<)([:\w]+)/,['start.delimiter.tag',{token: 'tag',next: '@tagContent'}]],
			[/(<\/)(\w+)(>)/,['delimiter','tag',{token: 'delimiter',next: '@pop'}]]
		],
		
		import: [
			[/;/,'delimiter','@pop'],
			[/^/,'white','@pop'],
			[/\b(from|as)\b/,'keyword'],
			{include: '@whitespace'},
			{include: '@strings'}
		],
		
		whitespace: [
			[/[ \t\r\n]+/,'white'],
			[/\/\*/,'comment','@comment'],
			[/\/\/.*$/,'comment']
		],
		
		comment: [
			[/[^\/*]+/,'comment'],
			
			[/\/\*/,'comment.invalid'],
			["\\*/",'comment','@pop'],
			[/[\/*]/,'comment']
		],
		
		string: [
			[/[^\\"']+/,'string'],
			[/@escapes/,'string.escape'],
			[/\\./,'string.escape.invalid'],
			[/["']/,{
				cases: {
					'$#==$S2': {token: 'string',next: '@pop'},
					'@default': 'string'
				}
			}]
		],
		
		
		regexp: [
			[/(\{)(\d+(?:,\d*)?)(\})/,['@brackets.regexp.escape.control','regexp.escape.control','@brackets.regexp.escape.control']],
			[/(\[)(\^?)(?=(?:[^\]\\\/]|\\.)+)/,['@brackets.regexp.escape.control',{token: 'regexp.escape.control',next: '@regexrange'}]],
			[/(\()(\?:|\?=|\?!)/,['@brackets.regexp.escape.control','regexp.escape.control']],
			[/[()]/,'@brackets.regexp.escape.control'],
			[/@regexpctl/,'regexp.escape.control'],
			[/[^\\\/]/,'regexp'],
			[/@regexpesc/,'regexp.escape'],
			[/\\\./,'regexp.invalid'],
			['/',{token: 'regexp.slash',bracket: '@close'},'@pop']
		],
		
		regexrange: [
			[/-/,'regexp.escape.control'],
			[/\^/,'regexp.invalid'],
			[/@regexpesc/,'regexp.escape'],
			[/[^\]]/,'regexp'],
			[/\]/,'@brackets.regexp.escape.control','@pop']
		]
	}
};


/***/ }),
/* 55 */
/***/ (function(module, exports) {

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
exports.conf = {
	wordPattern: /(#?-?\d*\.\d\w*%?)|((::|[@#.!:])?[\w-?]+%?)|::|[@#.!:]/g,

	comments: {
		blockComment: ['/*', '*/']
	},

	brackets: [
		['{', '}'],
		['[', ']'],
		['(', ')']
	],

	autoClosingPairs: [
		{ open: '{', close: '}', notIn: ['string', 'comment'] },
		{ open: '[', close: ']', notIn: ['string', 'comment'] },
		{ open: '(', close: ')', notIn: ['string', 'comment'] },
		{ open: '"', close: '"', notIn: ['string', 'comment'] },
		{ open: '\'', close: '\'', notIn: ['string', 'comment'] }
	],

	surroundingPairs: [
		{ open: '{', close: '}' },
		{ open: '[', close: ']' },
		{ open: '(', close: ')' },
		{ open: '"', close: '"' },
		{ open: '\'', close: '\'' }
	]
};

exports.language = {
	defaultToken: '',
	tokenPostfix: '.css',

	ws: '[ \t\n\r\f]*', // whitespaces (referenced in several rules)
	identifier: '-?-?([a-zA-Z]|(\\\\(([0-9a-fA-F]{1,6}\\s?)|[^[0-9a-fA-F])))([\\w\\-]|(\\\\(([0-9a-fA-F]{1,6}\\s?)|[^[0-9a-fA-F])))*',

	brackets: [
		{ open: '{', close: '}', token: 'delimiter.bracket' },
		{ open: '[', close: ']', token: 'delimiter.bracket' },
		{ open: '(', close: ')', token: 'delimiter.parenthesis' },
		{ open: '<', close: '>', token: 'delimiter.angle' }
	],

	tokenizer: {
		root: [
			{ include: '@selector' },
		],

		selector: [
			{ include: '@comments' },
			{ include: '@import' },
			{ include: '@strings' },
			['[@](keyframes|-webkit-keyframes|-moz-keyframes|-o-keyframes)', { token: 'keyword', next: '@keyframedeclaration' }],
			['[@](page|content|font-face|-moz-document)', { token: 'keyword' }],
			['[@](charset|namespace)', { token: 'keyword', next: '@declarationbody' }],
			['(url-prefix)(\\()', ['attribute.value', { token: 'delimiter.parenthesis', next: '@urldeclaration' }]],
			['(url)(\\()', ['attribute.value', { token: 'delimiter.parenthesis', next: '@urldeclaration' }]],
			{ include: '@selectorname' },
			['[\\*]', 'tag'], // selector symbols
			['[>\\+,]', 'delimiter'], // selector operators
			['\\[', { token: 'delimiter.bracket', next: '@selectorattribute' }],
			['{', { token: 'delimiter.bracket', next: '@selectorbody' }]
		],

		selectorbody: [
			{ include: '@comments' },
			['[*_]?@identifier@ws:(?=(\\s|\\d|[^{;}]*[;}]))', 'attribute.name', '@rulevalue'], // rule definition: to distinguish from a nested selector check for whitespace, number or a semicolon
			['}', { token: 'delimiter.bracket', next: '@pop' }]
		],

		selectorname: [
			['(\\.|#(?=[^{])|%|(@identifier)|:)+', 'tag'], // selector (.foo, div, ...)
		],

		selectorattribute: [
			{ include: '@term' },
			[']', { token: 'delimiter.bracket', next: '@pop' }],
		],

		term: [
			{ include: '@comments' },
			['(url-prefix)(\\()', ['attribute.value', { token: 'delimiter.parenthesis', next: '@urldeclaration' }]],
			['(url)(\\()', ['attribute.value', { token: 'delimiter.parenthesis', next: '@urldeclaration' }]],
			{ include: '@functioninvocation' },
			{ include: '@numbers' },
			{ include: '@name' },
			['([<>=\\+\\-\\*\\/\\^\\|\\~,])', 'delimiter'],
			[',', 'delimiter']
		],

		rulevalue: [
			{ include: '@comments' },
			{ include: '@strings' },
			{ include: '@term' },
			['!important', 'keyword'],
			[';', 'delimiter', '@pop'],
			['(?=})', { token: '', next: '@pop' }] // missing semicolon
		],

		warndebug: [
			['[@](warn|debug)', { token: 'keyword', next: '@declarationbody' }]
		],

		import: [
			['[@](import)', { token: 'keyword', next: '@declarationbody' }]
		],

		urldeclaration: [
			{ include: '@strings' },
			['[^)\r\n]+', 'string'],
			['\\)', { token: 'delimiter.parenthesis', next: '@pop' }]
		],

		parenthizedterm: [
			{ include: '@term' },
			['\\)', { token: 'delimiter.parenthesis', next: '@pop' }]
		],

		declarationbody: [
			{ include: '@term' },
			[';', 'delimiter', '@pop'],
			['(?=})', { token: '', next: '@pop' }] // missing semicolon
		],

		comments: [
			['\\/\\*', 'comment', '@comment'],
			['\\/\\/+.*', 'comment']
		],

		comment: [
			['\\*\\/', 'comment', '@pop'],
			[/[^*/]+/, 'comment'],
			[/./, 'comment'],
		],

		name: [
			['@identifier', 'attribute.value']
		],

		numbers: [
			['-?(\\d*\\.)?\\d+([eE][\\-+]?\\d+)?', { token: 'attribute.value.number', next: '@units' }],
			['#[0-9a-fA-F_]+(?!\\w)', 'attribute.value.hex']
		],

		units: [
			['(em|ex|ch|rem|vmin|vmax|vw|vh|vm|cm|mm|in|px|pt|pc|deg|grad|rad|turn|s|ms|Hz|kHz|%)?', 'attribute.value.unit', '@pop']
		],

		keyframedeclaration: [
			['@identifier', 'attribute.value'],
			['{', { token: 'delimiter.bracket', switchTo: '@keyframebody' }],
		],

		keyframebody: [
			{ include: '@term' },
			['{', { token: 'delimiter.bracket', next: '@selectorbody' }],
			['}', { token: 'delimiter.bracket', next: '@pop' }],
		],

		functioninvocation: [
			['@identifier\\(', { token: 'attribute.value', next: '@functionarguments' }],
		],

		functionarguments: [
			['\\$@identifier@ws:', 'attribute.name'],
			['[,]', 'delimiter'],
			{ include: '@term' },
			['\\)', { token: 'attribute.value', next: '@pop' }],
		],

		strings: [
			['~?"', { token: 'string', next: '@stringenddoublequote' }],
			['~?\'', { token: 'string', next: '@stringendquote' }]
		],

		stringenddoublequote: [
			['\\\\.', 'string'],
			['"', { token: 'string', next: '@pop' }],
			[/[^\\"]+/, 'string'],
			['.', 'string']
		],

		stringendquote: [
			['\\\\.', 'string'],
			['\'', { token: 'string', next: '@pop' }],
			[/[^\\']+/, 'string'],
			['.', 'string']
		]
	}
};


/***/ }),
/* 56 */
/***/ (function(module, exports) {

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
exports.conf = {
	comments: {
		lineComment: '#',
		blockComment: ['\'\'\'', '\'\'\''],
	},
	brackets: [
		['{', '}'],
		['[', ']'],
		['(', ')']
	],
	autoClosingPairs: [
		{ open: '{', close: '}' },
		{ open: '[', close: ']' },
		{ open: '(', close: ')' },
		{ open: '"', close: '"', notIn: ['string'] },
		{ open: '\'', close: '\'', notIn: ['string', 'comment'] },
	],
	surroundingPairs: [
		{ open: '{', close: '}' },
		{ open: '[', close: ']' },
		{ open: '(', close: ')' },
		{ open: '"', close: '"' },
		{ open: '\'', close: '\'' },
	]
};

exports.language = {
	defaultToken: '',
	tokenPostfix: '.python',

	keywords: [
		'and',
		'as',
		'assert',
		'break',
		'class',
		'continue',
		'def',
		'del',
		'elif',
		'else',
		'except',
		'exec',
		'finally',
		'for',
		'from',
		'global',
		'if',
		'import',
		'in',
		'is',
		'lambda',
		'None',
		'not',
		'or',
		'pass',
		'print',
		'raise',
		'return',
		'self',
		'try',
		'while',
		'with',
		'yield',

		'int',
		'float',
		'long',
		'complex',
		'hex',

		'abs',
		'all',
		'any',
		'apply',
		'basestring',
		'bin',
		'bool',
		'buffer',
		'bytearray',
		'callable',
		'chr',
		'classmethod',
		'cmp',
		'coerce',
		'compile',
		'complex',
		'delattr',
		'dict',
		'dir',
		'divmod',
		'enumerate',
		'eval',
		'execfile',
		'file',
		'filter',
		'format',
		'frozenset',
		'getattr',
		'globals',
		'hasattr',
		'hash',
		'help',
		'id',
		'input',
		'intern',
		'isinstance',
		'issubclass',
		'iter',
		'len',
		'locals',
		'list',
		'map',
		'max',
		'memoryview',
		'min',
		'next',
		'object',
		'oct',
		'open',
		'ord',
		'pow',
		'print',
		'property',
		'reversed',
		'range',
		'raw_input',
		'reduce',
		'reload',
		'repr',
		'reversed',
		'round',
		'set',
		'setattr',
		'slice',
		'sorted',
		'staticmethod',
		'str',
		'sum',
		'super',
		'tuple',
		'type',
		'unichr',
		'unicode',
		'vars',
		'xrange',
		'zip',

		'True',
		'False',

		'__dict__',
		'__methods__',
		'__members__',
		'__class__',
		'__bases__',
		'__name__',
		'__mro__',
		'__subclasses__',
		'__init__',
		'__import__'
	],

	brackets: [
		{ open: '{', close: '}', token: 'delimiter.curly' },
		{ open: '[', close: ']', token: 'delimiter.bracket' },
		{ open: '(', close: ')', token: 'delimiter.parenthesis' }
	],

	tokenizer: {
		root: [
			{ include: '@whitespace' },
			{ include: '@numbers' },
			{ include: '@strings' },

			[/[,:;]/, 'delimiter'],
			[/[{}\[\]()]/, '@brackets'],

			[/@[a-zA-Z]\w*/, 'tag'],
			[/[a-zA-Z]\w*/, {
				cases: {
					'@keywords': 'keyword',
					'@default': 'identifier'
				}
			}]
		],

		// Deal with white space, including single and multi-line comments
		whitespace: [
			[/\s+/, 'white'],
			[/(^#.*$)/, 'comment'],
			[/('''.*''')|(""".*""")/, 'string'],
			[/'''.*$/, 'string', '@endDocString'],
			[/""".*$/, 'string', '@endDblDocString']
		],
		endDocString: [
			[/\\'/, 'string'],
			[/.*'''/, 'string', '@popall'],
			[/.*$/, 'string']
		],
		endDblDocString: [
			[/\\"/, 'string'],
			[/.*"""/, 'string', '@popall'],
			[/.*$/, 'string']
		],

		// Recognize hex, negatives, decimals, imaginaries, longs, and scientific notation
		numbers: [
			[/-?0x([abcdef]|[ABCDEF]|\d)+[lL]?/, 'number.hex'],
			[/-?(\d*\.)?\d+([eE][+\-]?\d+)?[jJ]?[lL]?/, 'number']
		],

		// Recognize strings, including those broken across lines with \ (but not without)
		strings: [
			[/'$/, 'string.escape', '@popall'],
			[/'/, 'string.escape', '@stringBody'],
			[/"$/, 'string.escape', '@popall'],
			[/"/, 'string.escape', '@dblStringBody']
		],
		stringBody: [
			[/\\./, 'string'],
			[/'/, 'string.escape', '@popall'],
			[/.(?=.*')/, 'string'],
			[/.*\\$/, 'string'],
			[/.*$/, 'string', '@popall']
		],
		dblStringBody: [
			[/\\./, 'string'],
			[/"/, 'string.escape', '@popall'],
			[/.(?=.*")/, 'string'],
			[/.*\\$/, 'string'],
			[/.*$/, 'string', '@popall']
		]
	}
};


/***/ }),
/* 57 */
/***/ (function(module, exports) {

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const EMPTY_ELEMENTS = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr'];

exports.conf = {
	wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,

	comments: {
		blockComment: ['<!--', '-->']
	},

	brackets: [
		['<!--', '-->'],
		['<', '>'],
		['{', '}'],
		['(', ')']
	],

	autoClosingPairs: [
		{ open: '{', close: '}' },
		{ open: '[', close: ']' },
		{ open: '(', close: ')' },
		{ open: '"', close: '"' },
		{ open: '\'', close: '\'' }
	],

	surroundingPairs: [
		{ open: '"', close: '"' },
		{ open: '\'', close: '\'' },
		{ open: '{', close: '}' },
		{ open: '[', close: ']' },
		{ open: '(', close: ')' },
		{ open: '<', close: '>' },
	],

	onEnterRules: [
		{
			beforeText: new RegExp("<(?!(?:" + EMPTY_ELEMENTS.join('|') + "))([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$", 'i'),
			afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>$/i,
			action: { indentAction: 2 }
		},
		{
			beforeText: new RegExp("<(?!(?:" + EMPTY_ELEMENTS.join('|') + "))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$", 'i'),
			action: { indentAction: 1 }
		}
	],
};

exports.language = {
	defaultToken: '',
	tokenPostfix: '.html',
	ignoreCase: true,

	// The main tokenizer for our languages
	tokenizer: {
		root: [
			[/<!DOCTYPE/, 'metatag', '@doctype'],
			[/<!--/, 'comment', '@comment'],
			[/(<)((?:[\w\-]+:)?[\w\-]+)(\s*)(\/>)/, ['delimiter', 'tag', '', 'delimiter']],
			[/(<)(script)/, ['delimiter', { token: 'tag', next: '@script' }]],
			[/(<)(style)/, ['delimiter', { token: 'tag', next: '@style' }]],
			[/(<)((?:[\w\-]+:)?[\w\-]+)/, ['delimiter', { token: 'tag', next: '@otherTag' }]],
			[/(<\/)((?:[\w\-]+:)?[\w\-]+)/, ['delimiter', { token: 'tag', next: '@otherTag' }]],
			[/</, 'delimiter'],
			[/[^<]+/], // text
		],

		doctype: [
			[/[^>]+/, 'metatag.content'],
			[/>/, 'metatag', '@pop'],
		],

		comment: [
			[/-->/, 'comment', '@pop'],
			[/[^-]+/, 'comment.content'],
			[/./, 'comment.content']
		],

		otherTag: [
			[/\/?>/, 'delimiter', '@pop'],
			[/"([^"]*)"/, 'attribute.value'],
			[/'([^']*)'/, 'attribute.value'],
			[/[\w\-]+/, 'attribute.name'],
			[/=/, 'delimiter'],
			[/[ \t\r\n]+/], // whitespace
		],

		// -- BEGIN <script> tags handling

		// After <script
		script: [
			[/type/, 'attribute.name', '@scriptAfterType'],
			[/"([^"]*)"/, 'attribute.value'],
			[/'([^']*)'/, 'attribute.value'],
			[/[\w\-]+/, 'attribute.name'],
			[/=/, 'delimiter'],
			[/>/, { token: 'delimiter', next: '@scriptEmbedded', nextEmbedded: 'javascript' }],
			[/[ \t\r\n]+/], // whitespace
			[/(<\/)(script\s*)(>)/, ['delimiter', 'tag', { token: 'delimiter', next: '@pop' }]]
		],

		// After <script ... type
		scriptAfterType: [
			[/=/, 'delimiter', '@scriptAfterTypeEquals'],
			[/>/, { token: 'delimiter', next: '@scriptEmbedded', nextEmbedded: 'javascript' }], // cover invalid e.g. <script type>
			[/[ \t\r\n]+/], // whitespace
			[/<\/script\s*>/, { token: '@rematch', next: '@pop' }]
		],

		// After <script ... type =
		scriptAfterTypeEquals: [
			[/"([^"]*)"/, { token: 'attribute.value', switchTo: '@scriptWithCustomType.$1' }],
			[/'([^']*)'/, { token: 'attribute.value', switchTo: '@scriptWithCustomType.$1' }],
			[/>/, { token: 'delimiter', next: '@scriptEmbedded', nextEmbedded: 'javascript' }], // cover invalid e.g. <script type=>
			[/[ \t\r\n]+/], // whitespace
			[/<\/script\s*>/, { token: '@rematch', next: '@pop' }]
		],

		// After <script ... type = $S2
		scriptWithCustomType: [
			[/>/, { token: 'delimiter', next: '@scriptEmbedded.$S2', nextEmbedded: '$S2' }],
			[/"([^"]*)"/, 'attribute.value'],
			[/'([^']*)'/, 'attribute.value'],
			[/[\w\-]+/, 'attribute.name'],
			[/=/, 'delimiter'],
			[/[ \t\r\n]+/], // whitespace
			[/<\/script\s*>/, { token: '@rematch', next: '@pop' }]
		],

		scriptEmbedded: [
			[/<\/script/, { token: '@rematch', next: '@pop', nextEmbedded: '@pop' }],
			[/[^<]+/, '']
		],

		// After <style
		style: [
			[/type/, 'attribute.name', '@styleAfterType'],
			[/"([^"]*)"/, 'attribute.value'],
			[/'([^']*)'/, 'attribute.value'],
			[/[\w\-]+/, 'attribute.name'],
			[/=/, 'delimiter'],
			[/>/, { token: 'delimiter', next: '@styleEmbedded', nextEmbedded: 'text/css' }],
			[/[ \t\r\n]+/], // whitespace
			[/(<\/)(style\s*)(>)/, ['delimiter', 'tag', { token: 'delimiter', next: '@pop' }]]
		],

		// After <style ... type
		styleAfterType: [
			[/=/, 'delimiter', '@styleAfterTypeEquals'],
			[/>/, { token: 'delimiter', next: '@styleEmbedded', nextEmbedded: 'text/css' }], // cover invalid e.g. <style type>
			[/[ \t\r\n]+/], // whitespace
			[/<\/style\s*>/, { token: '@rematch', next: '@pop' }]
		],

		// After <style ... type =
		styleAfterTypeEquals: [
			[/"([^"]*)"/, { token: 'attribute.value', switchTo: '@styleWithCustomType.$1' }],
			[/'([^']*)'/, { token: 'attribute.value', switchTo: '@styleWithCustomType.$1' }],
			[/>/, { token: 'delimiter', next: '@styleEmbedded', nextEmbedded: 'text/css' }], // cover invalid e.g. <style type=>
			[/[ \t\r\n]+/], // whitespace
			[/<\/style\s*>/, { token: '@rematch', next: '@pop' }]
		],

		// After <style ... type = $S2
		styleWithCustomType: [
			[/>/, { token: 'delimiter', next: '@styleEmbedded.$S2', nextEmbedded: '$S2' }],
			[/"([^"]*)"/, 'attribute.value'],
			[/'([^']*)'/, 'attribute.value'],
			[/[\w\-]+/, 'attribute.name'],
			[/=/, 'delimiter'],
			[/[ \t\r\n]+/], // whitespace
			[/<\/style\s*>/, { token: '@rematch', next: '@pop' }]
		],

		styleEmbedded: [
			[/<\/style/, { token: '@rematch', next: '@pop', nextEmbedded: '@pop' }],
			[/[^<]+/, '']
		]
	}
};

/***/ }),
/* 58 */
/***/ (function(module, exports) {

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
exports.conf = {
	wordPattern: /(#?-?\d*\.\d\w*%?)|([@#!.:]?[\w-?]+%?)|[@#!.]/g,
	comments: {
		blockComment: ['/*', '*/'],
		lineComment: '//'
	},
	brackets: [
		['{', '}'],
		['[', ']'],
		['(', ')'],
	],
	autoClosingPairs: [
		{ open: '{', close: '}', notIn: ['string', 'comment'] },
		{ open: '[', close: ']', notIn: ['string', 'comment'] },
		{ open: '(', close: ')', notIn: ['string', 'comment'] },
		{ open: '"', close: '"', notIn: ['string', 'comment'] },
		{ open: '\'', close: '\'', notIn: ['string', 'comment'] },
	],
	surroundingPairs: [
		{ open: '{', close: '}' },
		{ open: '[', close: ']' },
		{ open: '(', close: ')' },
		{ open: '"', close: '"' },
		{ open: '\'', close: '\'' },
	]
};

exports.language = {
	defaultToken: '',
	tokenPostfix: '.less',

	identifier: '-?-?([a-zA-Z]|(\\\\(([0-9a-fA-F]{1,6}\\s?)|[^[0-9a-fA-F])))([\\w\\-]|(\\\\(([0-9a-fA-F]{1,6}\\s?)|[^[0-9a-fA-F])))*',
	identifierPlus: '-?-?([a-zA-Z:.]|(\\\\(([0-9a-fA-F]{1,6}\\s?)|[^[0-9a-fA-F])))([\\w\\-:.]|(\\\\(([0-9a-fA-F]{1,6}\\s?)|[^[0-9a-fA-F])))*',

	brackets: [
		{ open: '{', close: '}', token: 'delimiter.curly' },
		{ open: '[', close: ']', token: 'delimiter.bracket' },
		{ open: '(', close: ')', token: 'delimiter.parenthesis' },
		{ open: '<', close: '>', token: 'delimiter.angle' }
	],

	tokenizer: {
		root: [
			{ include: '@nestedJSBegin' },

			['[ \\t\\r\\n]+', ''],

			{ include: '@comments' },
			{ include: '@keyword' },
			{ include: '@strings' },
			{ include: '@numbers' },
			['[*_]?[a-zA-Z\\-\\s]+(?=:.*(;|(\\\\$)))', 'attribute.name', '@attribute'],

			['url(\\-prefix)?\\(', { token: 'tag', next: '@urldeclaration' }],

			['[{}()\\[\\]]', '@brackets'],
			['[,:;]', 'delimiter'],

			['#@identifierPlus', 'tag.id'],
			['&', 'tag'],

			['\\.@identifierPlus(?=\\()', 'tag.class', '@attribute'],
			['\\.@identifierPlus', 'tag.class'],

			['@identifierPlus', 'tag'],
			{ include: '@operators' },

			['@(@identifier(?=[:,\\)]))', 'variable', '@attribute'],
			['@(@identifier)', 'variable'],
			['@', 'key', '@atRules']
		],

		nestedJSBegin: [
			['``', 'delimiter.backtick'],
			['`', { token: 'delimiter.backtick', next: '@nestedJSEnd', nextEmbedded: 'text/javascript' }],
		],

		nestedJSEnd: [
			['`', { token: 'delimiter.backtick', next: '@pop', nextEmbedded: '@pop' }],
		],

		operators: [
			['[<>=\\+\\-\\*\\/\\^\\|\\~]', 'operator']
		],

		keyword: [
			['(@[\\s]*import|![\\s]*important|true|false|when|iscolor|isnumber|isstring|iskeyword|isurl|ispixel|ispercentage|isem|hue|saturation|lightness|alpha|lighten|darken|saturate|desaturate|fadein|fadeout|fade|spin|mix|round|ceil|floor|percentage)\\b', 'keyword']
		],

		urldeclaration: [
			{ include: '@strings' },
			['[^)\r\n]+', 'string'],
			['\\)', { token: 'tag', next: '@pop' }],
		],

		attribute: [
			{ include: '@nestedJSBegin' },
			{ include: '@comments' },
			{ include: '@strings' },
			{ include: '@numbers' },

			{ include: '@keyword' },

			['[a-zA-Z\\-]+(?=\\()', 'attribute.value', '@attribute'],
			['>', 'operator', '@pop'],
			['@identifier', 'attribute.value'],
			{ include: '@operators' },
			['@(@identifier)', 'variable'],

			['[)\\}]', '@brackets', '@pop'],
			['[{}()\\[\\]>]', '@brackets'],

			['[;]', 'delimiter', '@pop'],
			['[,=:]', 'delimiter'],

			['\\s', ''],
			['.', 'attribute.value']
		],

		comments: [
			['\\/\\*', 'comment', '@comment'],
			['\\/\\/+.*', 'comment'],
		],

		comment: [
			['\\*\\/', 'comment', '@pop'],
			['.', 'comment'],
		],

		numbers: [
			['(\\d*\\.)?\\d+([eE][\\-+]?\\d+)?', { token: 'attribute.value.number', next: '@units' }],
			['#[0-9a-fA-F_]+(?!\\w)', 'attribute.value.hex']
		],

		units: [
			['(em|ex|ch|rem|vmin|vmax|vw|vh|vm|cm|mm|in|px|pt|pc|deg|grad|rad|turn|s|ms|Hz|kHz|%)?', 'attribute.value.unit', '@pop']
		],

		strings: [
			['~?"', { token: 'string.delimiter', next: '@stringsEndDoubleQuote' }],
			['~?\'', { token: 'string.delimiter', next: '@stringsEndQuote' }]
		],

		stringsEndDoubleQuote: [
			['\\\\"', 'string'],
			['"', { token: 'string.delimiter', next: '@popall' }],
			['.', 'string']
		],

		stringsEndQuote: [
			['\\\\\'', 'string'],
			['\'', { token: 'string.delimiter', next: '@popall' }],
			['.', 'string']
		],

		atRules: [
			{ include: '@comments' },
			{ include: '@strings' },
			['[()]', 'delimiter'],
			['[\\{;]', 'delimiter', '@pop'],
			['.', 'key']
		]
	}
};


/***/ }),
/* 59 */
/***/ (function(module, exports) {

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
exportsconf = {
	comments: {
		blockComment: ['<!--', '-->'],
	},
	brackets: [
		['<', '>']
	],
	autoClosingPairs: [
		{ open: '<', close: '>' },
		{ open: '\'', close: '\'' },
		{ open: '"', close: '"' },
	],
	surroundingPairs: [
		{ open: '<', close: '>' },
		{ open: '\'', close: '\'' },
		{ open: '"', close: '"' },
	]
};

exports.language = {
	defaultToken: '',
	tokenPostfix: '.xml',

	ignoreCase: true,

	// Useful regular expressions
	qualifiedName: /(?:[\w\.\-]+:)?[\w\.\-]+/,

	tokenizer: {
		root: [
			[/[^<&]+/, ''],

			{ include: '@whitespace' },

			// Standard opening tag
			[/(<)(@qualifiedName)/, [
				{ token: 'delimiter' },
				{ token: 'tag', next: '@tag' }]],

			// Standard closing tag
			[/(<\/)(@qualifiedName)(\s*)(>)/, [
				{ token: 'delimiter' },
				{ token: 'tag' },
				'',
				{ token: 'delimiter' }]],

			// Meta tags - instruction
			[/(<\?)(@qualifiedName)/, [
				{ token: 'delimiter' },
				{ token: 'metatag', next: '@tag' }]],

			// Meta tags - declaration
			[/(<\!)(@qualifiedName)/, [
				{ token: 'delimiter' },
				{ token: 'metatag', next: '@tag' }]],

			// CDATA
			[/<\!\[CDATA\[/, { token: 'delimiter.cdata', next: '@cdata' }],

			[/&\w+;/, 'string.escape'],
		],

		cdata: [
			[/[^\]]+/, ''],
			[/\]\]>/, { token: 'delimiter.cdata', next: '@pop' }],
			[/\]/, '']
		],

		tag: [
			[/[ \t\r\n]+/, ''],
			[/(@qualifiedName)(\s*=\s*)("[^"]*"|'[^']*')/, ['attribute.name', '', 'attribute.value']],
			[/(@qualifiedName)(\s*=\s*)("[^">?\/]*|'[^'>?\/]*)(?=[\?\/]\>)/, ['attribute.name', '', 'attribute.value']],
			[/(@qualifiedName)(\s*=\s*)("[^">]*|'[^'>]*)/, ['attribute.name', '', 'attribute.value']],
			[/@qualifiedName/, 'attribute.name'],
			[/\?>/, { token: 'delimiter', next: '@pop' }],
			[/(\/)(>)/, [
				{ token: 'tag' },
				{ token: 'delimiter', next: '@pop' }]],
			[/>/, { token: 'delimiter', next: '@pop' }],
		],

		whitespace: [
			[/[ \t\r\n]+/, ''],
			[/<!--/, { token: 'comment', next: '@comment' }]
		],

		comment: [
			[/[^<\-]+/, 'comment.content'],
			[/-->/, { token: 'comment', next: '@pop' }],
			[/<!--/, 'comment.content.invalid'],
			[/[<\-]/, 'comment.content']
		],
	},
};


/***/ }),
/* 60 */
/***/ (function(module, exports) {

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

exports.conf = {
	// the default separators except `@$`
	wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
	comments: {
		lineComment: '//',
		blockComment: ['/*', '*/'],
	},
	brackets: [
		['{', '}'],
		['[', ']'],
		['(', ')'],
	],
	autoClosingPairs: [
		{ open: '{', close: '}' },
		{ open: '[', close: ']' },
		{ open: '(', close: ')' },
		{ open: '"', close: '"' },
		{ open: '\'', close: '\'' },
	],
	surroundingPairs: [
		{ open: '{', close: '}' },
		{ open: '[', close: ']' },
		{ open: '(', close: ')' },
		{ open: '"', close: '"' },
		{ open: '\'', close: '\'' },
		{ open: '<', close: '>' },
	]
};

exports.language = {
	defaultToken: '',
	tokenPostfix: '.java',

	keywords: [
		'abstract', 'continue', 'for', 'new', 'switch', 'assert', 'default',
		'goto', 'package', 'synchronized', 'boolean', 'do', 'if', 'private',
		'this', 'break', 'double', 'implements', 'protected', 'throw', 'byte',
		'else', 'import', 'public', 'throws', 'case', 'enum', 'instanceof', 'return',
		'transient', 'catch', 'extends', 'int', 'short', 'try', 'char', 'final',
		'interface', 'static', 'void', 'class', 'finally', 'long', 'strictfp',
		'volatile', 'const', 'float', 'native', 'super', 'while', 'true', 'false'
	],

	operators: [
		'=', '>', '<', '!', '~', '?', ':',
		'==', '<=', '>=', '!=', '&&', '||', '++', '--',
		'+', '-', '*', '/', '&', '|', '^', '%', '<<',
		'>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=',
		'^=', '%=', '<<=', '>>=', '>>>='
	],

	// we include these common regular expressions
	symbols: /[=><!~?:&|+\-*\/\^%]+/,
	escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
	digits: /\d+(_+\d+)*/,
	octaldigits: /[0-7]+(_+[0-7]+)*/,
	binarydigits: /[0-1]+(_+[0-1]+)*/,
	hexdigits: /[[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,

	// The main tokenizer for our languages
	tokenizer: {
		root: [
			// identifiers and keywords
			[/[a-zA-Z_$][\w$]*/, {
				cases: {
					'@keywords': { token: 'keyword.$0' },
					'@default': 'identifier'
				}
			}],

			// whitespace
			{ include: '@whitespace' },

			// delimiters and operators
			[/[{}()\[\]]/, '@brackets'],
			[/[<>](?!@symbols)/, '@brackets'],
			[/@symbols/, {
				cases: {
					'@operators': 'delimiter',
					'@default': ''
				}
			}],

			// @ annotations.
			[/@\s*[a-zA-Z_\$][\w\$]*/, 'annotation'],

			// numbers
			[/(@digits)[eE]([\-+]?(@digits))?[fFdD]?/, 'number.float'],
			[/(@digits)\.(@digits)([eE][\-+]?(@digits))?[fFdD]?/, 'number.float'],
			[/0[xX](@hexdigits)[Ll]?/, 'number.hex'],
			[/0(@octaldigits)[Ll]?/, 'number.octal'],
			[/0[bB](@binarydigits)[Ll]?/, 'number.binary'],
			[/(@digits)[fFdD]/, 'number.float'],
			[/(@digits)[lL]?/, 'number'],

			// delimiter: after number because of .\d floats
			[/[;,.]/, 'delimiter'],

			// strings
			[/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
			[/"/, 'string', '@string'],

			// characters
			[/'[^\\']'/, 'string'],
			[/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
			[/'/, 'string.invalid']
		],

		whitespace: [
			[/[ \t\r\n]+/, ''],
			[/\/\*\*(?!\/)/, 'comment.doc', '@javadoc'],
			[/\/\*/, 'comment', '@comment'],
			[/\/\/.*$/, 'comment'],
		],

		comment: [
			[/[^\/*]+/, 'comment'],
			// [/\/\*/, 'comment', '@push' ],    // nested comment not allowed :-(
			// [/\/\*/,    'comment.invalid' ],    // this breaks block comments in the shape of /* //*/
			[/\*\//, 'comment', '@pop'],
			[/[\/*]/, 'comment']
		],
		//Identical copy of comment above, except for the addition of .doc
		javadoc: [
			[/[^\/*]+/, 'comment.doc'],
			// [/\/\*/, 'comment.doc', '@push' ],    // nested comment not allowed :-(
			[/\/\*/, 'comment.doc.invalid'],
			[/\*\//, 'comment.doc', '@pop'],
			[/[\/*]/, 'comment.doc']
		],

		string: [
			[/[^\\"]+/, 'string'],
			[/@escapes/, 'string.escape'],
			[/\\./, 'string.escape.invalid'],
			[/"/, 'string', '@pop']
		],
	},
};


/***/ }),
/* 61 */
/***/ (function(module, exports) {

function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; };

var Theme = exports.Theme = {
	base: 'vs-dark', 
	inherit: false, 
	
	named: {
		background: '282f33',
		foreground: 'D4D4D4',
		keyword: 'ea9b80',
		operator: 'ea9b80',
		string: 'B7DE95',
		number: '598DA6',
		bool: '598DA6',
		symbol: 'B7DE95',
		regex: 'FD9231',
		regexgroup: 'FFB26D',
		comment: '5D6E7A',
		constant: 'BD9AC2',
		identifier: 'd4d4d4',
		xml: 'D9BB72',
		xmlref: 'd2845f',
		decl: '75AAFF',
		key: 'a7c9de',
		lineNumber: '3b4750',
		agentCursor: '89b0fc',
		localCursor: 'ffe796',
		lvar: 'dcdbc7',
		limport: '91b7ea',
		
		string: '7da4b7', 
		tagbase: 'D9BB73', 
		tagname: 'D9BB73',
		tagstr: 'a0c6ca',
		tagop: 'd17e53',
		tagbracket: '8e7f54',
		tagattr: 'D9BB73',
		tagmodifier: 'd99372',
		taglistener: 'd99372',
		special: 'ffdb59'
	
	
	
	
	},
	
	toMonaco: function() {
		var json = JSON.stringify(this);
		var named = this.named;
		json = json.replace(/@(\w+)/g,function(m,key) {
			return named[key] || m;
		});
		return JSON.parse(json);
	},
	
	toTheme: function() {
		var v_, $1;
		var theme = this.toMonaco();
		var colors = theme.tokenColors = [];
		for (let i = 0, items = iter$(theme.rules), len = items.length, rule; i < len; i++) {
			rule = items[i];
			if (!rule.foreground) { continue; };
			
			let item = {
				name: rule.token,
				scope: rule.token,
				settings: {
					foreground: '#' + rule.foreground
				}
			};
			colors.push(item);
		};
		
		(((v_ = theme.rules),delete theme.rules, v_));
		((($1 = theme.colors),delete theme.colors, $1));
		theme.type = 'dark';
		theme.name = "Imba Dark";
		return theme;
	},
	
	rules: [
		{token: '',foreground: '@foreground',background: '@background'},
		{token: 'invalid',foreground: 'f44747'},
		{token: 'emphasis',fontStyle: 'italic'},
		{token: 'strong',fontStyle: 'bold'},
		
		{token: 'variable',foreground: '74B0DF'},
		{token: 'variable.predefined',foreground: '@keyword'},
		{token: 'variable.parameter',foreground: '9CDCFE'},
		{token: 'identifier',foreground: '@identifier'},
		{token: 'identifier.const',foreground: '@constant'},
		{token: 'identifier.const.class',foreground: '@decl'},
		{token: 'identifier.class',foreground: '@decl'},
		{token: 'identifier.const.tag',foreground: '@decl'},
		{token: 'identifier.decl',foreground: '@decl'},
		{token: 'identifier.tag',foreground: '@decl'},
		{token: 'identifier.def',foreground: '@decl'},
		{token: 'identifier.key',foreground: '@key'},
		{token: 'identifier.env',foreground: '@keyword'},
		{token: 'identifier.special',foreground: '@special'},
		{token: 'identifier.import',foreground: '@limport'},
		{token: 'entity.name.type',foreground: '@decl'},
		{token: 'entity.name.function',foreground: '@decl'},
		{token: 'entity.name.tag',foreground: '@xml'},
		
		{token: 'storage.type.function',foreground: '@keyword'},
		{token: 'storage.type.class',foreground: '@keyword'},
		
		{token: 'comment',foreground: '@comment'},
		{token: 'operator',foreground: '@operator'},
		{token: 'number',foreground: '@number'},
		{token: 'number.hex',foreground: '@number'},
		{token: 'numeric.css',foreground: '@number'},
		{token: 'regexp',foreground: '@regex'},
		{token: 'regexp.escape',foreground: '@regexgroup'},
		{token: 'annotation',foreground: 'cc6666'},
		{token: 'type',foreground: '3DC9B0'},
		{token: 'boolean',foreground: '@bool'},
		
		{token: 'constant.numeric',foreground: '@number'},
		{token: 'constant.language.boolean',foreground: '@bool'},
		
		{token: 'delimiter',foreground: 'DCDCDC'},
		{token: 'delimiter.access.imba',foreground: 'DCDCDB'},
		{token: 'delimiter.html',foreground: '808080'},
		{token: 'delimiter.xml',foreground: '808080'},
		{token: 'delimiter.eq.tag',foreground: 'ea9b7c'},
		
		{token: 'tag',foreground: '@tagbase'},
		{token: 'tag.name',foreground: '@tagname'},
		{token: 'tag.open',foreground: '@tagbracket'},
		{token: 'tag.close',foreground: '@tagbracket'},
		{token: 'tag.attribute',foreground: '@tagattr'},
		{token: 'tag.attribute.listener',foreground: '@taglistener'},
		{token: 'tag.attribute.modifier',foreground: '@tagmodifier'},
		{token: 'paren.open.tag',foreground: '@taglistener'},
		{token: 'paren.close.tag',foreground: '@taglistener'},
		
		{token: 'meta.scss',foreground: 'A79873'},
		{token: 'meta.tag',foreground: '@xml'},
		{token: 'metatag',foreground: 'DD6A6F'},
		{token: 'metatag.content.html',foreground: '9CDCFE'},
		{token: 'metatag.html',foreground: '569CD6'},
		{token: 'metatag.xml',foreground: '569CD6'},
		{token: 'metatag.php',fontStyle: 'bold'},
		
		{token: 'key',foreground: '@key'},
		{token: 'string.key.json',foreground: '9CDCFE'},
		{token: 'string.value.json',foreground: 'CE9178'},
		
		{token: 'attribute.name',foreground: '@key'},
		{token: 'attribute.value',foreground: '@number'},
		{token: 'attribute.value.number.css',foreground: '@number'},
		{token: 'attribute.value.unit.css',foreground: '@number'},
		{token: 'attribute.value.hex.css',foreground: '@number'},
		
		{token: 'string',foreground: '@string'},
		{token: 'string.sql',foreground: '@string'},
		
		{token: 'keyword',foreground: '@keyword'},
		{token: 'keyword.flow',foreground: '@keyword'},
		{token: 'keyword.json',foreground: '@keyword'},
		{token: 'keyword.flow.scss',foreground: '@keyword'},
		
		{token: 'operator.scss',foreground: '909090'},
		{token: 'operator.sql',foreground: '778899'},
		{token: 'operator.swift',foreground: '909090'},
		{token: 'predefined.sql',foreground: 'FF00FF'},
		
		
		{token: "entity.name.selector.css",foreground: '@xml'},
		{token: "support.type.property-name.css",foreground: '@decl'},
		{token: "meta.object-literal.key",foreground: '@key'}
	],
	colors: {
		'foreground': '#@foreground',
		'editor.background': '#282f33',
		'editorGutter.background': '#282f33',
		'editor.selectionBackground': '#30455f', 
		'editorLineNumber.foreground': '#5D6E7A',
		'editorWidget.background': '#20262a',
		'editorWidget.border': '#20262a',
		'list.focusBackground': '#33393f',
		'list.hoverBackground': '#282f33',
		'list.highlightForeground': '#ffffff',
		'input.foreground': '#ffffff',
		'editorSuggestWidget.foreground': '#@foreground',
		'editorHoverWidget.background': '#20262a',
		'editorCursor.foreground': '#@agentCursor'
	}
};


/***/ })
/******/ ]);