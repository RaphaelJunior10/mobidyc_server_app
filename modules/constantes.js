
const Modeles = {
    NUMBER_TO_NUMBER: "NUMBER_TO_NUMBER",
    NUMBER_TO_MOB: "NUMBER_TO_MOB",
    NUMBER_TO_SERVICE: "NUMBER_TO_SERVICE",

    MOB_TO_NUMBER: "MOB_TO_NUMBER",
    MOB_TO_MOB: "MOB_TO_MOB",
    MOB_TO_SERVICE: "MOB_TO_SERVICE"
};

const cst = {
    localIP: "::1",
    Modeles: Modeles,
    Private_APP_modele: [
        Modeles.NUMBER_TO_NUMBER,
        Modeles.MOB_TO_NUMBER,
        Modeles.NUMBER_TO_MOB,
        Modeles.MOB_TO_MOB
    ],
    state: {
        INIT: "INIT",
        CONFIRM: "CONFIRM",
        SUCCESS: "SUCCESS",
        ECHEC: "ECHEC"
    }
}

module.exports = cst;

