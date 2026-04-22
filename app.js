$(document).ready(function() {
    let currentViewMode = 'grid-view';

    // 1. CARGA INICIAL (AJAX)
    // Buscamos "Star Wars" por defecto para que no esté vacío
    fetchMovies('Star Wars');

    function fetchMovies(query) {
        $("#main-container").html("<p style='text-align:center;'>Searching movies...</p>");
        
        $.ajax({
            url: `https://api.tvmaze.com/search/shows?q=${query}`,
            method: 'GET',
            success: function(data) {
                // TVMaze devuelve un array de objetos {show: {...}}
                // Lo mapeamos para que Mustache lo entienda fácil
                const formattedData = data.map(item => ({
                    id: item.show.id,
                    title: item.show.name,
                    poster: item.show.image ? item.show.image.medium : 'https://via.placeholder.com/210x295?text=No+Image',
                    rating: item.show.rating.average || "N/A",
                    summary: item.show.summary || "No description available.",
                    language: item.show.language,
                    genres: item.show.genres.join(", ")
                }));

                renderResults(formattedData);
            },
            error: function() {
                alert("Error connecting to the Movie API");
            }
        });
    }

    // 2. RENDERIZADO CON MUSTACHE
    function renderResults(movies) {
        const template = $('#movie-card-template').html();
        const rendered = Mustache.render(template, { items: movies });
        $('#main-container').html(rendered);
    }

    // 3. BUSCADOR
    $('#btn-do-search').click(function() {
        const query = $('#query').val();
        if (query) fetchMovies(query);
    });

    // 4. COLECCIÓN POPULAR (AJAX con otra búsqueda)
    $('#btn-popular').click(function() {
        fetchMovies('Top Rated'); // Simulamos populares con una búsqueda fija
    });

    // 5. CAMBIO DE VISTA (GRID/LIST)
    $('#grid-mode').click(function() {
        $('#main-container').removeClass('list-view').addClass('grid-view');
    });

    $('#list-mode').click(function() {
        $('#main-container').removeClass('grid-view').addClass('list-view');
    });

    // 6. DETALLES ON DEMAND (AJAX para un solo ítem)
    $(document).on('click', '.movie-card', function() {
        const id = $(this).data('id');
        
        $.ajax({
            url: `https://api.tvmaze.com/shows/${id}`,
            method: 'GET',
            success: function(show) {
                const template = $('#detail-template').html();
                const detailData = {
                    title: show.name,
                    poster: show.image ? show.image.original : '',
                    description: show.summary, // TVMaze ya trae el HTML
                    rating: show.rating.average || "N/A",
                    language: show.language
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
});
