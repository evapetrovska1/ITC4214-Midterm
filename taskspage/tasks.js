$(document).ready(function() {
    /* ------------------------------------
    CHARACTER COUNTER FOR DISCUSSION POST
    ------------------------------------ */ 
    $('#discussionMessage').on('input', function() {
        const currentLength = $(this).val().length;  // Count current characters
        const maxLength = 500; // Set limit to 500
        const warningThreshold = 450; // Show warning at 450 chars
        
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
    FORM SUBMISSION HANDLING
    ------------------------------------ */
   
    let posts = []; // Global array to hold all posts
    let chartTypes; // Chart with the types of posts

    // Load any previous posts saved to the local storage
    const savedPosts = JSON.parse(localStorage.getItem('posts')) || [];
    posts = savedPosts;
    applyFilters(); // Display them on page load

    // Form submission
    $('#discussionForm').on('submit', function(e) {
        e.preventDefault(); // Prevent default form submission

        // Unique id for each post (timestamp)
        const newId = Date.now();

        // Create object for new post with form data
        const newPost = {
            id: newId,
            author: $('#firstName').val() + ( $('#lastName').val() ? " " + $('#lastName').val() : '' ), // Concatenate first + last name
            type: $('#discussionType').val(),
            movies: $('#discussionTopic').val() || [], // Array of selected movies
            title: $('#discussionTitle').val(),
            message: $('#discussionMessage').val(),
            isFavorite: false, //default: not favorited
            date: new Date().toISOString(),
        };

        // Add the new post to the posts array
        posts.push(newPost);

        // Save the new posts to the local storage
        localStorage.setItem('posts', JSON.stringify(posts));

        // Reset the form
        $('#discussionForm')[0].reset();
        $('#charCount').text('0').removeClass('text-warning text-danger').addClass('text-success');
        
        // Success message that the post was posted
        const successMsg = $('<div class="alert alert-success alert-dismissible fade show mt-3">\
            <strong>Success!</strong> Your post has been shared with the community!\
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>\
        </div>');
        $('#discussionForm').append(successMsg);

        // Remove the message after 3 seconds
        setTimeout(() => {
            successMsg.alert('close');
        }, 3000);


        applyFilters(); // Refresh displayed posts
        updateSummary(); // Update summary section
    });

    /* ------------------------------------
    DISPLAY POSTS & FILTER SELECTIONS
    ------------------------------------ */
    function applyFilters() {
        const typeFilter = $('#filterType').val(); // Selected type filter
        const movieFilter = $('#filterMovie').val(); // Selected movie filter
        const sortOrder = $('#sortOrder').val(); // Selected sort order
        const container = $('#postsContainer'); // Container for posts
        container.empty(); // Clear current posts
    
        // Error message if no posts exist in the array
        if (posts.length === 0) {
            container.html(`
                <div class="text-center text-muted py-5">
                    <h4>No posts yet</h4>
                    <p>Be the first to share your thoughts about DreamWorks movies!</p>
                </div>
            `);
            updateSummary();
            return; // Stop here, no need to apply any filters
        }

        // Else, start with all posts
        let filteredPosts = posts;

        // Apply type filter if not 'all'
        if (typeFilter !== 'all') {
            filteredPosts = filteredPosts.filter(p => p.type === typeFilter);
        }

        // Apply movie filter if not 'all'
        if (movieFilter !== 'all') {
            filteredPosts = filteredPosts.filter(p => p.movies.includes(movieFilter));
        }

        // Apply sorting by title
        filteredPosts.sort((a, b) => {
            // Compare titles alphabetically
            if (sortOrder === 'az') {
                return a.title.localeCompare(b.title); // A-Z
            } else {
                return b.title.localeCompare(a.title); // Z-A
            }
        });

        // If no posts match the filters, show placeholder filter message
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
        
        // Loop through filtered posts and create HTML for the display section
        filteredPosts.forEach((post) => {
            const isLongMessage = post.message.length > 200;
            const shortMessage = isLongMessage ? post.message.substring(0, 200) + '...' : post.message;
            const postHtml = `
                <div class="post-card mb-4 p-3 rounded shadow-sm" data-id="${post.id}">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h4 class="post-title fw-bold mb-0">${post.title}</h4>
                        <div class="d-flex align-items-center">
                            <span class="favorite-icon" title="Add to Favorites">♡</span>
                            <span class="badge post-type ${post.type} ms-2">${post.type}</span>
                        </div>
                    </div>
                    <div class="text-muted small mb-2">
                        <span class="post-author">By <strong>${post.author || 'Anonymous'}</strong>
                        • ${new Date(post.date).toLocaleDateString()}
                        </span>
                    </div>
                    
                    <!-- Post Message with expand/collapse functionality -->
                    <div class="post-message-container">
                        <p class="post-preview mb-2">${shortMessage}</p>
                        ${isLongMessage ? `
                            <button class="btn btn-sm btn-outline-secondary view-more-btn" data-full-message="${post.message.replace(/"/g, '&quot;')}">
                                📖 View More
                            </button>
                        ` : ''}
                    </div>

                    <!-- Action buttons -->
                    <div class="text-end">
                        <button class="btn btn-sm btn-outline-primary edit-btn me-2">✏️ Edit</button>
                        <button class="btn btn-sm btn-outline-danger delete-btn">🗑️ Delete</button>
                    </div>
                </div>
            `;

            container.append(postHtml); // Add post to container
        });
        restoreFavorites();
        updateSummary();
    }
    
    /* ------------------------------------
    VIEW MORE / VIEW LESS FUNCTIONALITY
    ------------------------------------ */
    $(document).on('click', '.view-more-btn', function() {
        const $button = $(this);
        const $container = $button.closest('.post-message-container');
        const $preview = $container.find('.post-preview');
        const fullMessage = $button.data('full-message');
        const shortMessage = fullMessage.substring(0, 200) + '...';
        
        // Check what is currently being displayed (short or long message)
        if ($button.text() === '📖 View More') {
            // Switch to full message
            $preview.text(fullMessage);
            $button.text('📖 View Less').removeClass('btn-outline-secondary').addClass('btn-outline-info');
        } else {
            // Switch back to short message
            $preview.text(shortMessage);
            $button.text('📖 View More').removeClass('btn-outline-info').addClass('btn-outline-secondary');
        }
    });

    /* ------------------------------------
    FAVORITES FUNCTIONALITY
    ------------------------------------ */
    // Handle the favorites button when its clicked
    $(document).on('click','.favorite-icon', function() {
        const $heart = $(this);
        const $card = $heart.closest('.post-card');
        const id = $card.data('id');

        // Find the post according to the id
        const idx = posts.findIndex(p => p.id === id);
        if (idx === -1) {
            return;
        }
        
        // Toggle favorite flag
        posts[idx].isFavorite = !posts[idx].isFavorite;

        // Persist the change
        localStorage.setItem('posts', JSON.stringify(posts));

        // Update UI immediately
        if (posts[idx].isFavorite) {
            $heart.addClass('filled').text('♥').attr('title', 'Remove from Favorites');
        } else {
            $heart.removeClass('filled').text('♡').attr('title', 'Add to Favorites');
        }
    });

    // Restore hearts from posts array/local storage (call after rendering)
    function restoreFavorites() {
        const saved = JSON.parse(localStorage.getItem('posts')) || posts;
        $('.post-card').each(function() {
            const id = $(this).data('id');
            const post = posts.find((p) => p.id === id);
            const $heart = $(this).find('.favorite-icon');

            if (post && post.isFavorite) {
                $heart.addClass('filled').text('♥').attr('title', 'Remove from Favorites');
            } else {
                $heart.removeClass('filled').text('♡').attr('title', 'Add to Favorites');
            }
        });
    }
   
    /* ------------------------------------
    DELETE BUTTON
    ------------------------------------ */
    $('#postsContainer').on('click', '.delete-btn', function() {
        const id = $(this).closest('.post-card').data('id'); // Get post id
        posts = posts.filter(p => p.id !== id); // Remove from the array
        localStorage.setItem('posts', JSON.stringify(posts)); // Save the updated list
        applyFilters(); // Refresh the display
        updateSummary(); // Refresh the summary
    });
    
    /* ------------------------------------
    EDIT BUTTON (IN PLACE)
    ------------------------------------ */
    $('#postsContainer').on('click', '.edit-btn', function() {
        const card = $(this).closest('.post-card'); // Get the current card
        const postIndex = posts.findIndex(p => p.id === card.data('id')); // Find the index of the post in the array
        const post = posts[postIndex]; // Get the actual post content

        // Hide the edit, delete & view more buttons
        card.find('.edit-btn, .delete-btn, .view-more-btn').hide();
        // Replace the post fields with the editable ones
        const editableContent = `
            <div class="editable-fields">
                <input type="text" class="form-control mb-2 edit-title" value="${post.title}">
                <textarea class="form-control mb-2 edit-message" rows="3">${post.message}</textarea>
                <div class="text-end">
                    <button class="btn btn-sm btn-success save-edit">💾 Save</button>
                    <button class="btn btn-sm btn-secondary cancel-edit">❌ Cancel</button>
                </div>
            </div>
        `;

        // Alter the HTML
        card.find('.post-title').hide();
        card.find('.post-preview').hide();
        card.append(editableContent);
    });

    /* ------------------------------------
    SAVE EDIT BUTTON
    ------------------------------------ */
    $('#postsContainer').on('click', '.save-edit', function() {
        const card = $(this).closest('.post-card');
        const id = card.data('id');
        const postIndex = posts.findIndex(p => p.id === id);
        if (postIndex === -1) return;
        const post = posts[postIndex];

        // Update post data in the array
        const newTitle = card.find('.edit-title').val();
        const newMessage = card.find('.edit-message').val();
        post.title = newTitle;
        post.message = newMessage;
        post.date = new Date().toISOString();

        // Save the changes to the local storage
        localStorage.setItem('posts', JSON.stringify(posts));

        // Update UI
        card.find('.post-title').text(newTitle).show();
        card.find('.post-preview').text(newMessage).show();
        card.find('.editable-fields').remove();
        card.find('.edit-btn, .delete-btn, .view-more-btn').show(); // Show the buttons again

        updateSummary();
    });

    /* ------------------------------------
    CANCEL EDIT BUTTON
    ------------------------------------ */
    $('#postsContainer').on('click', '.cancel-edit', function() {
        const card = $(this).closest('.post-card');
        card.find('.editable-fields').remove();
        card.find('.post-title, .post-preview').show();
        card.find('.edit-btn, .delete-btn, .view-more-btn').show(); // Show the buttons again
    });
    
    /* ------------------------------------
    SUMMARY SECTION
    ------------------------------------ */
    function updateSummary() {
        // Count total posts
        const total = posts.length;
        // Count favorites vs unfavorites
        const favorited = posts.filter(p => p.isFavorite).length;
        const unfavorited = total - favorited;

        // Count posts per type
        const counts = posts.reduce((acc, post) => { 
            acc[post.type] = (acc[post.type] || 0) + 1;
            return acc;
        }, {});

        // Build the summary display
        const summaryHtml = `
            <div class="mb-3 text-center">
                <strong>Total Posts:</strong> ${total} |
                <strong>Comments:</strong> ${counts.comment || 0} |
                <strong>Questions:</strong> ${counts.question || 0} |
                <strong>Theories:</strong> ${counts.theory || 0} |
                <strong>Reviews:</strong> ${counts.review || 0} |
                <strong>Easter Eggs:</strong> ${counts['easter-egg'] || 0} |
                <strong>Favorited:</strong> ${favorited} |
                <strong>Unfavorited:</strong> ${unfavorited} |
            </div>
        `;

        // Append or replace summary container
        $('#summaryContainer').html(summaryHtml);

        // Update the chart with the counts
        renderChart(counts);
    }

    /* ------------------------------------
    CHART UPDATES SECTION
    ------------------------------------ */
    function renderChart(counts) {
        const ctx = document.querySelector('#chartTypes').getContext('2d');

        // Define the post types
        const postTypes = [
            { type: 'comment', name: 'Comments', color: '#007bff' },
            { type: 'question', name: 'Questions', color: '#ffc107' },
            { type: 'theory', name: 'Theories', color: '#6f42c1' },
            { type: 'review', name: 'Reviews', color: '#28a745' },
            { type: 'easter-egg', name: 'Easter Eggs', color: '#fd7e14' }
        ];

        // Define each variable for the chart and map them accordingly
        const labels = postTypes.map(item => item.name); // what does map mean?
        const data = postTypes.map(item => counts[item.type] || 0);
        const backgroundColors = postTypes.map(item => item.color);


        if (chartTypes) {
            // If chart exists, update it
            chartTypes.data.labels = labels;
            chartTypes.data.datasets[0].data = data;
            chartTypes.data.datasets[0].backgroundColor = backgroundColors;
            chartTypes.update();

        } else {
            // Create chart if it doesn't exist (no posts)
            chartTypes = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: backgroundColors
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                font: {
                                    family: "'Subtitle', Arial, sans-serif",
                                    size: 14
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    $('#filterType, #filterMovie, #sortOrder').on('change', function() {
        applyFilters(); // Reapply filters whenever a filter changes
    });
});