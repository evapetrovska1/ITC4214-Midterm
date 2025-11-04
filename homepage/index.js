$(document).ready(function() {
    // Load the posts from the localStorage
    const allPosts = JSON.parse(localStorage.getItem('posts')) || [];
    
    // Sort the posts by the date (newest first)
    const sortedPosts = allPosts.sort((a,b) => new Date(b.date) - new Date(a.date));

    // Take the 3 most recent ones
    const recentPosts = sortedPosts.slice(0,3);
    
    if (recentPosts.length === 0) {
        const message = `
            <div class="text-center text-muted py-5">
                <h4>No posts yet</h4>
                <p>Be the first to share your thoughts about DreamWorks movies!</p>
            </div>
            `;
            $('#latestPosts').html(message);
    }
    // Render each recent post
    recentPosts.forEach(post => {
        const postHtml = `
            <div class="post-card mb-4 p-3 rounded shadow-sm" data-id="${post.id}">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h4 class="post-title fw-bold mb-0">${post.title}</h4>
                </div>
                <div class="text-muted small mb-2">
                    <span class="post-author">By <strong>${post.author || 'Anonymous'}</strong>
                    • ${new Date(post.date).toLocaleDateString()}
                    </span>
                </div>
                <p class="post-preview">${post.message}</p>
            </div>
            `;
        $('#latestPosts').append(postHtml);
    });

    // Handle the button click
    $('#getCatFact').click(function () {
        const $display = $('#catFactDisplay');
        $display.text('Loading a new cat fact... 🐾');

        // Fetch from the Cat Fact API
        fetch('https://catfact.ninja/fact')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            // Display the cat fact
            $display.html(`🐈 ${data.fact}`);
        })
        .catch(error => {
            // Handle any error
            console.error('Error fetching cat fact:', error);
            $display.text('Oops! Could not fetch a cat fact right now 😿');
        });
    });
    
});