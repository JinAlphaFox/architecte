async function affichageGallery() {
    const reponse = await fetch("http://localhost:5678/api/works");
    const works = await reponse.json();

    const galleryDiv = document.querySelector(".gallery");
    
    for (let i = 0 ; i < works.length ; i++) {
        let figureElement = document.createElement("figure");
        let imgElement = document.createElement("img");
        imgElement.src = works[i].imageUrl;
        imgElement.alt = works[i].title;
        let nameElement = document.createElement("figcaption");
        nameElement.innerHTML = works[i].title;
        figureElement.appendChild(imgElement);
        figureElement.appendChild(nameElement);
        galleryDiv.appendChild(figureElement);
    };
}

affichageGallery();