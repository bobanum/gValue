/*jslint browser:true, esnext:true*/
/*global DOMObject, GValue*/
class Critere {
	constructor() {
		this.id = GValue.creerId();
		this.titre = "";
		this._valeur = "";
		this._commentaires = {};
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
	get length() {
		return Object.keys(this.criteres).length;
	}
	dom_creer() {
		var resultat = document.createElement("div");
		resultat.classList.add("critere");
		resultat.setAttribute("id", "critere_" + this.id);
		resultat.appendChild(this.html_details());
		resultat.appendChild(this.html_aides());
		resultat.appendChild(this.html_criteres());
		return resultat;
	}
	dom_valeur() {
		var resultat;
		resultat = document.createElement("span");
		if (this.modeEval) {
			let input = resultat.appendChild(document.createElement("input"));
			input.setAttribute("type", "text");
			input.setAttribute("id", "resultat_" + this.id);
			input.setAttribute("tabindex", 1);
			Critere.addEventListeners(input, this.evt.input_resultat);
			//			input.addEventListener("focus", this.evt.input_resultat.focus);
			//			input.addEventListener("blur", this.evt.input_resultat.blur);
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
		resultat.classList.add("cliquables");
		vals.forEach(function (v) {
			let span = resultat.appendChild(document.createElement("span"));
			span.innerHTML = v;
			span.obj = this;
			Critere.addEventListeners(span, this.evt.choix);
		}, this);
		return resultat;
	}
	html_choix(max, vals) {
		var nbVals = vals.length;
		var echelle = this.echelle(max, nbVals - 1);

		var resultat = document.createElement("span");
		resultat.classList.add("choix");
		resultat.classList.add("cliquables");
		vals.forEach(function (v, i) {
			let span = resultat.appendChild(document.createElement("span"));
			span.innerHTML = v;
			span.obj = this;
			span.setAttribute("data-valeur", echelle[i]);
			span.setAttribute("title", echelle[i]);
			Critere.addEventListeners(span, this.evt.choix);
		}, this);
		return resultat;
	}
	html_boutons(choix, evts) {
		var resultat = document.createElement("div");
		resultat.classList.add("boutons");
		resultat.classList.add("cliquables");
		choix.forEach(function (v) {
			let span = resultat.appendChild(document.createElement("span"));
			span.innerHTML = v;
			span.obj = this;
			Critere.addEventListeners(span, evts);
		}, this);
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
		} else if (this.length > 0) {
			resultat.appendChild(this.html_boutons(["Tout", "Rien"], this.evt.toutrien));
		}
		resultat.appendChild(this.html_commentaires());
		return resultat;
	}
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
	toJson() {
		var resultat = {};
		resultat.id = this.id;
		resultat.titre = this.titre;
		resultat.valeur = this.valeur;
		resultat.criteres = {};
		for (let k in this._criteres) {
			resultat.criteres[k] = this._criteres[k].toJson();
		}
		resultat.commentaires = {};
		for (let k in this._commentaires) {
			resultat.commentaires[k] = this._commentaires[k];
		}
		return resultat;
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
	choisir(obj) {
		var choix = [].slice.call(obj.parentNode.children, 0);
		choix.forEach(e => e.classList.remove("checked"));
		obj.classList.add("checked");
		GValue.resultat.valeur(this.id, obj.innerHTML);
		//		this.dom.querySelector("input").value = obj.innerHTML;
		this.activerProchain();
	}
	html_criteres() {
		var resultat = document.createElement("div");
		resultat.classList.add("criteres");
		for (let k in this._criteres) {
			resultat.appendChild(this._criteres[k].dom);
		}
		return resultat;
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
		var courants = document.querySelectorAll('.courant');
		courants.forEach((c) => c.classList.remove("courant"));
		if (etat === undefined) {
			this.dom.classList.toggle("courant");
		} else if (etat) {
			this.dom.classList.add("courant");
		} else {
			this.dom.classList.remove("courant");
		}
		var courant = document.querySelector('.courant');
		if (courant) {
			var haut = (window.innerHeight - courant.clientHeight) * (1 / 3);
			haut = Math.max(haut, 0);
			this.animer([0, window.scrollY], [0, courant.offsetTop - 20 - haut], 200, function (x, y) {
				window.scrollTo(x, y);
			});
			//			var anim = {};
			//			anim.temps = {};
			//			anim.temps.debut = new Date().getTime();
			//			anim.temps.delta = 100;
			//			anim.temps.fin = anim.temps.debut + anim.temps.delta;
			//			anim.etat = {};
			//			anim.etat.debut = window.scrollY;
			//			anim.etat.fin = courant.offsetTop - 20 - haut;
			//			anim.etat.delta = anim.etat.fin - anim.etat.debut;
			//			anim.interval;
			//			var anim.interval = window.setInterval(function () {
			//				var t = new Date().getTime();
			//				var dt = t - anim.temps.debut;
			//				var de = (dt / anim.temps.delta) * anim.etat.delta;
			//				var e = anim.etat.debut + de;
			//				window.scrollTo(0, e);
			//				if (t > anim.temps.fin) {
			//					window.clearInterval(iii);
			//				}
			//			}, 10);
		}
		return this.estCourant();
	}
	animer(debut, fin, duree, callback) {
		var anim = {};
		anim.temps = {};
		anim.temps.debut = new Date().getTime();
		anim.temps.delta = duree;
		anim.temps.fin = anim.temps.debut + anim.temps.delta;
		anim.etat = {};
		anim.etat.debut = debut;
		anim.etat.fin = fin;
		anim.etat.delta = anim.etat.fin - anim.etat.debut;
		anim.interval = window.setInterval(function () {
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
			}
		}, 10);

	}
	estCourant() {
		return this.dom.classList.contains("courant");
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
		this.forEach = DOMObject.forEach;
		this.addEventListeners = DOMObject.addEventListeners;
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
					debugger;
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
