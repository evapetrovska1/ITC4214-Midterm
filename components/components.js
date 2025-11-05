// Function to toggle the darkmode
function initDarkMode() {
    const darkModeToggle = document.querySelector('#darkModeToggle');
    
    if (!darkModeToggle) return; // Exit if toggle not found
    
    const body = document.body;
    
    // Check for saved dark mode preference
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    // Apply dark mode if previously enabled
    if (isDarkMode) {
        body.classList.add('dark-mode'); // add the dark-mode class to the body
        darkModeToggle.checked = true; // check the box
    }
    
    // Toggle dark mode
    darkModeToggle.addEventListener('change', function() {
        body.classList.toggle('dark-mode');
        
        // Toggle the dark mode class based on the current state
        if (this.checked) {
            body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'true');
        } else {
            body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'false');
        }
    });
}

$(document).ready(function() {
    // Load the navigation bar
    $("#navbar").load("../components/navigation.html", function() {
        console.log("✅ Navbar loaded!");
        initDarkMode(); // apply the changes
        
        // Wait for Bootstrap to initialize
        setTimeout(function() {
            const navbarToggler = $('.navbar-toggler');
            const navbarNav = $('.navbar-nav');
            const darkModeToggle = $('.dark-mode-toggle');
            
            // Listen for Bootstrap collapse events instead of click
            $('#navbarNav').on('show.bs.collapse', function() {
                // Menu opening → make vertical
                navbarNav.removeClass('flex-row').addClass('d-inline-block');
                darkModeToggle.toggle(); // Hide the dark mode toggle when the menu is expanded
            });

            
            $('#navbarNav').on('hide.bs.collapse', function() {
                // Menu closing → make horizontal  
                navbarNav.removeClass('d-inline-block').addClass('flex-row');
                darkModeToggle.show(); // Show again when the menu is opened
            });
        }, 100);
    });

    // Load the footer
    $("#footer").load("../components/footer.html", function() {
        console.log("✅ Footer loaded!");
    });
});