$(document).ready(function() {

    /* ------------------------------------
    QUIZ FUNCTIONALITY
    ------------------------------------ */
    // Make objects with the questions, options, and answers
    const quizData = [
        {
            question: "Who is the main character in 'How to Train Your Dragon'?",
            options: ["Hiccup", "Toothless", "Astrid"],
            answer: "Hiccup"
        },
        {
            question: "Which movie features a lion named Alex?",
            options: ["Madagascar", "Kung Fu Panda", "Shrek"],
            answer: "Madagascar"
        },
        {
            question: "What kind of animal is Po?",
            options: ["Panda", "Dragon", "Cat"],
            answer: "Panda"
        },
        {
            question: "What does Shrek famously say about ogres?",
            options: ["Ogres are like onions", "Ogres are like cakes", "Ogres are like flowers"],
            answer: "Ogres are like onions"
        },
        {
            question: "Which character is voiced by Antonio Banderas?",
            options: ["Puss in Boots", "Donkey", "Lord Farquaad"],
            answer: "Puss in Boots"
        }
    ];

    // Start at 0
    let currentQuestion = 0;
    let score = 0;

    /* ------------------------------------
    LOADING THE QUESTION
    ------------------------------------ */
    function loadQuestion() {
        // Clear the previous score
        $('#quizScore').text('');
        // Hide the button at the beginning
        $('#nextBtn').hide();

        // Load the current question
        const q = quizData[currentQuestion];
        $('#quizQuestion').html(q.question);
        $('#quizOptions').empty();

        // Options functionality (looping through each option)
        q.options.forEach(option => {
            const btn = $('<button>')
                .addClass('btn btn-outline-secondary w-50') // Add styling for the options
                .text(option)
                .on('click', function() { 
                    if(option === q.answer) { // If answer is correct, make the option green
                        $(this).removeClass('btn-outline-secondary').addClass('btn-success');
                        score++;
                    } else { // If answer is wrong, make the option red
                        $(this).removeClass('btn-outline-secondary').addClass('btn-danger');
                        // Highlight the correct answer
                        $('#quizOptions button').each(function() {
                            if($(this).text() === q.answer) {
                                $(this).removeClass('btn-outline-secondary').addClass('btn-success');
                            }
                        });
                    }
                    // Disable the options
                    $('#quizOptions button').attr('disabled', true);
                    $('#nextBtn').show();
                });
            $('#quizOptions').append(btn);
        });
    }

    /* ------------------------------------
    NEXT BUTTON FUNCTIONALITY
    ------------------------------------ */
    $('#nextBtn').on('click', function() {
        // Load the next question
        currentQuestion++;
        if(currentQuestion < quizData.length) {
            loadQuestion();
        } else {
            $('#quizQuestion').text("🎉 Quiz Completed");
            $('#quizOptions').empty();
            $('#quizScore').text(`Your score: ${score} / ${quizData.length}`);
            $(this).hide();
        }
    });

    // Load the first question
    loadQuestion();
    
    /* ------------------------------------
    WHEEL FUNCTIONALITY
    ------------------------------------ */
    const wheel = document.querySelector('#wheel');
    const spinBtn = document.querySelector('#spinBtn');
    const result = document.querySelector('#result');

    // List of movies in the same order as segments
    const movies = [
    'Shrek',
    'Kung Fu Panda',
    'Madagascar',
    'How to Train Your Dragon',
    'Puss in Boots',
    'The Boss Baby'
    ];

    let spinning = false; // Prevents double spins

    spinBtn.addEventListener('click', () => {
    if (spinning) return; // Prevents spam clicks
    spinning = true;
    result.textContent = '';

    // Generate random spins (so it looks more dynamic)
    const randomSpins = 3 * 360 + Math.floor(Math.random() * 360); /* Spins at least 3 times and adds random number */
    wheel.style.transform = `rotate(${randomSpins}deg)`; 

    // Determine the selected movie after animation
    setTimeout(() => {
        // Find the actual angle relative to the starting position
        const actualRotation = randomSpins % 360;
        const segmentAngle = 360 / movies.length;
        const selectedIndex = Math.floor((360 - actualRotation + segmentAngle / 2) / segmentAngle) % movies.length;
        const selectedMovie = movies[selectedIndex];

        result.textContent = `🎉 You got: ${selectedMovie}! 🎥`;
        spinning = false;
    }, 4000);
    });
});

