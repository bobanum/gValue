/*jshint esnext:true, browser:true*/
class App {
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
	static addDependency(url) {
		if (url instanceof Array) {
			return Promise.all(url.map(u => this.addDependency(u)));
		}
		this.log('Loading "' + url + '"');
		return new Promise(resolve => {
			var id;
			id = url.replace(/[^a-zA-Z0-9\_\-\.]/g, "_");
			if (this.dependencies[id] !== undefined) {
				return resolve(this.dependencies[id]);
			}
			var promise;
			if (url.slice(-3) === ".js") {
				promise = this.addScript(url);
			} else if (url.slice(-4) === ".css") {
				promise = this.addStyle(url);
			}
			resolve(promise.then(element => {
				this.log('"'+url+'" loaded.');
				element.setAttribute("id", id);
				this.dependencies[id] = element;
			}));
			this.dependencies[id] = true;
		});
	}
	static addStyle(url) {
		return new Promise(resolve => {
			var element;
			element = document.createElement("link");
			element.setAttribute("href", this.scriptPath(url));
			element.setAttribute("rel", "stylesheet");
			element.addEventListener("load", e => {
				resolve(e.target);
			});
			document.head.appendChild(element);
		});
	}
	static addScript(url) {
		return new Promise(resolve => {
			var element;
			element = document.createElement("script");
			element.setAttribute("src", this.scriptPath(url));
			element.setAttribute("type", "module");
			element.addEventListener("load", e => {
				resolve(e.target);
			});
			document.head.appendChild(element);
		});
	}
	/**
	 * Détermine le chemin actuel du script. Appelé une seule fois dans le init.
	 * @returns App   - La classe courante
	 */
	static setPaths() {
		var dossierPage = window.location.href.split("/").slice(0, -1);
		this._pathPage = dossierPage.join("/");
		var src = document.currentScript.getAttribute("src").split("/").slice(0, -1);
		if (src.length > 0 && src[0] === "") {
			src[0] = dossierPage.slice(0, 3).join("/");
		}
		if (src.length === 0 || !src[0].startsWith("http")) {
			src = dossierPage.concat(src).filter(x => x !== ".");
			let idx;
			while (idx = src.indexOf(".."), idx > -1) {
				src.splice(idx - 1, 2);
			}
		}
		this._pathScript = src.join("/");
	}
	static pagePath(url) {
		if (url === undefined) {
			return this._pathPage;
		}
		return this._pathPage + "/" + url;
	}
	static scriptPath(url) {
		if (url === undefined) {
			return this._pathScript;
		}
		return this._pathScript + "/" + url;
	}
	/**
	 * Retourne un objet contenant les informations et données d'une adresse
	 * @param   {string} url - L'adresse à analyser
	 * @returns {object} - L'objet
	 */
	static parseUrl(url) {
		var resultat;
		resultat = {};
		if (url === undefined) {
			url = window.location.href;
		}
		try {
			url = decodeURI(url);
		} catch (err) {
			//url = url;
		}
		url = url.split("?");
		if (url.length > 1) {
			resultat.search = url.splice(1).join("?");
			resultat.data = this.parseSearch(resultat.search);
		}
		url = url[0];
		url = url.split("#");
		if (url.length > 1) {
			resultat.hash = url.splice(1).join("#");
			resultat.refs = resultat.hash.split(',');
		}
		if (url[0]) {
			resultat.href = url[0];
		}
		return resultat;
	}
	/**
	 * Retourne un objet contenant les informations et données d'une adresse
	 * @param   {string} urlSearch - L'adresse à analyser
	 * @returns {object} - L'objet
	 */
	static parseSearch(urlSearch) {
		var resultat, donnees, i, n, donnee, cle;
		resultat = {};
		if (urlSearch === undefined) {
			urlSearch = window.location.search;
		}
		if (!urlSearch) {
			return resultat;
		}
		try {
			urlSearch = decodeURI(urlSearch);
		} catch (err) {
			//urlSearch = urlSearch;
		}
		if (urlSearch[0] === "?") {
			urlSearch = urlSearch.substr(1);
		}
		if (urlSearch.trim() === "") {
			return resultat;
		}
		donnees = urlSearch.split("&");
		for (i = 0, n = donnees.length; i < n; i += 1) {
			donnee = donnees[i].split("=");
			if (donnee.length === 0) {
				continue;
			}
			cle = donnee.shift();
			donnee = donnee.join("=");
			if (resultat[cle] === undefined) {
				resultat[cle] = donnee;
			} else if (resultat instanceof Array) {
				resultat[cle].push(donnee);
			} else {
				resultat[cle] = [resultat[cle], donnee];
			}
		}
		return resultat;
	}
	static creerId(prefixe, amplitude) {
		amplitude = amplitude || 5;
		prefixe = prefixe || "";
		amplitude = Math.pow(10, amplitude);
		var resultat = new Date().getTime();
		resultat = resultat * amplitude + Math.floor(Math.random() * amplitude);
		var alpha = "0123456789abcdefghijklmnopqrstuvwxyz";
		resultat = resultat.toString(26).split("").map(digit => alpha[alpha.indexOf(digit) + 10]).join("");
		resultat = prefixe + resultat;
		return resultat;
	}
	static normaliserId(id) {
		return id
			.toLowerCase()
			.replace(/[áàâä]/g, 'a')
			.replace(/[éèêë]/g, 'e')
			.replace(/[íìîï]/g, 'i')
			.replace(/[óòôö]/g, 'o')
			.replace(/[úùûü]/g, 'u')
			.replace(/[ÿ]/g, 'y')
			.replace(/[ç]/g, 'c')
			.replace(/[^a-z0-9\-\_]+/g, '_')
			.replace(/_+/g, '_')
			.replace(/^[^a-z0-9]+|_$/g, '');
	}
	static load() {
		return Promise.all([
			this.addDependency([
				"../jsmenu/Menu.js",
				"GValue.js",
				"Critere.js",
				"Evaluation.js",
				"Eleve.js",
				"Resultat.js",
			]),
			new Promise(resolve => {
				window.addEventListener("load", function () {
					resolve("loaded");
				});
			}),
		]);
	}
	static init() {
		this.loaded = false;
		var debug = true;
		this.log = (debug) ? console.log : function () {};
		this.dependencies = {};
		this.setPaths();
		this.data = this.parseUrl(this.scriptURL).data;

		this.evt = {

		};
	}
}
App.init();
