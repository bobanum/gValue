/*jslint browser:true, esnext:true*/
/*global GValue*/
class Critere {
	constructor() {
		this.id = GValue.creerId();
		this.titre = "";
		this._valeur = "";
		this.commentaires = {};
		this._criteres = {};
		this.critereParent = null;
	}
	get dom() {
		if (!this._dom) {
			this._dom = this.dom_creer();
			this._dom.obj = this;
		}
		return this._dom;
	}
	get criteres() {
		return this._criteres;
	}
	set criteres(val) {
		if (val instanceof Critere) {
			this.ajouterCritere(val);
		} else if (val instanceof Array) {
			val.forEach(critere => this.ajouterCritere(critere));
		} else if (typeof val === "object") {
			for (let k in val) {
				this.ajouterCritere(Critere.fromObject(val[k]), k);
			}
		}
	}
	get valeur() {
		if (this._valeur === null || this._valeur === "") {
			return this.valeurCriteres();
		} else {
			return this._valeur;
		}
	}
	set valeur(val) {
		this._valeur = val;
	}
	get modeEval() {
		return GValue.mode === GValue.MODE_EVALUATION;
	}
	dom_creer() {
		var resultat = document.createElement("div");
		resultat.classList.add("critere");
		resultat.setAttribute("id", "critere_" + this.id);
		resultat.appendChild(this.html_details());
		resultat.appendChild(this.html_criteres());
		resultat.appendChild(this.html_aides());
		return resultat;
	}
	dom_valeur() {
		var resultat;
		resultat = document.createElement("span");
		if (this.modeEval) {
			let input = resultat.appendChild(document.createElement("input"));
			input.setAttribute("type", "text");
			input.setAttribute("id", this.id);
			input.addEventListener("focus", this.evt.input_resultat.focus);
			input.obj = this;
			let span = resultat.appendChild(document.createElement("span"));
			span.innerHTML = "/" + this.valeur;
		} else {
			let input = resultat.appendChild(document.createElement("input"));
			input.setAttribute("type", "text");
			input.setAttribute("value", this.valeur);
		}
		return resultat;
	}
	html_echelle(max, nbVals) {
		var vals = this.echelle(max, nbVals);
		var resultat = document.createElement("span");
		resultat.classList.add("echelle");
		resultat.classList.add("clicables");
		vals.forEach(function (v) {
			let span = resultat.appendChild(document.createElement("span"));
			span.innerHTML = v;
		});
		return resultat;
	}
	html_choix(max, vals) {
		var nbVals = vals.length;
		var echelle = this.echelle(max, nbVals - 1);

		var resultat = document.createElement("span");
		resultat.classList.add("choix");
		resultat.classList.add("clicables");
		vals.forEach(function (v, i) {
			let span = resultat.appendChild(document.createElement("span"));
			span.innerHTML = v;
			span.setAttribute("data-valeur", echelle[i]);
			span.setAttribute("title", echelle[i]);
		});
		return resultat;
	}
	html_details() {
		var resultat = document.createElement("div");
		resultat.classList.add("details");
		resultat.appendChild(this.html_ligneDonnees("id"));
		resultat.appendChild(this.html_ligneDonnees("titre"));
		resultat.appendChild(this.html_ligneDonnees("valeur"));
		return resultat;
	}
	html_aides() {
		var resultat = document.createElement("div");
		resultat.classList.add("aides");
		if (this.type && this.type.startsWith("echelle")) {
			let nbVals = parseInt(this.type.slice(7));
			resultat.appendChild(this.html_echelle(this.valeur, nbVals));
		} else if (this.type && this.type.startsWith("choix")) {
			let vals = this.type.split(":")[1].split("|");
			resultat.appendChild(this.html_choix(this.valeur, vals));
		}
		resultat.appendChild(this.html_commentaires());
		return resultat;
	}
	html_commentaires() {
		var resultat = document.createElement("div");
		resultat.classList.add("commentaires");
		resultat.classList.add("clicables");
		let nouveau = resultat.appendChild(document.createElement("span"));
		let input = nouveau.appendChild(document.createElement("input"));
		input.setAttribute("placeholder", "Nouveau commentaire");
		for (let k in this.commentaires) {
			let span = resultat.appendChild(document.createElement("span"));
			span.setAttribute("id", k);
			span.innerHTML = this.commentaires[k];
		}
		return resultat;
	}
	valeurCriteres() {
		var resultat = 0;
		for (let k in this._criteres) {
			resultat += this._criteres[k].valeur;
		}
		return resultat;
	}
	echelle(max, nbVals) {
		nbVals = nbVals || max;
		var taux = (max / nbVals - 1) * (5 / 3) + 1;
		taux = 1 / Math.min(1.5, taux);
		var resultat = [];
		for (let i = 0; i <= nbVals; i += 1) {
			resultat.push(Math.round(max * Math.pow(i / nbVals, taux)));
		}
		return resultat;
	}
	ajouterCritere(critere, id) {
			if (!(critere instanceof Critere)) {
				critere = Critere.fromObject(critere);
			}
			critere.id = id || critere.id;
			this.criteres[critere.id] = critere;
			critere.critereParent = this;
			return critere;
		}
		/**
		 * Remplit l'instance des informations provenant d'un objet générique
		 * @param   {object}  obj L'objet contenant les données
		 * @returns {Critere} this
		 */
	fill(obj) {
		if (typeof obj !== "object") {
			return this;
		}
		for (let k in obj) {
			if (obj[k] === undefined) {
				delete this[k];
			} else {
				this[k] = obj[k];
			}
		}
		return this;
	}
	/**
	 * Retourne le label d'un certain champ. Regarde également dans les classes parent. Sinon, retourne le nom du champ.
	 * @param   {string} champ Le champ à utiliser
	 * @returns {strig}  Le label
	 */
	static label(champ) {
		var proto;
		if (this.labels[champ] !== undefined) {
			return this.labels[champ];
		} else if (proto = Object.getPrototypeOf(this), proto.label) {
			return proto.label(champ);
		} else {
			return champ;
		}
	}
	/**
	 * Retourne un élément HTML contenant un label et un contenu dans un div
	 * @param   {string}             champ   Le nom du champ à afficher
	 * @param   {HTMLElement|string} contenu Le contenu. Si le contenu est vide, on utilisera la valeur de la propriété.
	 * @returns {HTMLElement}        Un div
	 */
	html_ligneDonnees(champ, contenu) {
		var resultat = document.createElement("div");
		resultat.classList.add("champ-" + champ);
		var label = resultat.appendChild(document.createElement("span"));
		label.classList.add("label");
		label.innerHTML = this.constructor.label(champ);
		if (contenu === undefined) {
			if (this["dom_" + champ] !== undefined) {
				contenu = this["dom_" + champ]();
			} else if (this[champ] !== undefined) {
				contenu = this[champ];
			} else {
				contenu = champ;
			}
		}
		if (contenu instanceof HTMLElement) {
			resultat.appendChild(contenu);
		} else {
			var span = resultat.appendChild(document.createElement("span"));
			span.innerHTML = contenu;
		}
		return resultat;
	}
	html_criteres() {
		var resultat = document.createElement("div");
		resultat.classList.add("criteres");
		for (let k in this._criteres) {
			resultat.appendChild(this._criteres[k].dom);
		}
		return resultat;
	}
	activer() {
		debugger;
	}
	/**
	 * Retourne un nouvel objet avec les propriétés données sous d'objet
	 * @param   {object}  obj L'objet contenant les propriétés initiales de l'objet
	 * @returns {Critere} this
	 */
	static fromObject(obj) {
		var resultat = new this();
		resultat.fill(obj);
		return resultat;
	}
	static init() {
		this.labels = {
			id: "Id",
			titre: "Titre",
			criteres: "Critères",
			valeur: "Valeur"
		};
		this.prototype.evt = {
			input_resultat: {
				focus: function () {
					this.obj.activer();
				}
			}
		}
	}
}
Critere.init();
