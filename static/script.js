
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

        selection.addEventListener("click", function() {
            categories.classList.toggle("active");
        });

        options.forEach(option => {
            option.addEventListener("click", function() {
                // Maak een nieuw element aan voor het gekozen filter


                // Stuur een verzoek naar de server om te sorteren op de geselecteerde optie
                let sortBy = option.getAttribute("data-sort");
                window.location.href = "/likes?sortBy=" + sortBy;
            });
        });
    }
});

document.addEventListener("DOMContentLoaded", function() {
  // Controleer of de selectieknop voor de "musea" pagina aanwezig is
  let selection = document.querySelector(".musea-selection");
  if (selection) {
      // JavaScript voor de "musea" pagina
      let categories = document.querySelector(".musea-categories");
      let options = document.querySelectorAll(".musea-categories p");

      selection.addEventListener("click", function() {
          categories.classList.toggle("active");
      });

      options.forEach(option => {
          option.addEventListener("click", function() {
              // Stuur een verzoek naar de server om te sorteren op de geselecteerde optie
              let sortBy = option.getAttribute("data-sort");
              window.location.href = "/musea?sortBy=" + sortBy;
          });
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



  

