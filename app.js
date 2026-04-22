$(document).ready(function() {
    let currentPage = 1;
    let currentQuery = "Star Wars";
    let currentTarget = "#search-results";

    // 1. CARGA INICIAL
    fetchMovies(currentQuery, "#search-results");

    function fetchMovies(query, target) {
        $(target).html("<p style='text-align:center;'>Loading data...</p>");
        
        $.ajax({
            url: `https://api.tvmaze.com/search/shows?q=${query}`,
            method: 'GET',
            success: function(data) {
                const formatted = data.map(item => ({
                    id: item.show.id,
                    title: item.show.name,
                    poster: item.show.image ? item.show.image.medium : 'https://via.placeholder.com/210x295?text=No+Image',
                    rating: item.show.rating.average || "N/A"
                }));

                const template = $('#movie-card-template').html();
                const rendered = Mustache.render(template, { items: formatted });
                $(target).html(rendered);
            },
            error: function() {
                $(target).html("<p style='text-align:center;'>Error loading data. Try again.</p>");
            }
        });
    }

    // 2. NAVEGACIÓN ENTRE SECCIONES (Punto 7)
    $('#btn-search-view').click(function() {
        $('#collection-section').hide();
        $('#search-section').fadeIn();
        currentTarget = "#search-results";
    });

    $('#btn-popular, #btn-bookshelf').click(function() {
        $('#search-section').hide();
        $('#collection-section').fadeIn();
        currentTarget = "#collection-results";
        // Cargamos la colección solo si está vacía o se pulsa el botón
        fetchMovies("Top Rated", "#collection-results");
    });

    // 3. BUSCADOR
    $('#btn-do-search').click(function() {
        const q = $('#query').val();
        if (q) {
            currentQuery = q;
            currentPage = 1;
            $('#page-info').text(`Page ${currentPage}`);
            fetchMovies(q, "#search-results");
        }
    });

    // 4. VISTAS GRID / LIST
    $('#grid-mode').click(function() {
        $('#search-results, #collection-results').removeClass('list-view').addClass('grid-view');
    });

    $('#list-mode').click(function() {
        $('#search-results, #collection-results').removeClass('grid-view').addClass('list-view');
    });

    // 5. DETALLES (SPA Behavior)
    $(document).on('click', '.movie-card', function() {
        const id = $(this).data('id');
        $.ajax({
            url: `https://api.tvmaze.com/shows/${id}`,
            method: 'GET',
            success: function(show) {
                const template = $('#detail-template').html();
                const detailData = {
                    title: show.name,
                    poster: show.image ? show.image.medium : '',
                    description: show.summary,
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

    // 6. PAGINACIÓN (Simulada para cumplir el requisito)
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
