$(document).ready(function() {

    let currentPage = 1;
    let currentQuery = "Star Wars"; 
    let currentTarget = "#search-results";
   
    const API_KEY = "f691baf95d6e481fe0f098e670e9a1fb";
    const BASE_URL = "https://api.themoviedb.org/3";
    const IMG_URL = "https://image.tmdb.org/t/p/w500";

    fetchMovies(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${currentQuery}&page=${currentPage}`, currentTarget);

    function fetchMovies(url, target) {
        $(target).html("<p style='text-align:center;'>Loading movies...</p>");

        $.ajax({
            url: url,
            method: 'GET',
            success: function(data) {
                if (data.results.length === 0) {
                    $(target).html("<p style='text-align:center;'>No results found.</p>");
                    return;
                }

                const formatted = data.results.map(item => ({
                    id: item.id,
                    title: item.title || item.name,
                    year: (item.release_date || "N/A").substring(0, 4),
                    poster: item.poster_path ? IMG_URL + item.poster_path : 'https://via.placeholder.com/300x450?text=No+Poster',
                    rating: item.vote_average
                }));

                const template = $('#movie-card-template').html();
                const rendered = Mustache.render(template, { items: formatted });

                $(target).html(rendered);
                $('#page-info').text(`Page ${data.page}`);
            }
        });
    }

    
    $('#btn-search-view').click(function() {
        $('#search-section').show();
        $('#collection-section').hide();
        currentTarget = "#search-results";
    });

    $('#btn-popular').click(function() {
        showCollection(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&page=1`, "Top-Rated Items");
    });

    $('#btn-bookshelf').click(function() {
        showCollection(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`, "Weekly Trending");
    });

    function showCollection(url, title) {
        $('#search-section').hide();
        $('#collection-section').show();
        $('#collection-title').text(title);
        currentTarget = "#collection-results";
        fetchMovies(url, currentTarget);
    }

    
    $('#btn-do-search').click(function() {
        const q = $('#query').val();
        if (q) {
            currentQuery = q;
            currentPage = 1;
            currentTarget = "#search-results";
            const searchUrl = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(q)}&page=${currentPage}`;
            fetchMovies(searchUrl, currentTarget);
        }
    });

  
    $(document).on('click', '.movie-card', function() {
        const id = $(this).data('id');

        $.ajax({
            url: `${BASE_URL}/movie/${id}?api_key=${API_KEY}`,
            method: 'GET',
            success: function(movie) {
                const template = $('#detail-template').html();
                const detailData = {
                    title: movie.title,
                    year: movie.release_date,
                    poster: movie.poster_path ? IMG_URL + movie.poster_path : 'https://via.placeholder.com/300x450',
                    description: movie.overview,
                    rating: movie.vote_average,
                    language: movie.original_language.toUpperCase(),
                    budget: movie.budget ? movie.budget.toLocaleString() : "N/A"
                };

                const rendered = Mustache.render(template, detailData);
                $('#details-content').html(rendered);
                $('#details-panel').fadeIn();
            }
        });
    });

    
    $('#next-page').click(function() {
        currentPage++;
        const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${currentQuery}&page=${currentPage}`;
        fetchMovies(url, currentTarget);
    });

    $('#prev-page').click(function() {
        if (currentPage > 1) {
            currentPage--;
            const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${currentQuery}&page=${currentPage}`;
            fetchMovies(url, currentTarget);
        }
    });

    $('#close-details').click(function() { $('#details-panel').fadeOut(); });
    $('#grid-mode').click(function() { $(currentTarget).removeClass('list-view').addClass('grid-view'); });
    $('#list-mode').click(function() { $(currentTarget).removeClass('grid-view').addClass('list-view'); });
});
