/*jslint browser:true, esnext:true*/
/*global App */
import {
	GValue
} from "./GValue.js";

/**
 * Représente un critere de correction
 * @todo EN GÉNÉRAL Utiliser Map.
 */
export class Critere {
	/**
	 * Constructeur
	 */
	constructor() {
		/**
		 * Le id du critere
		 * @type {string}
		 */
		this.id = App.creerId();
		/** Le titre */
		this.titre = "";
		/**
		 * Dom du input
		 * @type {HTMLElement}
		 */
		this._dom_valeur = null;
		this._valeur = "";
		this._commentaires = {};
		this._criteres = {};
		/** Le critere parent
		 * @type {Critere} */
		this.critereParent = null;
	}
	/**
	 * Le DOM principal du critère
	 * @type {HTMLElement}
	 */
	get dom() {
		if (this._dom) {
			return this._dom;
		}
		var resultat = document.createElement("div");
		resultat.classList.add("critere");
		resultat.setAttribute("id", "critere_" + this.id);
		resultat.appendChild(this.html_details());
		resultat.appendChild(this.html_aides());
		resultat.appendChild(this.html_criteres());
		resultat.obj = this;
		this._dom = resultat;
		return this._dom;
	}
	/**
	 * Les (sous-)criteres rattachés au critere
	 * @type {Map<string, Critere>}
	 */
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
				val[k].id = k;
				this.ajouterCritere(val[k]);
			}
		} else {
			throw "Mauvaise valeur pour Critere";
		}
	}
	/**
	 * La valeur fnale du critère (sur combien le critère sera évalué). S'il est nul, on calcul les sous-criteres.
	 * @type {number}
	 */
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
	/**
	 * @type {integer}
	 * @todo Utiliser Map
	 */
	get length() {
		return Object.keys(this.criteres).length;
	}
	/**
	 * @type {HTMLElement}
	 */
	get dom_valeur() {
		var resultat;
		if (this._dom_valeur) {
			return this._dom_valeur;
		}
		resultat = document.createElement("input");
		resultat.setAttribute("type", "text");
		resultat.setAttribute("id", "resultat_" + this.id);
		resultat.setAttribute("tabindex", 1);
		var evts = this.evt.input_resultat;
		for (let k in evts) {
			resultat.addEventListener(k, evts[k]);
		}
		resultat.obj = this;
		resultat.setAttribute("value", this.valeur);
		this._dom_valeur = resultat;
		this._dom_valeur.obj = this;
		return resultat;
	}
	/**
	 * Retourne un tableau récursif des sous-criteres
	 * @returns {Critere[]} - Un tableau de critères
	 * @todo Utiliser Map
	 */
	inventaireCriteres() {
		var resultat = [];
		for (let k in this._criteres) {
			resultat.push(this._criteres[k]);
			resultat.push(...this._criteres[k].inventaireCriteres());
		}
		return resultat;
	}
	/**
	 * Retourne l'élément DOM d'une aleur
	 * @returns {HTMLElement} - Un span avec un input et un span
	 */
	html_valeur() {
		var resultat, input;
		resultat = document.createElement("span");
		resultat.classList.add("valeur");
		input = resultat.appendChild(this.dom_valeur);
		if (App.mode === App.MODE_EVALUATION) {
			let span = resultat.appendChild(document.createElement("span"));
			span.innerHTML = "/" + this.valeur;
		}
		return resultat;
	}
	/**
	 * Retourne un élément span contenant une série de boutons qui répondent aux événements donnés
	 * @param   {Map}         boutons - Un objet Map avec les valeurs et les étiquettes des boutons
	 * @param   {object}      evts    - Un objet contenant les événements à appliquer à chaque bouton
	 * @returns {HTMLElement} - Un élément span.cliquables>span
	 */
	html_cliquables(boutons, evts = {}) {
		var resultat = document.createElement("span");
		resultat.classList.add("cliquables");
		boutons.forEach((valeur, etiquette) => {
			let span = resultat.appendChild(document.createElement("span"));
			span.innerHTML = etiquette;
			span.obj = this;
			if (valeur !== undefined) {
				span.setAttribute("data-valeur", valeur);
				span.setAttribute("title", valeur);
			}
			for (let e in evts) {
				span.addEventListener(e, evts[e]);
			}
		});
		return resultat;
	}
	/**
	 * Retourne un élément HTML représentant une échelle de valeurs
	 * @param   {number[]}    vals - Un tableau de valeurs (créé habituellement par {@link Critere#echelle})
	 * @returns {HTMLElement} - Un élément span créé par {@link Critere#html_cliquables}
	 */
	html_echelle(vals) {
		var valeurs = new Map();
		vals.forEach(val => {
			let cles = Math.round(100 * val) / 100;
			cles = cles.toString()
				.replace(/\.25$/, "&frac14;")
				.replace(/\.33$/, "&frac13;")
				.replace(/\.5$/, "&frac12;")
				.replace(/\.66$/, "&frac23;")
				.replace(/\.67$/, "&frac23;")
				.replace(/\.75$/, "&frac34;");
			valeurs.set(cles, val);
		});
		var resultat = this.html_cliquables(valeurs, this.evt.choix);
		resultat.classList.add("echelle");
		return resultat;
	}
	/**
	 * Retourne un élément cliquable d'une série d'étiquettes ayant une certaine valeur
	 * @param   {number}      max  - La valeur maximale
	 * @param   {string[]}    vals - Une série d'étiquettes en ordre croissant
	 * @returns {HTMLElement} - Un élément créé pas {@link html_cliquables}
	 */
	html_choix(max, vals) {
		var nbVals = vals.length;
		var echelle = this.echelle(max, nbVals - 1);
		var valeurs = new Map();
		vals.forEach(function (cle, i) {
			valeurs.set(cle, echelle[i]);
		}, this);
		var resultat = this.html_cliquables(valeurs, this.evt.choix);
		resultat.classList.add("choix");
		return resultat;
	}
	/**
	 * Retourne un élément HTML permettant de choisir "tout" ou "rien"
	 * @returns {HTMLElement} - Un élément créé pas {@link html_cliquables}
	 */
	html_toutrien() {
		var valeurs = new Map([["Tout"], ["Rien"]]);
		var resultat = this.html_cliquables(valeurs, this.evt.toutrien);
		resultat.classList.add("boutons");
		return resultat;
	}
	/**
	 * Retorune une élément HTML div contenant les détails du criteres
	 * @returns {HTMLElement} - Un élément div.details
	 */
	html_details() {
		var resultat = document.createElement("div");
		resultat.classList.add("details");
		resultat.appendChild(this.html_titre());
		resultat.appendChild(this.html_valeur());
		return resultat;
	}
	/**
	 * Retourne un élément HTML label contenant le titre du critère
	 * @returns {HTMLElement} - L'élément permettane d'afficher le titre
	 */
	html_titre() {
		var resultat = document.createElement("label");
		resultat.setAttribute("for", "resultat_" + this.id);
		resultat.innerHTML = this.titre;
		return resultat;
	}
	/**
	 * Retourne un élément HTML div contenant les aides à la correction : cliquables, comentaires...
	 * @returns {HTMLElement} - Un élément div.aides
	 */
	html_aides() {
		var resultat = document.createElement("div");
		resultat.classList.add("aides");
		if (this.type && this.type.startsWith("echelle")) {
			let nbVals = parseInt(this.type.slice(7));
			let vals = this.echelle(this.valeur, nbVals);
			resultat.appendChild(this.html_echelle(vals));
		} else if (this.type && this.type.startsWith("choix")) {
			let vals = this.type.split(":")[1].split("|");
			resultat.appendChild(this.html_choix(this.valeur, vals));
		} else if (this.length > 0) {
			resultat.appendChild(this.html_toutrien());
		}
		resultat.appendChild(this.html_commentaires());
		return resultat;
	}
	/**
	 * Retourne un élément HTML div permettant d'afficher et d'ajouter les commentaires
	 * @returns {HTMLElement} - Un élément div.commentaires.cliquables>span
	 */
	html_commentaires() {
		var resultat = document.createElement("div");
		resultat.classList.add("commentaires");
		resultat.classList.add("cliquables");
		let nouveau = resultat.appendChild(document.createElement("span"));
		let input = nouveau.appendChild(document.createElement("input"));
		input.setAttribute("placeholder", "Nouveau commentaire");
		input.obj = this;
		input.addEventListener("focus", this.evt.input_resultat.focus);
		input.addEventListener("blur", this.evt.input_resultat.blur);
		input.addEventListener("blur", this.evt.input_commentaire.blur);
		for (let k in this.commentaires) {
			let span = resultat.appendChild(document.createElement("span"));
			span.setAttribute("id", k);
			span.innerHTML = this.commentaires[k];
			span.addEventListener("click", this.evt.commentaire.click);
		}
		return resultat;
	}
	/**
	 * Retourne la somme des valeurs des sous-criteres
	 * @returns {number} - Une somme de valeurs
	 * @todo Utiliser Map
	 */
	valeurCriteres() {
		var resultat = 0;
		for (let k in this._criteres) {
			resultat += this._criteres[k].valeur;
		}
		return resultat;
	}
	/**
	 * Retourne un array composé d'une série de valeurs ordonnées allant de 0 à max. La distribution des valeurs intermédiaires est logarithmique au besoin.
	 * @param   {number}   max       - La maleur maximale à attribuer à l'échelle
	 * @param   {integer}  nbVals    - Le nombre de valeurs à retourner. Par défaut, on retourne le même nombre de valeurs que le max.
	 * @param   {number}   divisions - Le niveau de précision. Par défaut, il est calculé en fonction des autres valeurs fournies.
	 * @returns {number[]} - Un tableau de longueur nbVals.
	 */
	echelle(max, nbVals, divisions) {
		nbVals = nbVals || max;
		divisions = divisions || Math.ceil(nbVals / max);
		var taux = (max * divisions / nbVals - 1) * (5 / 3) + 1;
		taux = 1 / Math.min(1.5, taux);
		var resultat = [];
		for (let i = 0; i <= nbVals; i += 1) {
			resultat.push(this.echelon(max, i / nbVals, taux, divisions));
		}
		return resultat;
	}
	/**
	 * Retourne un des échelons d'une échelle tenant compte de la fonction logarithmique.
	 * @param   {number} max       - Ma valeur maximale de l'échelle
	 * @param   {number} portion   - La portion de l'échelle à représenter [0-1]
	 * @param   {number} taux      - Le niveau de logarithmie à appliquer
	 * @param   {number} divisions - Le niveau de précision (décimales) ex.: 2 affichera des demis
	 * @returns {num}    - Un nombre compris entre 0 et max
	 */
	echelon(max, portion, taux = 1, divisions = 1) {
		var resultat = max * Math.pow(portion, taux);
		resultat = Math.round(divisions * resultat) / divisions;
		return resultat;
	}
	/**
	 * Ajoute un sous-critere
	 * @param   {object}   critere [[Description]]
	 * @param   {[[Type]]} id      [[Description]]
	 * @returns {[[Type]]} [[Description]]
	 */
	ajouterCritere(critere) {
		critere = Critere.from(critere);
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
		this.champsArray.forEach(prop => {
			if (prop in obj) {
				if (obj[prop] === undefined) {
					delete this[prop];
				} else {
					this[prop] = obj[prop];
				}
			}
		});
		return this;
	}
	/**
	 * Retourne un objet générique avec toutes les informations du critère
	 * @returns {object} - L'objet résultant
	 */
	toJson() {
		var resultat = {};
		this.champsArray.forEach(prop => {
			var val;
			if ("_" + prop in this) {
				val = this["_" + prop];
			} else if (prop in this) {
				val = this[prop];
			}
			if (typeof val === "object") {
				resultat[prop] = Object.assign({}, val);
			} else if (val) {
				resultat[prop] = val;
			}
		});
		for (let k in resultat.criteres) {
			resultat.criteres[k] = resultat.criteres[k].toJson();
		}
		if (Object.keys(resultat.criteres).length === 0) {
			delete resultat.criteres;
		}
		for (let k in resultat.commentaires) {
			resultat.commentaires[k] = resultat.commentaires[k].toString();
		}
		if (Object.keys(resultat.commentaires).length === 0) {
			delete resultat.commentaires;
		}
		return resultat;
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
	/**
	 * Retourne un élément HTML div contenant les interface des sous-criteres
	 * @returns {HTMLElement} - Un élément div.criteres
	 */
	html_criteres() {
		var resultat = document.createElement("div");
		resultat.classList.add("criteres");
		for (let k in this._criteres) {
			resultat.appendChild(this._criteres[k].dom);
		}
		return resultat;
	}
	/**
	 * Coche un des choix
	 * @param {HTMLElement} obj - Le span à choisir
	 */
	choisir(obj) {
		var choix = Array.from(obj.parentNode.children);
		choix.forEach(e => e.classList.remove("checked"));
		obj.classList.add("checked");
		debugger;
		GValue.resultat.valeur(this.id, obj.innerHTML);
		//		this.dom.querySelector("input").value = obj.innerHTML;
		this.activerProchain();
	}
	activerProchain() {
		var prochain;
		if (this.dom.nextElementSibling) {
			prochain = this.dom.nextElementSibling.obj;
		} else {
			prochain = this.critereParent.dom.nextElementSibling.obj;
			//			debugger;
		}
		if (prochain) {
			prochain.courant(true);
		}
	}
	tout() {
		if (this.length > 0) {
			for (let k in this.criteres) {
				this.criteres[k].tout();
			}
		} else {
			GValue.resultat.valeur(this.id, this.valeur);
		}
	}
	courant(etat) {
		var etatActuel = this.dom.classList.contains("courant");
		var courants = document.querySelectorAll('.courant');
		courants.forEach(c => c.classList.remove("courant"));

		if (etat === undefined) {
			etat = !etatActuel;
		}
		if (etat) {
			var courant = this.dom;
			courant.classList.add("courant");
			var conteneur = document.querySelector(".main");
			var haut = (conteneur.clientHeight - courant.clientHeight) * (1 / 3);
			haut = Math.max(haut, 10);
			haut = conteneur.clientHeight * 0.1;

			this.animer([0, conteneur.scrollTop], [0, courant.offsetTop - haut], 200, function (x, y) {
				conteneur.scrollTo(x, y);
			})
			/*.then(data => {
							console.log("Fin de l'animation.", data);
						})*/
			;
		}
		return this.estCourant();
	}
	animer(debut, fin, duree, callback) {
		return new Promise(resolve => {
			var anim = {};
			anim.temps = {};
			anim.temps.debut = new Date().getTime();
			anim.temps.delta = duree;
			anim.temps.fin = anim.temps.debut + anim.temps.delta;
			anim.etat = {};
			anim.etat.debut = debut;
			anim.etat.fin = fin;
			anim.etat.delta = anim.etat.fin - anim.etat.debut;
			anim.interval = window.setInterval(() => {
				var t = new Date().getTime();
				var ratio = (t - anim.temps.debut) / anim.temps.delta;
				var e;
				if (anim.etat.fin instanceof Array) {
					e = anim.etat.fin.map((e, i) => anim.etat.debut[i] + ratio * (anim.etat.fin[i] - anim.etat.debut[i]));
					callback.apply(this, e);
				} else {
					e = anim.etat.debut + ratio * (anim.etat.fin - anim.etat.debut);
					callback.call(this, e);
				}
				if (t > anim.temps.fin) {
					window.clearInterval(anim.interval);
					resolve(this);
				}
			}, 20);
		});

	}
	estCourant() {
		return this.dom.classList.contains("courant");
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
	 * Retourne un nouvel objet avec les propriétés données sous d'objet
	 * @param   {object}  obj L'objet contenant les propriétés initiales de l'objet
	 * @returns {Critere} this
	 */
	static from(obj, forcerNew = false) {
		if (obj instanceof this && !forcerNew) {
			return obj;
		}
		var resultat = new this();
		resultat.fill(obj);
		return resultat;
	}
	static init() {
		this.prototype.champsArray = ["id", "titre", "type", "valeur", "criteres", "commentaires"];
		App.log("init", this.name);
		this.labels = {
			id: "Id",
			titre: "Titre",
			criteres: "Critères",
			valeur: "Valeur"
		};
		this.prototype.evt = {
			input_resultat: {
				focus: function ( /*e*/ ) {
					//					if (e.currentTarget.obj !== e.relatedTarget.obj) {
					this.obj.courant(true);
					//					}
				},
				blur: function (e) {
					if (e.relatedTarget && e.relatedTarget.obj && e.currentTarget.obj !== e.relatedTarget.obj) {
						this.obj.courant(false);
					}
				}
			},
			input_commentaire: {
				blur: function (e) {
					if (e.relatedTarget && e.relatedTarget.obj && e.currentTarget.obj !== e.relatedTarget.obj) {
						this.obj.courant(false);
					}
				}
			},
			commentaire: {
				click: function () {
					debugger;
				},
				dblclick: function () {
					debugger;
				}
			},
			choix: {
				click: function () {
					this.obj.choisir(this);
				}
			},
			toutrien: {
				click: function () {
					this.obj.tout();
				}
			}
		};
	}
}
Critere.init();
//window.Critere = Critere;
