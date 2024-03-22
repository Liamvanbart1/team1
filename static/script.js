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
  