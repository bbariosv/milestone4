$(document).ready(function() {

    let currentPage = 1;
    let currentQuery = "star wars";
    let currentTarget = "#search-results";
    const API_KEY = "TU_API_KEY"; // ⚠️ PON TU KEY

    // INICIO
    fetchMovies(currentQuery, currentTarget);

    function fetchMovies(query, target) {

        $(target).html("<p>Loading...</p>");

        $.ajax({
            url: `https://www.omdbapi.com/?apikey=${API_KEY}&s=${query}&page=${currentPage}`,
            method: 'GET',

            success: function(data) {

                if (!data.Search) {
                    $(target).html("<p>No results</p>");
                    return;
                }

                const formatted = data.Search.map(item => ({
                    id: item.imdbID,
                    title: item.Title,
                    poster: item.Poster !== "N/A"
                        ? item.Poster
                        : 'https://via.placeholder.com/200',
                    rating: "N/A"
                }));

                const template = $('#movie-card-template').html();
                const rendered = Mustache.render(template, { items: formatted });

                $(target).html(rendered);
            }
        });
    }

    // NAV
    $('#btn-search-view').click(function() {
        $('#search-section').show();
        $('#collection-section').hide();
        currentTarget = "#search-results";
    });

    $('#btn-popular').click(function() {
        $('#search-section').hide();
        $('#collection-section').show();

        currentQuery = "avengers";
        currentPage = 1;
        currentTarget = "#collection-results";

        fetchMovies(currentQuery, currentTarget);
    });

    $('#btn-bookshelf').click(function() {
        $('#search-section').hide();
        $('#collection-section').show();

        currentQuery = "harry potter";
        currentPage = 1;
        currentTarget = "#collection-results";

        fetchMovies(currentQuery, currentTarget);
    });

    // SEARCH
    $('#btn-do-search').click(function() {
        const q = $('#query').val();

        if (q) {
            currentQuery = q;
            currentPage = 1;

            $('#search-section').show();
            $('#collection-section').hide();

            fetchMovies(currentQuery, "#search-results");
        }
    });

    // GRID / LIST
    $('#grid-mode').click(function() {
        $(currentTarget).removeClass('list-view').addClass('grid-view');
    });

    $('#list-mode').click(function() {
        $(currentTarget).removeClass('grid-view').addClass('list-view');
    });

    // DETAILS
    $(document).on('click', '.movie-card', function() {

        const id = $(this).data('id');

        $.ajax({
            url: `https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}`,
            method: 'GET',

            success: function(movie) {

                const template = $('#detail-template').html();

                const detailData = {
                    title: movie.Title,
                    poster: movie.Poster,
                    description: movie.Plot,
                    rating: movie.imdbRating,
                    language: movie.Language
                };

                const rendered = Mustache.render(template, detailData);

                $('#details-content').html(rendered);
                $('#details-panel').show();
            }
        });
    });

    $('#close-details').click(function() {
        $('#details-panel').hide();
    });

    // PAGINATION
    $('#next-page').click(function() {
        currentPage++;
        $('#page-info').text(`Page ${currentPage}`);
        fetchMovies(currentQuery, currentTarget);
    });

    $('#prev-page').click(function() {
        if (currentPage > 1) {
            currentPage--;
            $('#page-info').text(`Page ${currentPage}`);
            fetchMovies(currentQuery, currentTarget);
        }
    });

});
