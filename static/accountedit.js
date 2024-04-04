document.addEventListener("DOMContentLoaded", function () {
    const editButton = document.getElementById('editButton');
    const accountDetails = document.querySelector('.accountDetails');
    const editFormContainer = document.querySelector('.editFormContainer');
    const logoutForm = document.getElementById('logoutForm');

    editButton.addEventListener('click', function () {
        // Toggle visibility of account details and edit form
        accountDetails.style.display = 'none';
        logoutForm.style.display = 'none';
        editFormContainer.style.display = 'block';
    });

    // Submit form using AJAX
    const editForm = document.getElementById('editForm');
    editForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(editForm);
        fetch(editForm.action, {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                // Update account details on the page
                // Here you can update the account details based on the response from the server
                // For example, you can update the username and email fields
                // Replace the values in the <p> elements with new values
                document.querySelector('.accountH2').textContent = 'Welcome, ' + data.username + '!';
                document.getElementById('name').value = data.username;
                document.getElementById('email').value = data.email;

                // Hide the edit form and show account details again
                accountDetails.style.display = 'block';
                logoutForm.style.display = 'block';
                editFormContainer.style.display = 'none';
            })
            .catch(error => console.error('Error updating account details:', error));
    });
});
