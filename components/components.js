$(document).ready(function() {
    // Load the navigation bar
    $("#navbar").load("../components/navigation.html", function() {
        console.log("✅ Navbar loaded!");
        
        // Wait for Bootstrap to initialize
        setTimeout(function() {
            const navbarToggler = $('.navbar-toggler');
            const navbarNav = $('.navbar-nav');
            
            // Listen for Bootstrap collapse events instead of click
            $('#navbarNav').on('show.bs.collapse', function() {
                // Menu opening → make vertical
                navbarNav.removeClass('flex-row').addClass('d-inline-block');
            });
            
            $('#navbarNav').on('hide.bs.collapse', function() {
                // Menu closing → make horizontal  
                navbarNav.removeClass('d-inline-block').addClass('flex-row');
            });
        }, 100);
    });

    // Load the footer
    $("#footer").load("../components/footer.html", function() {
        console.log("✅ Footer loaded!");
    });
});