/*jslint browser:true, esnext:true*/
/*global App */
import {Menu} from "../jsmenu/Menu.js";
import {GValue} from "./GValue.js";
import {Critere} from "./Critere.js";
import {Resultat} from "./Resultat.js";

/**
 * Représente une évaluation
 */
export class Evaluation extends Critere {
	constructor() {
		super();
		this.cours = "";
		this.annee = "";
		this._criteres_all = {};
		this.resultats = {};
	}
	get dom() {
		if (!this._dom) {
			this._dom = this.dom_creer();
			this._dom.obj = this;
		}
		return this._dom;
	}
	get coursId() {
		return App.normaliserId(this.cours);
	}
	get anneeId() {
		return App.normaliserId(this.annee);
	}
	get titreId() {
		return App.normaliserId(this.titre);
	}
	dom_creer() {
		var domSuper = super.dom;
		var resultat = document.createElement("fieldset");
		resultat.classList.add("evaluation");
		resultat.disabled = true;
		if (App.mode === App.MODE_EVALUATION) {
			resultat.appendChild(Resultat.dom_identification);
		}
		resultat.appendChild(this.dom_options());
		resultat.appendChild(domSuper);
//		resultat.appendChild(Critere.prototype.dom_creer.call(this));
		return resultat;
	}
	dom_options() {
		var resultat;
		resultat = Menu.dom_toolbar({
			save: Resultat.evt.save.click,
			cancel: Resultat.evt.cancel.click
		});
		resultat.classList.add("options");
		return resultat;
	}
	html_details() {
		var resultat = document.createElement("div");
		resultat.classList.add("details");
		resultat.appendChild(this.html_ligneDonnees("cours"));
		resultat.appendChild(this.html_ligneDonnees("annee"));
		resultat.appendChild(this.html_ligneDonnees("titre"));
		return resultat;
	}
	loadJson() {
		var data = {
			action: "loadEvaluation",
			cours: this.coursId,
			annee: this.anneeId,
			evaluation: this.titreId
		};
		return GValue.callApi(data).then(json => {
			this.fill(json);
			this._criteres_all = this.inventaireCriteres();
			this._criteres_all.forEach(c => c._evaluation = this);
			return this;
		});
	}
	toJson() {
		var resultat = Critere.prototype.toJson.call(this);
		resultat.cours = this.cours;
		resultat.annee = this.annee;
		return resultat;
	}
	static loadJson(cours, annee, evaluation) {
		var resultat = new this();
		var data = {
			action: "loadEvaluation",
			cours: App.normaliserId(cours),
			annee: App.normaliserId(annee),
			evaluation: App.normaliserId(evaluation)
		};
		return GValue.callApi(data).then(json => {
			resultat.fill(json);
			var criteres = resultat.inventaireCriteres();
			criteres.forEach(c => {
				c._evaluation = resultat;
				resultat._criteres_all[c.id] = c;
			});
			return resultat;
		});
	}
	static init() {
		this.prototype.champsArray = super.prototype.champsArray.concat(["cours", "annee"]);
		App.log("init", this.name);
		this.labels = {
			cours: "Cours",
			annee: "Annee"
		};
	}
}
Evaluation.init();
