/*jslint esnext:true, browser:true*/
/*exported Resultat*/
/*global Evaluation, GValue, Eleve, Critere*/
class Resultat {
	constructor() {
		this._evaluation = null;
		this._eleve = null;
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
		var path = this.evaluation.path || path;
		GValue.callApi({action: "loadResultat", path: this.evaluation.path, matricule: matricule}, function (json) {
			this.fill(json);
			if (callback) {
				callback.call(this, json);
			}
		}, this);
	}
	appliquer() {
		throw "On doit appliquer le resultat à l'évaluation";
	}
	static load(evaluation, eleve, callback) {
		var matricule = eleve.matricule || eleve;
		var path = evaluation.path || path;
		var resultat = new this();
		resultat.eleve = eleve;
		resultat.evaluation = evaluation;
		GValue.callApi({action: "loadResultat", path: path, matricule: matricule}, function (json) {
			this.fill(json);
			if (callback) {
				callback.call(this, json);
			}
		}, resultat);
		return resultat;
	}
	static init() {
		this.prototype.fill = Critere.prototype.fill;
	}
}
Resultat.init();
