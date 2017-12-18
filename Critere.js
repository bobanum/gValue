/*jslint browser:true, esnext:true*/
class Critere {
	constructor() {
		this.titre = "";
		this.valeur = "";
		this.commentaires = {};
		this._criteres = {};
		this.critereParent = null;
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

	}
}
Critere.init();
