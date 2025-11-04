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
    let favoritesChart;

    // Load any previous posts saved to the local storage
    const savedPosts = JSON.parse(localStorage.getItem('posts')) || [];
    posts = savedPosts;
    applyFilters(); // Display them on page load

    // Form Submission Handler 
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

        // Save the new posts to the local array
        localStorage.setItem('posts', JSON.stringify(posts));

        // Reset the form
        $('#discussionForm')[0].reset();
        $('#charCount').text('0').removeClass('text-warning text-danger').addClass('text-success');

        applyFilters(); // Refresh displayed posts
        updateSummary(); // Update summary section
    });

    // Function to apply the selected filters
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

        // Apply sorting by title
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
        filteredPosts.forEach((post) => {
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
                <p class="post-preview">${post.message}</p>

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
    FAVORITES FUNCTIONALITY
    ------------------------------------ */
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

        // Persist change
        localStorage.setItem('posts', JSON.stringify(posts));

        // Update UI immediately
        if (posts[idx].isFavorite) {
            $heart.addClass('filled').text('♥').attr('title', 'Remove from Favorites');
        } else {
            $heart.removeClass('filled').text('♡').attr('title', 'Add to Favorites');
        }

        console.log('Heart clicked!');
    });

    // Restore hearts from posts array/localStorage (call after rendering)
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
    SUMMARY SECTION
    ------------------------------------ */
    function updateSummary() {
        // Count total posts
        const total = posts.length;
        const favorited = posts.filter(p => p.isFavorite).length;
        const unfavorited = total - favorited;

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

        // Update the chart
        renderChart(favorited,unfavorited);
    }

    /* ------------------------------------
    CHART UPDATES SECTION
    ------------------------------------ */
    function renderChart(favorited, unfavorited) {
        const ctx = document.querySelector('#favoritesChart').getContext('2d');

        if (favoritesChart) {
            // Update existing chart
            favoritesChart.data.datasets[0].data = [favorited, unfavorited];
            favoritesChart.update();
        } else {
            // Create chart first time
            favoritesChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Favorited', 'Unfavorited'],
                    datasets: [{
                        data: [favorited, unfavorited],
                        backgroundColor: ['#5f708a', '#1d3f7280']
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

    $('#filterType, #filterMovie').on('change', function() {
        applyFilters(); 
    });

    // Delete button
    $('#postsContainer').on('click', '.delete-btn', function() {
        const id = $(this).closest('.post-card').data('id'); // Get post id
        posts = posts.filter(p => p.id !== id); // Remove from the array
        localStorage.setItem('posts', JSON.stringify(posts)); // Save the updated list
        applyFilters(); // Refresh the display
        updateSummary(); // Refresh the summary
    });

    // Edit button (takes users back to the form submission)
    $('#postsContainer').on('click', '.edit-btn', function() {
        const id = $(this).closest('.post-card').data('id'); // Get the post id
        const postIndex = posts.findIndex(p => p.id === id);
        const post = posts[postIndex];

        // Fill form with existing data
        const [firstName = '', lastName = ''] = (post.author || '').split(' ');
        $('#firstName').val(firstName);
        $('#lastName').val(lastName);
        $('#discussionType').val(post.type);
        $('#discussionTopic').val(post.movies);
        $('#discussionTitle').val(post.title);
        $('#discussionMessage').val(post.message);

        // Remove old version
        posts.splice(postIndex, 1);
        localStorage.setItem('posts', JSON.stringify(posts)); // Update storage
        applyFilters();
        updateSummary();
    });

    $('#filterType, #filterMovie, #sortOrder').on('change', function() {
        applyFilters(); // Reapply filters whenever a filter changes
    });
});