
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
            });
        });

        // Verwijder het gekozen filter wanneer er op het kruisje wordt geklikt
        selectedFiltersContainer.addEventListener("click", function(event) {
            if (event.target.classList.contains("close-icon")) {
                event.target.parentElement.remove();
            }
        });
    } else {
        // JavaScript voor de "musea" pagina
        let newSelection = document.querySelector(".musea-selection");
        if (newSelection) {
            let newCategories = document.querySelector(".musea-categories");
            let newOptions = document.querySelectorAll(".musea-categories p");
            let newSelectedFiltersContainer = document.querySelector(".musea-selected-filters");

            newSelection.addEventListener("click", function() {
                newCategories.classList.toggle("active");
            });

            newOptions.forEach(option => {
                option.addEventListener("click", function() {
                    // Maak een nieuw element aan voor het gekozen filter
                    let selectedFilter = document.createElement("div");
                    selectedFilter.classList.add("musea-selected-filter-item");
                    selectedFilter.innerHTML = option.innerHTML;

                    // Voeg een kruisje toe aan het gekozen filter
                    let closeIcon = document.createElement("span");
                    closeIcon.innerHTML = "&times;";
                    closeIcon.classList.add("musea-close-icon");

                    // Voeg het gekozen filter en het kruisje toe aan de container
                    selectedFilter.appendChild(closeIcon);
                    newSelectedFiltersContainer.appendChild(selectedFilter);

                    newCategories.classList.toggle("active");
                });
            });

            // Verwijder het gekozen filter wanneer er op het kruisje wordt geklikt
            newSelectedFiltersContainer.addEventListener("click", function(event) {
                if (event.target.classList.contains("musea-close-icon")) {
                    event.target.parentElement.remove();
                }
            });
        }
    }
});
