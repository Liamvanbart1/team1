// Wait for the DOM content to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Select all elements with the data-rating attribute
  const ratingButtons = document.querySelectorAll('[data-rating]');
  const body = document.body;

  // Function to apply the rating color and trigger the flash animation
  function applyRatingColor(rating) {
    // Remove all previous rating-related classes from the body
    body.classList.remove('rating-flash', 'super-dislike-flash', 'dislike-flash', 'neutral-flash', 'like-flash', 'super-like-flash');

    // Apply the appropriate classes based on the rating type
    switch (rating) {
      case 'super-dislike':
        body.classList.add('super-dislike-flash', 'rating-flash');
        break;
      case 'dislike':
        body.classList.add('dislike-flash', 'rating-flash');
        break;
      case 'neutral':
        body.classList.add('neutral-flash', 'rating-flash');
        break;
      case 'like':
        body.classList.add('like-flash', 'rating-flash');
        break;
      case 'super-like':
        body.classList.add('super-like-flash', 'rating-flash');
        break;
      default:
        break;
    }

    // Set a timeout to remove the flash effect after a short duration
    setTimeout(() => {
      body.classList.remove('rating-flash');

      // Set another timeout to remove specific rating-related classes after the flash
      setTimeout(() => {
        body.classList.remove('super-dislike-flash', 'dislike-flash', 'neutral-flash', 'like-flash', 'super-like-flash');
      }, 360); // Wait for the animation duration plus a buffer
    });
  }

  // Add click event listeners to all rating buttons
  ratingButtons.forEach(button => {
    button.addEventListener('click', () => {
      const rating = button.getAttribute('data-rating');
      applyRatingColor(rating);
    });
  });
});

