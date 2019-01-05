/*jslint esnext:true, browser:true*/
import Eleve from "./Eleve.js";

/**
 * Représente un groupe d'élèves
 */
export default class Groupe {
	/**
	 * Constructeur
	 * @param {object} nom Le nom du groupe
	 */
	constructor(nom = "") {
		this.nom = nom;
		this.eleves = {};
	}
	/**
	 * Ajoute un élève au groupe
	 * @param {object|array|Eleve} eleve L'élève a ajouter
	 */
	ajouterEleve(eleve) {
		eleve = Eleve.from(eleve);
		this.eleves[eleve.matricule] = eleve;
		eleve.groupe = this;
	}
	/**
	 * Retourne un élément optgroup regroupant les élèves d'un groupe
	 * @returns {HTMLElement} Un élément optgroup
	 * @deprecated On utilise les radio à la place
	 */
	html_optgroup() {
		let resultat = document.createElement("optgroup");
		resultat.setAttribute("label", this.nom);
		var eleves = this.elevesTries();
		eleves.forEach(eleve => {
			resultat.appendChild(eleve.html_option());
		});
		resultat.addEventListener("click", e => {
			var disabled = e.currentTarget.parentNode.querySelectorAll("optgroup[disabled]");
			if (disabled.length > 0) {
				disabled.forEach((d) => d.removeAttribute("disabled"));
			} else {
				e.currentTarget.parentNode.querySelectorAll("optgroup").forEach((ch) => ch.setAttribute("disabled", "disabled"));
				e.currentTarget.removeAttribute("disabled");
			}
		});
		return resultat;
	}
	/**
	 * Retourne un élément fieldset représentant un groupe d'élèves
	 * @returns {HTMLElement} Un objet fieldset
	 */
	html_radiofieldset() {
		var resultat = document.createElement("fieldset");
		resultat.classList.add("groupe");
		var legend = resultat.appendChild(document.createElement("legend"));
		legend.addEventListener("click", e => e.target.parentNode.classList.toggle("folded"));
		legend.innerHTML = this.nom;
		var ul = resultat.appendChild(document.createElement("ul"));
		var eleves = this.elevesTries();
		eleves.forEach(e => {
			ul.appendChild(e.html_radio("li"));
		});
		resultat.addEventListener("click", e => {
			var disabled = e.currentTarget.parentNode.querySelectorAll("optgroup[disabled]");
			if (disabled.length > 0) {
				disabled.forEach((d) => d.removeAttribute("disabled"));
			} else {
				e.currentTarget.parentNode.querySelectorAll("optgroup").forEach((ch) => ch.setAttribute("disabled", "disabled"));
				e.currentTarget.removeAttribute("disabled");
			}
		});
		return resultat;
	}
	/**
	 * Retourne les élèves trié selon certaines propriétés
	 * @param   {array} props La liste des propriétés déterminant l'ordre de tri. ex.: ["prop1", "-prop2"]
	 * @returns {array} Un tableau d'élèves triés
	 */
	elevesTries(props = ["nom", "prenom"]) {
		var eleves = Object.values(this.eleves);
		var dirs = props.map(prop => (prop[0] === "-") ? -1 : 1);
		props = props.map(prop => prop.replace(/^[\+\-]+/, ""));
		eleves.sort(function (eleve1, eleve2) {
			for (let i = 0, n = props.length; i < n; i += 1) {
				let prop = props[i];
				let dir = dirs[i];
				if (eleve1[prop] < eleve2[prop]) {
					return -1 * dir;
				} else if (eleve1[prop] > eleve2[prop]) {
					return 1 * dir;
				}
			}
			return 0;
		});
		return eleves;
	}
	/**
	 * Retourne un objet Groupe provenant d'un json
	 * @param   {string} nom  Le nom du groupe
	 * @param   {object} json Un objet générique ou un array
	 * @returns {array}  Le tableau d'élèves triés
	 */
	static fromJson(nom, json) {
		var resultat = new this(nom);
		if (!(json instanceof Array)) {
			json = Object.values(json);
		}
		json.forEach(eleve => resultat.ajouterEleve(eleve));
		return resultat;
	}
	/**
	 * Retourne un objet générique contenant tous les élèves d'une série de groupes
	 * @param   {object} objGroupes Un objet contenant les groupes
	 * @returns {object} Un object {matricule: Eleve}
	 */
	static flatten(objGroupes) {
		var resultat;
		resultat = Object.values(objGroupes);
		resultat = resultat.map(groupe => groupe.eleves);
		resultat = Object.assign({}, ...resultat);
		return resultat;
	}
	/**
	 * Détermine les propriétés statiques
	 */
	static init() {
		App.log("init", this.name);
	}
}
Groupe.init();
