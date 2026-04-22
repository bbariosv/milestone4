$(document).ready(function() {

    let currentPage = 1;
    let currentQuery = "star wars";
    let currentTarget = "#search-results";
    const API_KEY = "3671d14c"; 

    // ============================
    // 1. CARGA INICIAL
    // ============================
    fetchMovies(currentQuery, currentTarget);

    // ============================
    // 2. FETCH MOVIES (AJAX)
    // ============================
    function fetchMovies(query, target) {

        $(target).html("<p style='text-align:center;'>Loading...</p>");

        $.ajax({
            url: `https://www.omdbapi.com/?apikey=${API_KEY}&s=${query}&page=${currentPage}`,
            method: 'GET',

            success: function(data) {

                // Si no hay resultados
                if (!data.Search) {
                    $(target).html("<p>No results found</p>");
                    return;
                }

                const formatted = data.Search.map(item => ({
                    id: item.imdbID,
                    title: item.Title,
                    poster: item.Poster !== "N/A"
                        ? item.Poster
                        : 'https://via.placeholder.com/210x295?text=No+Image',
                    rating: "N/A"
                }));

                const template = $('#movie-card-template').html();
                const rendered = Mustache.render(template, { movies: formatted });

                $(target).html(rendered);
            },

            error: function() {
                $(target).html("<p>Error loading data</p>");
            }
        });
    }

    // ============================
    // 3. NAVEGACIÓN
    // ============================

    $('#btn-search-view').click(function() {
        $('#collection-results').hide();
        $('#search-results').show();
        $('#search-bar').show();
        currentTarget = "#search-results";
    });

    $('#btn-popular').click(function() {
        $('#search-results').hide();
        $('#collection-results').show();
        $('#search-bar').hide();

        currentTarget = "#collection-results";
        currentQuery = "avengers"; // simulamos "popular"
        currentPage = 1;

        fetchMovies(currentQuery, currentTarget);
    });

    // ============================
    // 4. BUSCADOR
    // ============================

    $('#btn-do-search').click(function() {
        const q = $('#query').val();

        if (q) {
            currentQuery = q;
            currentPage = 1;

            $('#search-results').show();
            $('#collection-results').hide();

            fetchMovies(currentQuery, "#search-results");
        }
    });

    // ============================
    // 5. GRID / LIST
    // ============================

    $('#grid-mode').click(function() {
        $(currentTarget).removeClass('list-view').addClass('grid-view');
    });

    $('#list-mode').click(function() {
        $(currentTarget).removeClass('grid-view').addClass('list-view');
    });

    // ============================
    // 6. DETALLES (OMDb)
    // ============================

    $(document).on('click', '.movie-card', function() {

        const id = $(this).data('id');

        $.ajax({
            url: `https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}`,
            method: 'GET',

            success: function(movie) {

                const template = $('#detail-template').html();

                const detailData = {
                    title: movie.Title,
                    poster: movie.Poster !== "N/A" ? movie.Poster : '',
                    description: movie.Plot,
                    rating: movie.imdbRating,
                    language: movie.Language
                };

                const rendered = Mustache.render(template, detailData);

                $('#details-content').html(rendered);
                $('#details-panel').fadeIn();
            }
        });
    });

    $('#close-details').click(function() {
        $('#details-panel').fadeOut();
    });

    // ============================
    // 7. PAGINACIÓN
    // ============================

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
