function login() {    
    // Appel des éléments du DOM
    const formLog = document.querySelector(".form-login");
    const resultSection = document.querySelector(".result-login");

    // Fonction lié au formulaire
    formLog.addEventListener("submit", async function (event) {
        // Ne pas recharger la page à l'envoi du formulaire
        event.preventDefault();
        // Récupération des données
        const logs = {
            email: event.target.querySelector("[name=email]").value,
            password: event.target.querySelector("[name=mdp]").value,
        };
        // Transformation des données et envoie au Backend pour vérification
        const chargeUtile = JSON.stringify(logs);
        const reponseLogin = await fetch("http://localhost:5678/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: chargeUtile
        });
        // Remise à zéro des champs du formulaire
        event.target.querySelector("[name=email]").value = "";
        event.target.querySelector("[name=mdp]").value = "";
        // Traitement de la réponse du serveur
        const log = await reponseLogin.json();
        switch(reponseLogin.status) {
            case 404 :
                resultSection.innerHTML = "E-mail ou Mot de passe incorrect";
                resultSection.style.color = "red";
                break;
            case 401 :
                resultSection.innerHTML = "E-mail ou Mot de passe incorrect";
                resultSection.style.color = "red";
                break;
            case 200 :
                sessionStorage.setItem("token", log.token);
                window.location="index.html";
                break;
            default:
        };
    });
};

login();