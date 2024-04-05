
// rating.js

// Functie om de beoordeling van een kunstwerk te verzenden naar de server
async function rateArtwork(artworkId, rating) {
    try {
      const response = await fetch('/home', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ artworkId, rating })
      });
  
      const data = await response.json();
      console.log(data.message); // Log het bericht van de server (optioneel)
    } catch (error) {
      console.error('Er is een fout opgetreden bij het verzenden van de beoordeling:', error);
    }
  }
  
  // Event listeners voor elke beoordelingsknop
  document.querySelectorAll('.rating-button').forEach(button => {
    button.addEventListener('click', async () => {
      const artworkId = document.querySelector('input[name="artworkId"]').value;
      const rating = button.value;
  
      await rateArtwork(artworkId, rating);
    });
  });
  
  document.addEventListener("DOMContentLoaded", function() {
    // Controleer of de selectieknop voor de "likes" pagina aanwezig is
    let selection = document.querySelector(".selection");
    if (selection) {
        // JavaScript voor de "likes" pagina
        let categories = document.querySelector(".categories");
        let options = document.querySelectorAll(".categories p");
        let selectedFiltersContainer = document.querySelector(".selected-filters");

        selection.addEventListener("click", function() {
            categories.classList.toggle("active");
        });

        options.forEach(option => {
            option.addEventListener("click", function() {
                // Maak een nieuw element aan voor het gekozen filter
                let selectedFilter = document.createElement("div");
                selectedFilter.classList.add("selected-filter-item");
                selectedFilter.innerHTML = option.innerHTML;

                // Voeg een kruisje toe aan het gekozen filter
                let closeIcon = document.createElement("span");
                closeIcon.innerHTML = "&times;";
                closeIcon.classList.add("close-icon");

                // Voeg het gekozen filter en het kruisje toe aan de container
                selectedFilter.appendChild(closeIcon);
                selectedFiltersContainer.appendChild(selectedFilter);

                categories.classList.toggle("active");

                // Stuur een verzoek naar de server om te sorteren op de geselecteerde optie
                let sortBy = option.getAttribute("data-sort");
                window.location.href = "/likes?sortBy=" + sortBy;
            });
        });

        // Verwijder het gekozen filter wanneer er op het kruisje wordt geklikt
        selectedFiltersContainer.addEventListener("click", function(event) {
            if (event.target.classList.contains("close-icon")) {
                event.target.parentElement.remove();
            }
        });
    }
});


document.getElementById("showSecondPartButton").addEventListener("click", function() {

  document.getElementById("secondPartForm").style.display = "block";


});


function limitCheckboxSelection(max) {
  const checkboxes = document.querySelectorAll('input[name="images"]:checked');
  if (checkboxes.length > max) {
      alert(`You can only select ${max} images.`);
      event.preventDefault(); // Prevent further checkbox selection
  }
}



  

