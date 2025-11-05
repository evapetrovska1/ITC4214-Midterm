$(document).ready(function() {
    /* ------------------------------------
    CHARACTER COUNTER FOR CONTACT FORM
    ------------------------------------ */
    // Using the same f(x) as the tasks.js but use the different ids  
    $('#contactMessage').on('input', function() {
        const currentLength = $(this).val().length;  // Count current characters
        const maxLength = 500;                       // Set limit to 500
        const warningThreshold = 450;                // Show warning at 450 chars
        
        // Update the counter display
        $('#contactcharCount').text(currentLength);
        
        // Color-coded feedback system:
        if (currentLength > warningThreshold) {
            // RED: Over 450 chars - danger zone
            $('#contactcharCount').removeClass('text-success text-warning').addClass('text-danger');
            $('#contactcharWarning').show();  // Show warning message
        } else if (currentLength > 350) {
            // YELLOW: Over 350 chars - warning zone  
            $('#contactcharCount').removeClass('text-success text-danger').addClass('text-warning');
            $('#contactcharWarning').hide();  // Hide warning message
        } else {
            // GREEN: Under 350 chars - safe zone
            $('#contactcharCount').removeClass('text-warning text-danger').addClass('text-success');
            $('#contactcharWarning').hide();  // Hide warning message
        }
    });

    /* ------------------------------------
    CONTACT MESSAGE POP UP
    ------------------------------------ */
    // Capturing the data + displaying
    $('#contactForm').on('submit', function(e) {
        e.preventDefault(); // Prevent default submission (so page doesn't reload)

        // Capture the information
        const newMessage = {
            firstName: $('#fName').val() || 'Not provided',
            lastName: $('#lName').val() || 'Not provided',
            email: $('#email').val(),
            subject: $('#subject').val(),
            message: $('#contactMessage').val(),
        };

        // Display the message
        showContactPopUp(newMessage);

        // Reset the form
        $('#contactForm')[0].reset();
        $('#contactCharCount').text('0').removeClass('text-warning text-danger').addClass('text-success');
    });

    // Function for displaying the pop up
    function showContactPopUp(data) {

        //Format the pop up
        const popup = `
            <div class="contact-popup-overlay">
                <div class="contact-popup">
                    <div class="contact-popup-header">
                        <h3>🎉 Message Sent Successfully!</h3>
                        <button class="popup-close button-general">&times;</button>
                    </div>
                    <div class="contact-popup-content">
                        <div class="popup-details">
                            <p><strong>From:</strong> ${data.firstName} ${data.lastName}</p>
                            <p><strong>Email:</strong> ${data.email}</p>
                            <p><strong>Subject:</strong> ${data.subject}</p>
                            <div class="message-preview">
                                <strong>Message Preview:</strong>
                                <p class="preview-text">${data.message.substring(0, 100)}${data.message.length > 100 ? '...' : ''}</p>
                            </div>
                        </div>
                        <p class="popup-thankyou">Thank you for reaching out! We'll get back to you soon.</p>
                    </div>
                    <div class="contact-popup-footer">
                        <button class="btn button-general popup-ok">Awesome! 🎬</button>
                    </div>
                </div>
            </div>
        `;

        // Add the popup to the page
        $('body').append(popup);

        // Close popup events
        $('.popup-close, .popup-ok, .contact-popup-overlay').on('click', function() {
            $('.contact-popup-overlay').remove();
        });

        // Prevent closing when clicking inside popup
        $('.contact-popup').on('click', function(e) {
            e.stopPropagation();
        });
    }
});