/*jslint browser:true, esnext:true*/
/*global App */
import {
	Menu
} from "../jsmenu/Menu.js";
import {
	GValue
} from "./GValue.js";
import {
	Critere
} from "./Critere.js";
import {
	Resultat
} from "./Resultat.js";

/**
 * Représente une évaluation
 */
export class Evaluation extends Critere {
	/**
	 * Constructeur
	 */
	constructor() {
		super();
		/** {string} Le nom du cours */
		this.cours = "";
		/** {string} L'année de l'évaluation */
		var date = new Date();	// On utilise la session actuelle par défaut.
		this.annee = ((date.getMonth() < 7) ? "h" : "a") + date.getFullYear();
		/** {object} La liste de tous les critères de l'évaluation */
		this._criteres_all = {};
		/** {matricule: Eleve} Les objets (par élève) Resultat associés a cette évaluation.  */
		this.resultats = {};
	}
	/**
	 * Retourne l'élément HTML représentant l'évaluation
	 * @returns {HTMLElement} - Un élément fieldset créé pas {@link #dom_creer} par
	 */
	get dom() {
		if (!this._dom) {
			this._dom = this.dom_creer();
			this._dom.obj = this;
		}
		return this._dom;
	}
	/**
	 * Retourne une version normalisée du titre du cours associé à l'évaluation
	 * @returns {string} - Une chaine normalisée.
	 */
	get coursId() {
		//TODO Voir la pertinence d'utiliser l'objet cours.
		return App.normaliserId(this.cours);
	}
	/**
	 * Retourne une version normalisée de l'année
	 * @returns {string} Une chaine normalisée
	 */
	get anneeId() {
		return App.normaliserId(this.annee);
	}
	/**
	 * Retourne une version normalisée du titre de l'évaluation
	 * @returns {string} Une chaine normalisée
	 */
	get titreId() {
		return App.normaliserId(this.titre);
	}
	/**
	 * Crée et retourne l'élément HTML fieldset représentant l'évaluation
	 * @returns {HTMLElement} - Un élément fieldset.evaluation
	 */
	dom_creer() {
		var domSuper = super.dom;
		var resultat = document.createElement("fieldset");
		resultat.classList.add("evaluation");
		resultat.disabled = true;
		if (App.mode === App.MODE_EVALUATION) {
			resultat.appendChild(Resultat.dom_identification);
		}
		//TODO Faire en sorte que les options soient créé par les bons objets. Notamment Resultat, App et/ou GValue.
		resultat.appendChild(this.dom_options());
		resultat.appendChild(domSuper);
		return resultat;
	}
	/**
	 * Retourne le menu relatif à l'évaluation et à son résultats.
	 * @returns {HTMLElement} Un élément fieldset.toolbar.options
	 */
	dom_options() {
		var resultat;
		resultat = Menu.dom_toolbar({
			save: Resultat.evt.save.click,
			cancel: Resultat.evt.cancel.click
		});
		resultat.classList.add("options");
		return resultat;
	}
	/**
	 * Retourne l'élément HTML des détails de l'évaluation
	 * @returns {HTMLElement} - Un élément div.details
	 */
	html_details() {
		var resultat = document.createElement("div");
		resultat.classList.add("details");
		resultat.appendChild(this.html_ligneDonnees("cours"));
		resultat.appendChild(this.html_ligneDonnees("annee"));
		resultat.appendChild(this.html_ligneDonnees("titre"));
		return resultat;
	}
	/**
	 * Retourne une promesse résolue au chargement de l'évaluation
	 * @returns {Promise<object>} Une promesse contenant l'évaluation
	 */
	zzzloadJson() {
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
