/*jslint browser:true, esnext:true*/
export default class Menu {
	constructor(label) {
		this.label = label;
		this.className = "";
		this.items = {};
		this._parentMenu = null;
		this.hideLabel = false;
	}
	get id() {
		return this.getAttribute("id");
	}
	set id(val) {
		this.setAttribute("id", val);	//Will also remove if undefined
	}
	get parentMenu() {
		return this._parentMenu;
	}
	set parentMenu(val) {
		if (this._parentMenu) {
			delete this._parentMenu.items[this.label];
			this._parentMenu = null;
			if (this._dom) {
				this._dom.classList.add("menu");
			}
		}
		if (val !== undefined) {
			this._parentMenu = val;
			val.items[this.label] = this;
			if (this._dom) {
				this._dom.classList.remove("menu");
			}
		}
	}
	dom_create() {
		var result;
		result = document.createElement("div");
		if (!this._parentMenu) {
			result.classList.add("menu");
		}
		this.dom_label(result);
		this.dom_items(result);
		return result;
	}
	dom_items(container) {
		var result;
		result = document.createElement("ul");
		for (let k in this.items) {
			let li;
			li = result.appendChild(document.createElement("li"));
			li.setAttribute("tabindex", "1");
			li.appendChild(this.items[k].dom);
			for (let k in this.evt.li) {
				li.addEventListener(k, this.evt.li[k]);
			}
		}
		if (result.childElementCount === 0) {
			return null;
		}
		if (container) {
			container.appendChild(result);
		}
		return result;
	}
	dom_label(container) {
		var result;
		result = document.createElement("span");
		if (!this.hideLabel) {
			result.innerHTML = this.label;
		}
		if (this.icon) {
			result.setAttribute("data-icon", this.icon);
		}
		if (this.hideLabel && !this.icon) {
			result.style.display = "none";
		}
		if (container) {
			container.appendChild(result);
		}
		result.classList.add("label");
		return result;
	}
	/**
	 * Creates a toolbar using icons from glyphter font
	 * @param   {object}      tools           The tools to add. {class:event}
	 * @param   {string}      [prefix="icon"] Prefix to the class
	 * @returns {HTMLElement} Nav element
	 */
	static dom_toolbar(tools, prefix) {
		var result;
		prefix = prefix || "icon";
		result = document.createElement("fieldset");
		result.classList.add("toolbar");
		result.appendChild(this.dom_toolbar_group(tools, prefix));
		return result;
	}
	/**
	 * Returns a div filled with tools
	 * @param   {object|Array} tools  The tools to display. If Array, creates another subgroup.
	 * @param   {string}       prefix Prefix to apply to the class (for the icon)
	 * @returns {HTMLElement}  The resulting element
	 * @private Is called by dom_toolbar
	 */
	static dom_toolbar_group(tools, prefix) {
		var result;
		result = document.createElement("div");
		result.classList.add("toolbar-group");
		if (tools instanceof Array) {
			tools.forEach((t)=>result.appendChild(this.dom_toolbar_group(t, prefix)));
		} else {
			for (let k in tools) {
				result.appendChild(this.dom_toolbar_tool(prefix + "-" + k, tools[k]));
			}
		}
		return result;
	}
	/**
	 * Returns a button of a toolbar
	 * @param   {string}      icon  The class of the button
	 * @param   {function}    click The "click" event
	 * @returns {HTMLElement} A <button> element
	 * @private Called by dom_toolbar_group
	 */
	static dom_toolbar_tool(icon, click) {
		var result;
		result = document.createElement("button");
		result.classList.add(icon);
		result.setAttribute("id", "btn_" + icon);
		if (click) {
			result.addEventListener("click", click);
		}
		return result;
	}
	static init() {
		this.prototype.evt = {
			li: {
				click: function() {
//					this.classList.add("active");
				},
				mouseout: function() {
//					this.classList.remove("active");
				}
			}
		};
	}
}
Menu.init();
