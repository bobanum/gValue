/*jslint esnext:true, browser:true*/
/*exported Resultat*/
/*global Evaluation, GValue, Eleve, Critere*/
class Resultat {
	constructor() {
		this._evaluation = null;
		this._eleve = null;
		this._criteres = {};
	}
	get evaluation() {
		return this._evaluation;
	}
	set evaluation(val) {
		if (this._evaluation) {
			if (val instanceof Evaluation && val !== this._evaluation) {
				this._evaluation = val;
				//TODO Faire qqch??
			} else if (typeof val === "string" && val !== this._evaluation.id) {
				this._evaluation = Evaluation.load(val, function (/*json*/) {
					throw "Que fait-on avec le résultat???";
				});
			}
		} else {
			if (val instanceof Evaluation) {
				this._evaluation = val;
			} else if (typeof val === "string") {
				this._evaluation = Evaluation.load(val, function (/*json*/) {
					throw "Que fait-on avec le résultat???";
				});
			}
		}
	}
	get eleve() {
		return this._eleve;
	}
	set eleve(val) {
		if (this._eleve) {
			if (val instanceof Eleve && val !== this._eleve) {
				this._eleve = val;
				//TODO Faire qqch??
			} else if (typeof val === "string" && val !== this._eleve.matricule) {
				this._eleve = Eleve.load(val, function (/*json*/) {
					throw "Que fait-on avec le résultat???";
				});
			}
		} else {
			if (val instanceof Eleve) {
				this._eleve = val;
			} else if (typeof val === "string") {
				this._eleve = Eleve.load(val, function (/*json*/) {
					throw "Que fait-on avec le résultat???";
				});
			}
		}
	}
	get criteres() {
		return this._criteres;
	}
	set criteres(val) {
		for (let k in val) {
			this.critere(k, val[k]);
		}
	}
	critere(id, val) {
		if (arguments.length === 1) {
			return this._criteres[id];
		} else {
			if (val instanceof Resultat_Critere) {
				this._citeres[id] = val;
			} else {
				this._criteres[id] = new Resultat_Critere(id, val);
			}
			return this.criteres[id];
		}
	}
	valeur(id, val) {
		if (arguments.length === 2) {
			if (this.criteres[id] === undefined) {
				this.criteres[id] = new Resultat_Critere(id);
			}
			this.criteres[id].valeur = val;
			var input = document.getElementById('resultat_' + id);
			if (val !== input.value) {
				input.value = val;
			}
			return this.criteres[id];
		} else {
			return this.criteres[id].valeur;
		}
	}
	static get dom_identification() {
		if (!this._dom_identification) {
			let dom = document.createElement("div");
			dom.classList.add("identification");
			dom.nom = dom.appendChild(document.createElement("span"));
			dom.nom.classList.add("nom");
			dom.prenom = dom.appendChild(document.createElement("span"));
			dom.prenom.classList.add("prenom");
			dom.matricule = dom.appendChild(document.createElement("span"));
			dom.matricule.classList.add("matricule");
			if (this._eleve) {
				dom.nom.innerHTML = this._eleve.nom;
				dom.prenom.innerHTML = this._eleve.prenom;
				dom.matricule.innerHTML = this._eleve.matricule;
			}
			dom.obj = this;
			this._dom_identification = dom;
		}
		return this._dom_identification;
	}
	load(callback) {
		var matricule = this.eleve.matricule;
		var data = {
			action: "loadResultat",
			cours: this.evaluation.coursId,
			annee: this.evaluation.anneeId,
			evaluation: this.evaluation.titreId,
			matricule: matricule
		};
		GValue.callApi(data, function (json) {
			this.fill(json);
			if (callback) {
				callback.call(this, json);
			}
		}, this);
	}
	appliquer() {
		this.evaluation.dom.disabled = false;
		console.log("On doit appliquer le resultat à l'évaluation");
	}
	save() {
		var json = this.toJson();
		var data = {
			action: "saveResultat",
			cours: this.evaluation.coursId,
			annee: this.evaluation.anneeId,
			evaluation: this.evaluation.titreId,
			matricule: this.eleve.matricule,
			json: json
		};
		GValue.callApiPost(data, function () {
			console.log("Faire qqch");
		});
	}
	toJson() {
		var resultat = {};
		resultat.criteres = {};
		for (let k in this._criteres) {
			resultat.criteres[k] = this._criteres[k].toJson();
		}
		resultat.eleve = this.eleve.toJson();
		resultat.evaluation = this.evaluation.toJson();
		return resultat;
	}
	static load(evaluation, eleve, callback) {
		var matricule = eleve.matricule || eleve;
		var resultat = new this();
		resultat.eleve = eleve;//TODO Voir l'utilité
		resultat.evaluation = evaluation;//TODO Voir l'utilité
		var data = {
			action: "loadResultat",
			cours: evaluation.coursId,
			annee: evaluation.anneeId,
			evaluation: evaluation.titreId,
			matricule: matricule
		};
		GValue.callApi(data, function (json) {
			this.fill(json);
			if (callback) {
				callback.call(this, json);
			}
		}, resultat);
		return resultat;
	}
	static init() {
		this.prototype.fill = Critere.prototype.fill;
		this.evt = {
			save: {
				click: function () {
					GValue.resultat.save();
	//				alert("click");
				}
			},
			cancel: {
				click: function () {
	//				alert("click");
				}
			}
		};
	}
}
Resultat.init();


class Resultat_Critere {
	constructor(id, obj) {
		this.id = id;
		this._valeur = "";
		this._commentaires = {};
		if (obj) {
			this.fill(obj);
		}
	}
	fill(obj) {
		for (let k in obj) {
			this[k] = obj[k];
		}
	}
	get valeur() {
		return this._valeur;
	}
	set valeur(val) {
		this._valeur = val;
		var input = document.getElementById('resultat_' + this.id);
		if (val !== input.value) {
			input.value = val;
		}
	}
	get commentaires() {
		return this._commentaires;
	}
	set commentaires(val) {
		for (let k in val) {
			this._commentaires[k] = val[k];
		}
	}
	toJson() {
		var resultat = {};
		resultat.id = this.id;
		resultat.valeur = this.valeur;
		resultat.commentaires = {};
		for (let k in this.commentaires) {
			resultat.commentaires[k] = this.commentaires[k];
		}
		return resultat;
	}
	static init() {

	}
}
Resultat_Critere.init();
