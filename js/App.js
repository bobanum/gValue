/*jslint esnext:true, browser:true*/

/**
 * Classe représentant l'application
 */
class App {
	/**
	 * Ajoute une dépendance a l'application
	 * @param   {string|Array} url Le chemin vers le fichier à charger
	 * @returns {Promise}      Une promesse résolue lorsque toutes les promesses sont résolues
	 */
	static addDependency(url) {
		if (url instanceof Array) {
			return Promise.all(url.map(u => this.addDependency(u)));
		}
		App.log('Loading "' + url + '"');
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
			} else {
				throw "Mauvais type de fichier : '" + url + "'";
			}
			resolve(promise.then(element => {
				App.log('"' + url + '" loaded.');
				element.setAttribute("id", id);
				this.dependencies[id] = element;
			}));
			this.dependencies[id] = true;
		});
	}
	/**
	 * Ajoute une feuille de style externe à la page
	 * @param   {string}  url Le chemin vers le fichier
	 * @returns {Promise} Une promesse résolue lorsque le fichier est chargé
	 */
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
	/**
	 * Ajoute un script à la page
	 * @param   {string}  url    Le chemin vers la page
	 * @param   {boolean} module Détermine si le fichier doit être chargé comme un module [défaut:true]
	 * @returns {Promise} Une promesse résolue lorsque le fichier est chargé
	 */
	static addScript(url, module = true) {
		return new Promise(resolve => {
			var element;
			element = document.createElement("script");
			element.setAttribute("src", this.scriptPath(url));
			if (module) {
				element.setAttribute("type", "module");
			}
			element.addEventListener("load", e => {
				resolve(e.target);
			});
			document.head.appendChild(element);
		});
	}
	/**
	 * Détermine le chemin actuel du script. Appelé une seule fois dans le init.
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
	/**
	 * Retourne le chemin d'un fichier relatif à la page ayant intégré le script App.js
	 * @param   {string} url Le fichier à représenter. Si undefined, retourne le chemin brut vers la page.
	 * @returns {string} Une url
	 */
	static pagePath(url) {
		if (url === undefined) {
			return this._pathPage;
		}
		return this._pathPage + "/" + url;
	}
	/**
	 * Retourne le chemin d'un fichier relatif au script actuel (App.js)
	 * @param   {string} url Le fichier à représenter. Si undefined, retourne le chemin brut vers la page.
	 * @returns {string} Une url
	 */
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
	/**
	 * Retourne un id de caractères aléatoires
	 * @param   {string} prefixe   Un préfixe optionnel à apposer devant le id [défaut:""]
	 * @param   {number} amplitude Le nombre de caracteres excluant le préfixe [défaut: 5]
	 * @returns {string} Un id
	 */
	static creerId(prefixe = "", amplitude = 5) {
		var chars = "abcdefghijklmnopqrstuvwxyz0123456789";
		var l = chars.length;
		var resultat = prefixe;
		// Le premier caractère n'est pas un nombre
		resultat += chars[Math.floor(Math.random() * (l-10))];
		for (let i = 1; i < amplitude; i += 1) {
			resultat += chars[Math.floor(Math.random() * l)];
		}
		return resultat;
	}
	/**
	 * Retourne une version normalisée d'une chaine de caractères pouvant être untilisée en tant que id
	 * @param   {string} str La chaine à transformer
	 * @returns {string} Le id résultant
	 */
	static normaliserId(str) {
		return str
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

	/**
	 * Retourne une prommesse résolue lorsque la page est chargée ainsique toutes les dépendances
	 * @returns {Promise} La promesse de chargement
	 */
	static load() {
		return Promise.all([
			this.addDependency([
//				"../jsmenu/Menu.js",
//				"GValue.js",
			]),
			new Promise(resolve => {
				window.addEventListener("load", function () {
					App.log("window load");
					resolve();
				});
			}),
		]);
	}
	/**
	 * Règle les propriétés statiques de la classe.
	 */
	static init() {
		var debug = true;
		App.log = (debug) ? console.log : function () {};
		this.dependencies = {};
		this.setPaths();
		this.data = this.parseUrl(this.scriptURL).data;

		this.evt = {

		};
	}
}
App.init();
