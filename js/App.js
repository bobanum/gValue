/*jshint esnext:true, browser:true*/
/*exported App*/
class App {
	constructor() {
	}
	static addDependency(url, attributes) {
		var element, id;
		id = url.replace(/[^a-zA-Z0-9\_\-\.]/g, "_");
		if (this.dependencies[id] !== undefined) {
			return this.dependencies[id];
		}
		if (url.slice(-3) === ".js") {
			element = document.createElement("script");
			element.setAttribute("src", this.scriptPath + "/" + url);
		} else if (url.slice(-4) === ".css") {
			element = document.createElement("link");
			element.setAttribute("href", this.scriptPath + "/" + url);
			element.setAttribute("rel", "stylesheet");
		}
		element.setAttribute("id", id);
		this.setAttributes(element, attributes);
		this.dependencies[id] = element;
		document.head.appendChild(element);
		return this.dependencies[id];
	}
	/**
	 * Détermine le chemin actuel du script. Appelé une seule fois dans le init.
	 * @returns App   - La classe courante
	 */
	static setScriptPath() {
		this.scriptURL = document.head.lastChild.getAttribute('src');
		this.scriptPath = document.head.lastChild.getAttribute('src').split('/').slice(0,-1);
		if (this.scriptPath.length === 0) {
			this.scriptPath = ".";
		} else {
			this.scriptPath = this.scriptPath.join("/");
		}
		return this;
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
			url = url;
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
	 * @param   {string} url - L'adresse à analyser
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
			urlSearch = urlSearch;
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
		resultat = resultat.toString(26).split("").map(digit=>alpha[alpha.indexOf(digit)+10]).join("");
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
	static init() {
//		var self = this;
		this.dependencies = {};
		this.setScriptPath();
		var data=this.parseUrl(this.scriptURL).data;
		for (let k in data) {
			this.addDependency(k + ".js");
		}
		this.evt = {

		};
		window.addEventListener("load", function () {
		});
	}
}
App.init();
