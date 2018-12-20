/*jslint esnext:true, browser:true*/
import GValue from "./GValue.js";
import Eleve from "./Eleve.js";
import Evaluation from "./Evaluation.js";
import Critere from "./Critere.js";
export default class Resultat {
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
				this._evaluation = Evaluation.loadJson(val).then(data => {
					console.log(data);
					throw "Que fait-on avec le résultat???";
				});
			}
		} else {
			if (val instanceof Evaluation) {
				this._evaluation = val;
			} else if (typeof val === "string") {
				this._evaluation = Evaluation.loadJson(val).then(data => {
					console.log(data);
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
				this._eleve = Eleve.loadJson(val).then(data => {
					console.log(data);
					throw "Que fait-on avec le résultat???";
				});
			}
		} else {
			if (val instanceof Eleve) {
				this._eleve = val;
			} else if (typeof val === "string") {
				this._eleve = Eleve.loadJson(val).then(data => {
					console.log(data);
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
			this.setCritere(k, val[k]);
		}
	}
	getCritere(id) {
		return this._criteres[id];
	}
	setCritere(critere, val) {
		if (typeof critere === "string") {
			critere = this._evaluation._criteres_all[critere];
		}
		var resultat = new Resultat_Critere(critere, val);
		this._criteres[critere.id] = resultat;

		return resultat;
	}
	valeur(id, val) {
		if (this.criteres[id] === undefined) {
			throw "Le critere (resultat) '"+id+"' n'existe pas";
		}
		var critere = this.criteres[id];
		if (arguments.length === 2) {
			critere.valeur = val;
			return critere;
		} else {
			return critere.valeur;
		}
	}
	maj() {

	}
	static get dom_identification() {
		if (!this._dom_identification) {
			let dom = document.createElement("div");
			dom.classList.add("identification");
			if (this._eleve) {
				this._eleve.html_identification(dom);
			}
			dom.obj = this;
			this._dom_identification = dom;
		}
		return this._dom_identification;
	}
	loadJson() {
		var matricule = this.eleve.matricule;
		var data = {
			action: "loadResultat",
			cours: this.evaluation.coursId,
			annee: this.evaluation.anneeId,
			evaluation: this.evaluation.titreId,
			matricule: matricule
		};
		GValue.callApi(data).then(json => {
			debugger;
			this.fill(json);
			return this;
		});
	}
	vider() {
		for (let k in this._criteres) {
			this.valeur(k, "");
		}
		return this;
	}
	appliquer() {
		while (Resultat.dom_identification.firstChild) {
			Resultat.dom_identification.removeChild(Resultat.dom_identification.firstChild);
		}
		this.eleve.html_identification(Resultat.dom_identification);
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
		GValue.callApiPost(data).then(() => {
			return console.log("Faire qqch");
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
	static loadJson(evaluation, eleve) {
		if (GValue.resultat) {
			GValue.resultat.vider();
		}
		var matricule = eleve.matricule || eleve;
		var resultat = new this();
		resultat.eleve = eleve; //TODO Voir l'utilité
		resultat.evaluation = evaluation; //TODO Voir l'utilité
		var data = {
			action: "loadResultat",
			cours: evaluation.coursId,
			annee: evaluation.anneeId,
			evaluation: evaluation.titreId,
			matricule: matricule
		};
		return GValue.callApi(data).then(json => {
			resultat.fill(json);
			return resultat;
		});
	}
	static init() {
		this.prototype.fill = Critere.prototype.fill;
		this.evt = {
			save: {
				click: function () {
					GValue.resultat.save();
				}
			},
			cancel: {
				click: function () {
					GValue.resultat.vider();
				}
			}
		};
	}
}
Resultat.init();


class Resultat_Critere {
	constructor(critere, obj) {
		this._critere = critere;
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
	get id() {
		return this._critere.id;
	}
	set id(val) {
		if (this._critere) {
			return this;
		}
		this._critere = this._evaluation._criteres_all[val];
		return this;
	}
	get valeur() {
		return this._valeur;
	}
	set valeur(val) {
		if (this._valeur === val) {
			return this;
		}
		this._valeur = val;
		this.maj();
	}
	get commentaires() {
		return this._commentaires;
	}
	set commentaires(val) {
		for (let k in val) {
			this._commentaires[k] = val[k];
		}
	}
	maj() {
		debugger;
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
