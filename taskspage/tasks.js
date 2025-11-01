$(document).ready(function() {
    /* ------------------------------------
    CHARACTER COUNTER FOR DISCUSSION POST
    ------------------------------------ */ 
    $('#discussionMessage').on('input', function() {
        const currentLength = $(this).val().length;  // Count current characters
        const maxLength = 500;                       // Set limit to 500
        const warningThreshold = 450;                // Show warning at 450 chars
        
        // Update the counter display
        $('#charCount').text(currentLength);
        
        // Color-coded feedback system:
        if (currentLength > warningThreshold) {
            // RED: Over 450 chars - danger zone
            $('#charCount').removeClass('text-success text-warning').addClass('text-danger');
            $('#charWarning').show();  // Show warning message
        } else if (currentLength > 350) {
            // YELLOW: Over 350 chars - warning zone  
            $('#charCount').removeClass('text-success text-danger').addClass('text-warning');
            $('#charWarning').hide();  // Hide warning message
        } else {
            // GREEN: Under 350 chars - safe zone
            $('#charCount').removeClass('text-warning text-danger').addClass('text-success');
            $('#charWarning').hide();  // Hide warning message
        }
    });


    /* ------------------------------------
    DISPLAY POSTS BASED ON FILTER SELECTIONS
    ------------------------------------ */
    let posts = []; // Global array to hold all posts

    // Form Submission Handler 
    $('#discussionForm').on('submit', function(e) {
        e.preventDefault(); // Prevent default form submission

        // Create object for new post with form data
        const newPost = {
            author: $('#firstName').val() + ( $('#lastName').val() ? " " + $('#lastName').val() : '' ), // Concatenate first + last name
            type: $('#discussionType').val(),
            movies: $('#discussionTopic').val() || [], // Array of selected movies
            title: $('#discussionTitle').val(),
            message: $('#discussionMessage').val()
        };

        // Add the new post to the posts array
        posts.push(newPost);

        // Reset the form
        $('#discussionForm')[0].reset();
        $('#charCount').text('0').removeClass('text-warning text-danger').addClass('text-success');

        applyFilters(); // Refresh displayed posts
        updateSummary(); // Update summary section
    });

    function applyFilters() {
        const typeFilter = $('#filterType').val(); // Selected type filter
        const movieFilter = $('#filterMovie').val(); // Selected movie filter
        const sortOrder = $('#sortOrder').val(); // Selected sort order
        const container = $('#postsContainer'); // Container for posts
        container.empty(); // Clear current posts
    
        // Start with all posts
        let filteredPosts = posts;

        // Apply type filter if not 'all'
        if (typeFilter !== 'all') {
            filteredPosts = filteredPosts.filter(p => p.type === typeFilter);
        }

        // Apply movie filter if not 'all'
        if (movieFilter !== 'all') {
            filteredPosts = filteredPosts.filter(p => p.movies.includes(movieFilter));
        }

        // --- Apply sorting by title ---
        filteredPosts.sort((a, b) => {
            // Compare titles alphabetically
            if (sortOrder === 'az') {
                return a.title.localeCompare(b.title); // A-Z
            } else {
                return b.title.localeCompare(a.title); // Z-A
            }
        });

        // If no posts match, show placeholder message
        if (filteredPosts.length === 0) {
            container.html(`
                <div class="text-center text-muted py-5">
                    <h4>No posts found</h4>
                    <p>Try changing the filters above.</p>
                </div>
            `);
            updateSummary();
            return;
        }
        
        // Loop through filtered posts and create HTML
        filteredPosts.forEach((post, index) => {
            // Show only first 100 characters of the message
            let shortMessage = post.message.length > 100 ? post.message.substring(0, 100) + '...' : post.message;

            const postHtml = `
            <div class="post-card mb-4 p-3 rounded shadow-sm" data-index="${index}">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h4 class="post-title fw-bold mb-0">${post.title}</h4>
                    <span class="badge post-type ${post.type}">${post.type}</span>
                </div>
                <div class="text-muted small mb-2">
                    <span class="post-author">By <strong>${post.author || 'Anonymous'}</strong></span>
                </div>
                <p class="post-preview">${post.message}</p>
            </div>
            `;

            container.append(postHtml); // Add post to container
        });
        updateSummary();
    }

    function updateSummary() {
        // Count total posts
        const total = posts.length;

        // Count posts per type
        const counts = posts.reduce((acc, post) => {
            acc[post.type] = (acc[post.type] || 0) + 1;
            return acc;
        }, {});

        // Build summary HTML
        const summaryHtml = `
            <div class="mb-3 text-center">
                <strong>Total Posts:</strong> ${total} |
                <strong>Comments:</strong> ${counts.comment || 0} |
                <strong>Questions:</strong> ${counts.question || 0} |
                <strong>Theories:</strong> ${counts.theory || 0} |
                <strong>Reviews:</strong> ${counts.review || 0} |
                <strong>Easter Eggs:</strong> ${counts['easter-egg'] || 0}
            </div>
        `;

        // Append or replace summary container
        $('#summaryContainer').html(summaryHtml);
    }

    $('#filterType, #filterMovie').on('change', function() {
        applyFilters(); 
    });

    /*
    // -----------------------------
    // HANDLE DELETE BUTTON
    // -----------------------------
    $('#postsContainer').on('click', '.delete-btn', function() {
        const postIndex = $(this).closest('.post-card').data('index'); // Get post index
        posts.splice(postIndex, 1); // Remove from array
        applyFilters(); // Refresh display
    });

    // -----------------------------
    // HANDLE EDIT BUTTON
    // -----------------------------
    $('#postsContainer').on('click', '.edit-btn', function() {
        const postIndex = $(this).closest('.post-card').data('index'); // Get post index
        const post = posts[postIndex];

        // Fill form with existing post data
        $('#firstName').val(post.author.split(' ')[0] || '');
        $('#lastName').val(post.author.split(' ')[1] || '');
        $('#discussionType').val(post.type);
        $('#discussionTopic').val(post.movies);
        $('#discussionTitle').val(post.title);
        $('#discussionMessage').val(post.message);

        // Remove the post from array temporarily (it will be added again on submit)
        posts.splice(postIndex, 1);
        applyFilters(); // Refresh display
    });
    */

    $('#filterType, #filterMovie, #sortOrder').on('change', function() {
        applyFilters(); // Reapply filters whenever a filter changes
    });
});