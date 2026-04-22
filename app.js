$(document).ready(function() {

    // --- CONFIGURACIÓN ---
    const API_KEY = "f691baf95d6e481fe0f098e670e9a1fb"; 
    const BASE_URL = "https://api.themoviedb.org/3";
    const IMG_URL = "https://image.tmdb.org/t/p/w500";

    let currentPage = 1;
    let currentQuery = "Star Wars"; // Búsqueda por defecto inicial
    let currentTarget = "#search-results";
    let currentMode = "search"; // Puede ser 'search', 'popular' o 'trending'

    // --- CARGA INICIAL ---
    // Usamos encodeURIComponent para que los espacios en "Star Wars" no rompan la URL
    const initialUrl = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(currentQuery)}&page=${currentPage}`;
    fetchMovies(initialUrl, currentTarget);

    // --- FUNCIÓN PRINCIPAL AJAX ---
    function fetchMovies(url, target) {
        $(target).html("<p style='text-align:center;'>Loading movies...</p>");

        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                if (!data.results || data.results.length === 0) {
                    $(target).html("<p style='text-align:center;'>No results found.</p>");
                    return;
                }

                // Mapeo de datos para que coincidan con los tags de Mustache {{title}}, {{poster}}, etc.
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
                
                // Actualizar el indicador de página
                currentPage = data.page;
                $('#page-info').text(`Page ${currentPage}`);
            },
            error: function(xhr) {
                let errorMsg = "Error loading data.";
                if(xhr.status === 401) errorMsg = "Error 401: Invalid API Key.";
                if(xhr.status === 404) errorMsg = "Error 404: Service not found.";
                
                $(target).html(`<p style='text-align:center; color:red;'>${errorMsg}</p>`);
                console.error("Detalle del error:", xhr.responseText);
            }
        });
    }

    // --- NAVEGACIÓN ENTRE SECCIONES ---
    $('#btn-search-view').click(function() {
        currentMode = "search";
        $('#search-section').show();
        $('#collection-section').hide();
        currentTarget = "#search-results";
    });

    $('#btn-popular').click(function() {
        currentMode = "popular";
        showCollection(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&page=1`, "Top-Rated Items");
    });

    $('#btn-bookshelf').click(function() {
        currentMode = "trending";
        showCollection(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&page=1`, "Weekly Trending");
    });

    function showCollection(url, title) {
        $('#search-section').hide();
        $('#collection-section').show();
        $('#collection-title').text(title);
        currentTarget = "#collection-results";
        currentPage = 1; // Reiniciar a página 1 al cambiar de categoría
        fetchMovies(url, currentTarget);
    }

    // --- LÓGICA DE BÚSQUEDA ---
    $('#btn-do-search').click(function() {
        const q = $('#query').val();
        if (q) {
            currentQuery = q;
            currentPage = 1;
            currentMode = "search";
            currentTarget = "#search-results";
            
            // Aseguramos que la pestaña de búsqueda sea visible
            $('#search-section').show();
            $('#collection-section').hide();

            const searchUrl = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(q)}&page=${currentPage}`;
            fetchMovies(searchUrl, currentTarget);
        }
    });

    // --- DETALLES (Details-on-Demand SPA) ---
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
                    budget: movie.budget > 0 ? movie.budget.toLocaleString() : "N/A"
                };

                const rendered = Mustache.render(template, detailData);
                $('#details-content').html(rendered);
                $('#details-panel').fadeIn();
                
                // Scroll automático para ver los detalles
                $('html, body').animate({ scrollTop: $("#details-panel").offset().top }, 500);
            }
        });
    });

    $('#close-details').click(function() { $('#details-panel').fadeOut(); });

    // --- CAMBIO DE LAYOUT (GRID / LIST) ---
    $('#grid-mode').click(function() { 
        $(currentTarget).removeClass('list-view').addClass('grid-view'); 
    });
    $('#list-mode').click(function() { 
        $(currentTarget).removeClass('grid-view').addClass('list-view'); 
    });

    // --- PAGINACIÓN ---
    $('#next-page').click(function() {
        currentPage++;
        updatePagination();
    });

    $('#prev-page').click(function() {
        if (currentPage > 1) {
            currentPage--;
            updatePagination();
        }
    });

    function updatePagination() {
        let url = "";
        if (currentMode === "search") {
            url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(currentQuery)}&page=${currentPage}`;
        } else if (currentMode === "popular") {
            url = `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&page=${currentPage}`;
        } else {
            url = `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&page=${currentPage}`;
        }
        fetchMovies(url, currentTarget);
    }

});
