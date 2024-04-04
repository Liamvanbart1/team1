// DOM
const ratingButtons = document.querySelectorAll('[data-rating]');

// Event listener for rating buttons
ratingButtons.forEach(button => {
    button.addEventListener('click', () => {
        const rating = button.getAttribute('data-rating');
        applyRatingColor(rating);

        // Load the next image after a delay
        setTimeout(() => {
            // Add your logic here to load the next image
            // For example, you can use AJAX to fetch the next image data and update the DOM accordingly
            // Once the new image is loaded, update the content in the artwork-container div
            loadNextImage();
        }, 5000);
    });
});

// Function to apply rating color
function applyRatingColor(rating) {
    document.body.classList.remove('like-flash'); // Remove previous rating color

    switch (rating) {
        case 'super-dislike':
            document.body.classList.add('super-dislike-flash');
            break;
        case 'dislike':
            document.body.classList.add('dislike-flash');
            break;
        case 'neutral':
            document.body.classList.add('neutral-flash');
            break;
        case 'like':
            document.body.classList.add('like-flash');
            break;
        case 'super-like':
            document.body.classList.add('super-like-flash');
            break;
        default:
            break;
    }
}

function appendNewCard() {
    const card = new Card({
      imageUrl: urls[cardCount % 5],
      onDismiss: () => {
        setTimeout(appendNewCard, 2500); // Wait for 2.5 seconds before loading the next image
      },
      onLike: () => {
        document.body.classList.add('like-flash'); // Flash the screen green
        setTimeout(() => {
          document.body.classList.remove('like-flash');
          setTimeout(appendNewCard, 2500); // Load next image after 2.5 seconds
        }, 1000); // Remove the flash after 1 second
      },
      onDislike: () => {
        document.body.classList.add('dislike-flash'); // Flash the screen orange
        setTimeout(() => {
          document.body.classList.remove('dislike-flash');
          setTimeout(appendNewCard, 2500); // Load next image after 2.5 seconds
        }, 1000); // Remove the flash after 1 second
      },
      onSuperDislike: () => {
        document.body.classList.add('super-dislike-flash'); // Flash the screen red
        setTimeout(() => {
          document.body.classList.remove('super-dislike-flash');
          setTimeout(appendNewCard, 2500); // Load next image after 2.5 seconds
        }, 1000); // Remove the flash after 1 second
      },
      onNeutral: () => {
        document.body.classList.add('neutral-flash'); // Flash the screen yellow
        setTimeout(() => {
          document.body.classList.remove('neutral-flash');
          setTimeout(appendNewCard, 2500); // Load next image after 2.5 seconds
        }, 1000); // Remove the flash after 1 second
      },
      onSuperLike: () => {
        document.body.classList.add('super-like-flash'); // Flash the screen green
        setTimeout(() => {
          document.body.classList.remove('super-like-flash');
          setTimeout(appendNewCard, 2500); // Load next image after 2.5 seconds
        }, 1000); // Remove the flash after 1 second
      }
    });
    swiper.append(card.element);
    cardCount++;
  
    const cards = swiper.querySelectorAll('.card:not(.dismissing)');
    cards.forEach((card, index) => {
      card.style.setProperty('--i', index);
    });
  }
  
  
