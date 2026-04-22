$(document).ready(function() {

    let currentPage = 1;
    let currentQuery = "Star Wars";
    let currentTarget = "#search-results";
    const API_KEY = "3671d14c"; 

    fetchMovies(currentQuery, currentTarget);

    function fetchMovies(query, target) {
        $(target).html("<p style='text-align:center;'>Loading...</p>");

        $.ajax({
            url: `https://www.omdbapi.com/?apikey=${API_KEY}&s=${query}&page=${currentPage}`,
            method: 'GET',
            success: function(data) {
                if (data.Response === "False") {
                    $(target).html("<p style='text-align:center;'>No results found.</p>");
                    return;
                }

             
                const formatted = data.Search.map(item => ({
                    id: item.imdbID,
                    title: item.Title,
                    year: item.Year,
                    poster: item.Poster !== "N/A" ? item.Poster : 'https://via.placeholder.com/300x450?text=No+Image'
                }));

                const template = $('#movie-card-template').html();
                const rendered = Mustache.render(template, { items: formatted });

                $(target).html(rendered);
                $('#page-info').text(`Page ${currentPage}`);
            },
            error: function() {
                $(target).html("<p>Error connecting to the API.</p>");
            }
        });
    }

   
    $('#btn-search-view').click(function() {
        $('#search-section').show();
        $('#collection-section').hide();
        currentTarget = "#search-results";
    });

    $('#btn-popular').click(function() {
        showCollection("Avengers", "Top-Rated Items");
    });

    $('#btn-bookshelf').click(function() {
        showCollection("Harry Potter", "My Collection");
    });

    function showCollection(query, title) {
        $('#search-section').hide();
        $('#collection-section').show();
        $('#collection-title').text(title);
        
        currentQuery = query;
        currentPage = 1;
        currentTarget = "#collection-results";
        fetchMovies(currentQuery, currentTarget);
    }

    $('#btn-do-search').click(function() {
        const q = $('#query').val();
        if (q) {
            currentQuery = q;
            currentPage = 1;
            currentTarget = "#search-results";
            fetchMovies(currentQuery, currentTarget);
        }
    });

 
    $('#grid-mode').click(function() {
        $(currentTarget).removeClass('list-view').addClass('grid-view');
    });

    $('#list-mode').click(function() {
        $(currentTarget).removeClass('grid-view').addClass('list-view');
    });


    $(document).on('click', '.movie-card', function() {
        const id = $(this).data('id');

        $.ajax({
            url: `https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}&plot=full`,
            method: 'GET',
            success: function(movie) {
                const template = $('#detail-template').html();
                const detailData = {
                    title: movie.Title,
                    year: movie.Year,
                    poster: movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/300x450',
                    description: movie.Plot,
                    rating: movie.imdbRating,
                    language: movie.Language,
                    actors: movie.Actors
                };

                const rendered = Mustache.render(template, detailData);
                $('#details-content').html(rendered);
                $('#details-panel').fadeIn();
                // Scroll suave hacia los detalles
                $('html, body').animate({ scrollTop: $("#details-panel").offset().top }, 500);
            }
        });
    });

    $('#close-details').click(function() {
        $('#details-panel').fadeOut();
    });


    $('#next-page').click(function() {
        currentPage++;
        fetchMovies(currentQuery, currentTarget);
    });

    $('#prev-page').click(function() {
        if (currentPage > 1) {
            currentPage--;
            fetchMovies(currentQuery, currentTarget);
        }
    });

});
