/*jslint esnext:true, browser:true*/
/*globals App, DOMObject*/
/*exported Module*/
class Module extends DOMObject {
	constructor() {
		this._dom = null;
	}
	get dom() {
		if (!this._dom) {
			this._dom = this.dom_creer();
		}
		return this._dom;
	}
	dom_interface() {
		var resultat;
		resultat = document.createElement("div");
		resultat.classList.add("interface");
		return resultat;
	}
	dom_bouton(id, value, evts, attributes) {
		var resultat;

		resultat = document.createElement("input");
		resultat.setAttribute("id", id);
		resultat.setAttribute("type", "button");
		resultat.setAttribute("value", value);
		DOMObject.addEventListeners(resultat, evts);
		DOMObject.setAttributes(resultat, attributes);
		return resultat;
	}
	dom_creer() {
		var resultat;
		resultat = document.createElement("section");
		resultat.classList.add("module");
		resultat.appendChild(this.dom_header());
		resultat.appendChild(this.dom_footer());
		resultat.appendChild(this.dom_body());
		resultat.obj = this;
		return resultat;
	}
	dom_header(contenu) {
		this.header = document.createElement("header");
		if (contenu) {
			this.header.appendChild(contenu);
		}
		this.header.innerHTML = "dom_header";
		return this.header;
	}
	dom_footer(contenu) {
		this.footer = document.createElement("footer");
		if (contenu) {
			this.header.appendChild(contenu);
		}
		this.footer.innerHTML = "dom_footer";
		return this.footer;
	}
	dom_body(contenu) {
		this.body = document.createElement("div");
		this.body.classList.add("body");
		if (contenu) {
			this.header.appendChild(contenu);
		}
		this.body.innerHTML = "dom_body";
		return this.body;
	}
	dom_select(id, values, evts, selected, attributes) {
		var resultat = document.createElement("select");
		resultat.setAttribute("id", id);
		resultat.setAttribute("name", id);
		if (values instanceof Array) {
			values.forEach(function (e) {
				resultat.appendChild(this.dom_option(e, null, e === selected));
			}, this);
		} else {
			for (let k in values) {
				resultat.appendChild(this.dom_option(k, values[k], k === selected));
			}
		}
		DOMObject.addEventListeners(resultat, evts);
		DOMObject.setAttributes(resultat, attributes);
		return resultat;
	}
	dom_option(value, label, selected) {
		var resultat = document.createElement("option");
		if (selected) {
			resultat.setAttribute("selected", "selected");
		}
		if (value !== null) {
			resultat.setAttribute("value", value);
		}
		resultat.innerHTML = label;
		return resultat;
	}
	static init() {
		this.evt = {

		};
	}
}
Module.init();
