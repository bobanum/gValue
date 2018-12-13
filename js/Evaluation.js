/*jslint browser:true, esnext:true*/
/*global App */
import Menu from "../jsmenu/Menu.js";
import GValue from "./GValue.js";
import Critere from "./Critere.js";
import Resultat from "./Resultat.js";
export default class Evaluation extends Critere {
	constructor() {
		super();
		this.cours = "";
		this.annee = "";
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
		var resultat = document.createElement("fieldset");
		resultat.classList.add("evaluation");
		resultat.disabled = true;
		if (App.mode === App.MODE_EVALUATION) {
			resultat.appendChild(Resultat.dom_identification);
		}
		resultat.appendChild(this.dom_options());
		resultat.appendChild(Critere.prototype.dom_creer.call(this));
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
	load(callback) {
		var data = {
			action: "loadEvaluation",
			cours: this.coursId,
			annee: this.anneeId,
			evaluation: this.titreId
		};
		GValue.callApi(data, function (json) {
			this.fill(json);
			if (callback) {
				callback.call(this, json);
			}
		}, this);
		return this;
	}
	toJson() {
		var resultat = Critere.prototype.toJson.call(this);
		resultat.cours = this.cours;
		resultat.annee = this.annee;
		return resultat;
	}
	static load(cours, annee, evaluation, callback) {
		var resultat = new Evaluation();
		var data = {
			action: "loadEvaluation",
			cours: App.normaliserId(cours),
			annee: App.normaliserId(annee),
			evaluation: App.normaliserId(evaluation)
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
		App.log("init", this.name);
		this.labels = {
			cours: "Cours",
			annee: "Annee"
		};
	}
}
Evaluation.init();
