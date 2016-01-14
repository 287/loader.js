/*!===========================================
 * loader.js - a javascript sync module loader
 * by mrbrick@yinhe.org
 * MIT license
 * ===========================================*/
(function(){
	'use strict';
	var map = {}
	, define = function(arg1, arg2, arg3, arg4){
		var list = [arg1, arg2, arg3, arg4]
		, item = {}
		;
		each(list, function(arg, i){
			var type = typeOf(arg);
			switch(type){
				case 'string':
					item.name = arg;
				break; case 'array':
					item.requires = arg;
				break; case 'object':
					if(i==1){
						item.object = arg;
					}else{
						item.op = arg;
					}
				break; case 'function':
					if(i==0){
						preload(arg);
					}else{
						item.fn = arg;
					}
			}
		});
		setItem(item);
	}
	, require = function(name, fn){
		var nList = typeof name=='string' ? [name] : name
		, list = []
		;
		each(nList, function(k){
			list.push(getItem(k));
		});
		if(fn==null){
			return typeof name=='string' ? list[0] : list;
		}else if(typeof fn=='function'){
			fn.apply(null, list);
		}
	}
	, getItem = function(name){
		var name = name.toString().toLowerCase()
		, item = map[name]
		;
		if(!item){
			return false;
		}
		if(item.object){
			return item.object;
		}else{
			var list = []
			, object
			;
			each(item.requires, function(reqName){
				var reqName = reqName.toLowerCase()
				, req = getItem(reqName)
				;
				list.push(req);
			})
			object = item.fn.apply(null, list);
			if(item.op.cache){
				item.object = object;
			}
			return object;
		}
	}
	, setItem = function(op){
		var item = {name:'', requires:[], object:null, fn:null, op:{}}
		each(op, function(v, k){
			switch(k){
				case 'op':
					each(v, function(v2, k2){
						item.op[k2] = v2;
					});
				break; default:
					item[k] = v;
			}
		})
		if(item.name){
			item.name = item.name.toLowerCase()
			map[item.name] = item;
		}
	}
	, preload = function(fn){
		var exports = window
		, defined = {}
		, kList = []
		;
		for(var k in exports){
			kList.push(k);
		}
		fn.call(exports);
		for(var k in exports){
			if(kList.indexOf(k)>-1) continue ;
			defined[k] = exports[k];
			try{
				delete exports[k];
			}catch(e){
				exports[k] = undefined;
			}
		}
		each(defined, function(o, k){
			var name = k.toString().toLowerCase()
			;
			setItem({name:name, object:o});
		});
	}
	, typeOf = function(o){
		return Object.prototype.toString.call(o).match(/ (\w+)/)[1].toLowerCase();
	}
	, each = function(o, fn, type){
		var type = type || typeOf(o);
		switch(type){
			case 'object':
				for(var k in o){
					if(fn.call(o, o[k], k)===false){
						break;
					}
				}
			break; case 'array':
				for(var i=0, l=o.length; i<l; i++){
					if(fn.call(o, o[i], i)===false){
						break;
					}
				}
		}
	}
	;
	require.all = map;
	window.define = define;
	window.require = require;
})();