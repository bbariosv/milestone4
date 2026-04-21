$(document).ready(function() {
    // Variables globales para controlar la página actual y la búsqueda
    let currentPage = 0;
    let currentQuery = 'JavaScript'; // Búsqueda por defecto para "Populares"

    // --- 1. FUNCIÓN PRINCIPAL AJAX ---
    function fetchBooks(query, startIndex = 0) {
        const maxResults = 10;
        const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&startIndex=${startIndex}&maxResults=${maxResults}`;

        $.ajax({
            url: url,
            method: 'GET',
            success: function(data) {
                renderBooks(data.items);
                updatePagination(startIndex);
            },
            error: function() {
                alert("Error al obtener datos de la API");
            }
        });
    }

    // --- 2. RENDERIZADO CON MUSTACHE ---
    function renderBooks(books) {
        const template = $('#movie-card-template').html(); // Tomamos el molde del HTML
        
        // Preparamos los datos para Mustache
        const viewData = {
            movies: books.map(book => ({
                id: book.id,
                title: book.volumeInfo.title,
                poster_path: book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : 'https://via.placeholder.com/150x200?text=No+Image',
                vote_average: book.volumeInfo.averageRating || "N/A",
                description: book.volumeInfo.description ? book.volumeInfo.description.substring(0, 150) + "..." : "Sin descripción",
                language: book.volumeInfo.language
            }))
        };

        const rendered = Mustache.render(template, viewData);
        $('#results-container').html(rendered);
    }

    // --- 3. DETALLES ON-DEMAND ---
    // Escuchamos el clic en cualquier tarjeta de libro
    $(document).on('click', '.movie-card', function() {
        const bookId = $(this).data('id');
        
        // Pedimos los detalles de ese libro específico
        $.ajax({
            url: `https://www.googleapis.com/books/v1/volumes/${bookId}`,
            success: function(book) {
                const template = $('#detail-template').html();
                const detailData = {
                    title: book.volumeInfo.title,
                    poster_path: book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.medium || book.volumeInfo.imageLinks.thumbnail : '',
                    description: book.volumeInfo.description || "No hay descripción disponible.",
                    rating: book.volumeInfo.averageRating || "S/N",
                    language: book.volumeInfo.language
                };
                const rendered = Mustache.render(template, detailData);
                $('#details-content').html(rendered);
                $('#details-panel').fadeIn(); // Mostramos el panel
                $('html, body').animate({ scrollTop: 0 }, 'slow'); // Subimos para ver el detalle
            }
        });
    });

    // --- 4. EVENTOS DE BOTONES ---

    // Botón Popular
    $('#btn-popular').click(function() {
        currentQuery = 'subject:fiction'; // Buscamos ficcion como "populares"
        currentPage = 0;
        fetchBooks(currentQuery, 0);
    });

    // Buscador
    $('#btn-do-search').click(function() {
        currentQuery = $('#query').val();
        if(currentQuery) {
            currentPage = 0;
            $('#search-bar').show();
            fetchBooks(currentQuery, 0);
        }
    });

    // Botones de Vista (Grid/List)
    $('#grid-mode').click(function() {
        $('#results-container').removeClass('list-view').addClass('grid-view');
    });

    $('#list-mode').click(function() {
        $('#results-container').removeClass('grid-view').addClass('list-view');
    });

    // Paginación
    $('#next-page').click(function() {
        currentPage += 10;
        fetchBooks(currentQuery, currentPage);
    });

    $('#prev-page').click(function() {
        if(currentPage >= 10) {
            currentPage -= 10;
            fetchBooks(currentQuery, currentPage);
        }
    });

    $('#close-details').click(function() {
        $('#details-panel').fadeOut();
    });
});
