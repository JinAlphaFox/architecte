function affichageFiltrees(boutons, travaux){
    for (let i = 0 ; i < boutons.length ; i++) {
        boutons[i].addEventListener("click", function (event) {
            for (let i = 0 ; i < boutons.length ; i++) {
                boutons[i].style.backgroundColor = "rgba(0, 0, 0, 0)";
                boutons[i].style.color = "#1D6154";
            }
            event.target.style.backgroundColor = "#1D6154";
            event.target.style.color = "white";
            if ( event.target.id === "0" ) {
                affichageGallery(travaux);
            }else{
                const travauxFiltrees = travaux.filter(function (work) {
                    return work.categoryId == boutons[i].id;
                });
                affichageGallery(travauxFiltrees);
            };
        });
    };
};

function affichageGallery(table) {
    const galleryDiv = document.querySelector(".gallery");
    galleryDiv.innerHTML = "";
    
    for (let i = 0 ; i < table.length ; i++) {
        let figureElement = document.createElement("figure");
        let imgElement = document.createElement("img");
        imgElement.src = table[i].imageUrl;
        imgElement.alt = table[i].title;
        let nameElement = document.createElement("figcaption");
        nameElement.innerHTML = table[i].title;
        figureElement.appendChild(imgElement);
        figureElement.appendChild(nameElement);
        galleryDiv.appendChild(figureElement);
    };

};

async function affichageDynamique() {

    // récupération de la bdd
    const reponseWorks = await fetch("http://localhost:5678/api/works");
    const reponseCategories = await fetch("http://localhost:5678/api/categories");
    const works = await reponseWorks.json();
    const categories = await reponseCategories.json();

    
    const buttonList = [];

    // récupération et création du DOM
    const categoriesDiv = document.querySelector(".categories");
    const h3 = document.createElement("h3");
    let buttonTous = document.createElement("button");
    buttonTous.style.backgroundColor = "#1D6154";
    buttonTous.style.color = "white";
    buttonTous.innerHTML = "Tous";
    buttonTous.classList.add("btn-0");
    buttonTous.id = 0;
    h3.appendChild(buttonTous);
    categoriesDiv.appendChild(h3);
    buttonList.push(buttonTous);
    
    
    // création dynamique des boutons
    for (let i = 0 ; i < categories.length ; i++) {
        const h3 = document.createElement("h3");
        let buttonElement = document.createElement("button");
        buttonElement.innerHTML = categories[i].name;
        buttonElement.classList.add("btn-" + categories[i].id);
        buttonElement.id = categories[i].id;
        h3.appendChild(buttonElement);
        categoriesDiv.appendChild(h3);
        buttonList.push(buttonElement);
    };
    
    // création dynamique de la gallery
    affichageGallery(works);

    // création dynamique des filtres
    affichageFiltrees(buttonList, works);

};

affichageDynamique();