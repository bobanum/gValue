/*jslint esnext:true, browser:true*/
class DOMObject {
	constructor() {
		this._dom = null;
	}
	get dom() {
		if (!this._dom) {
			this._dom = this.dom_create();
			this._dom.obj = this;
		}
		return this._dom;
	}
	dom_create() {
		var result = document.createElement("div");
		result.innerHTML = "Please overload";
		return result;
	}
	addEventListener(name, evt) {
		if (!evt) {
			return this;
		}
		if (name instanceof Array) {
			name.forEach((n)=>this.addEventListener(n, evt));
		} else {
			this.dom.addEventListener(name, evt);
		}
		return this;
	}
	addEventListeners(evts) {
		for (let k in evts) {
			this.addEventListener(k, evts[k]);
		}
		return this;
	}
	static forEach(obj, fct, thisArg) {
		thisArg = thisArg || this;
		for (let k in obj) {
			fct.call(thisArg, k, obj[k]);
		}
		return thisArg;
	}
	static addEventListeners(obj, evts) {
		for (let k in evts) {
			obj.addEventListener(k, evts[k]);
		}
		return obj;
	}
	static setAttribute(element, name, value) {
		if (value === undefined) {
			element.removeAttribute(name);
		} else {
			element.setAttribute(name, value);
		}
		return this;
	}
	static setAttributes(element, attributes) {
		if (!attributes) {
			return this;
		}
		for (let k in attributes) {
			element.setAttribute(k, attributes[k]);
		}
		return this;
	}
	static walk(obj, fct, thisArg) {
		var k;
		thisArg = thisArg || obj;
		for (k in obj) {
			fct.call(thisArg, k, obj[k]);
		}
		return this;
	}
	/**
	 * Redirects method from object to its DOM
	 * @param   {string|Array} method - The method to redirect
	 * @returns {this}
	 */
	addFacade(method) {
		if (method instanceof Array) {
			return method.forEach((m) => this.addFacade(m));
		}
		this[method] = function () {
			debugger;
			return this.dom[method].apply(this.dom, arguments);
		};
		return this;
	}
	static addFacade(method) {
		if (method instanceof Array) {
			return method.forEach((m) => this.addFacade(m));
		}
		this.prototype[method] = function () {
			return this.constructor[method].apply(this, [].concat.apply([this], arguments));
		};
	}
	static init() {
		this.addFacade(["setAttributes"]);
		this.prototype.addFacade(["removeAttribute", "getAttribute", "setAttribute"]);
//		this.addEventListener
	}
}
DOMObject.init();
