$(document).ready(function() {

    let currentPage = 0;
    let currentQuery = "";
    let currentTarget = "#search-results";

    // ============================
    // FETCH (AJAX)
    // ============================
    function fetchBooks(query, startIndex = 0, target) {

        $(target).html("<p>Cargando...</p>");

        const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&startIndex=${startIndex}&maxResults=10`;

        $.ajax({
            url: url,
            method: 'GET',
            success: function(data) {
                renderBooks(data.items, target);
                updatePagination();
            },
            error: function() {
                alert("Error cargando datos");
            }
        });
    }

    // ============================
    // RENDER
    // ============================
    function renderBooks(books, target) {

        const template = $('#movie-card-template').html();

        const viewData = {
            movies: books.map(book => ({
                id: book.id,
                title: book.volumeInfo.title,
                poster_path: book.volumeInfo.imageLinks
                    ? book.volumeInfo.imageLinks.thumbnail
                    : 'https://via.placeholder.com/150x200',
                vote_average: book.volumeInfo.averageRating || "N/A",
                description: book.volumeInfo.description || "Sin descripción",
                language: book.volumeInfo.language
            }))
        };

        const rendered = Mustache.render(template, viewData);
        $(target).html(rendered);
    }

    // ============================
    // PAGINACIÓN
    // ============================
    function updatePagination() {
        const pageNumber = (currentPage / 10) + 1;
        $('#page-info').text(`Página ${pageNumber}`);
    }

    $('#next-page').click(function() {
        currentPage += 10;
        fetchBooks(currentQuery, currentPage, currentTarget);
    });

    $('#prev-page').click(function() {
        if (currentPage >= 10) {
            currentPage -= 10;
            fetchBooks(currentQuery, currentPage, currentTarget);
        }
    });

    // ============================
    // VISTAS
    // ============================
    $('#grid-mode').click(function() {
        $(currentTarget).removeClass('list-view').addClass('grid-view');
    });

    $('#list-mode').click(function() {
        $(currentTarget).removeClass('grid-view').addClass('list-view');
    });

    // ============================
    // BOTÓN POPULARES
    // ============================
    $('#btn-popular').click(function() {

        currentQuery = "subject:fiction";
        currentPage = 0;
        currentTarget = "#collection-results";

        $('#search-results').hide();
        $('#collection-results').show();
        $('#search-bar').hide();

        fetchBooks(currentQuery, 0, currentTarget);
    });

    // ============================
    // CAMBIAR A BUSCADOR
    // ============================
    $('#btn-search-view').click(function() {

        $('#collection-results').hide();
        $('#search-results').show();
        $('#search-bar').show();

        currentTarget = "#search-results";
    });

    // ============================
    // BUSCAR
    // ============================
    $('#btn-do-search').click(function() {

        const query = $('#query').val();

        if (query) {
            currentQuery = query;
            currentPage = 0;
            currentTarget = "#search-results";

            $('#collection-results').hide();
            $('#search-results').show();

            fetchBooks(currentQuery, 0, currentTarget);
        }
    });

    // ============================
    // DETALLES
    // ============================
    $(document).on('click', '.movie-card', function() {

        const bookId = $(this).data('id');

        $.ajax({
            url: `https://www.googleapis.com/books/v1/volumes/${bookId}`,
            success: function(book) {

                const template = $('#detail-template').html();

                const detailData = {
                    title: book.volumeInfo.title,
                    poster_path: book.volumeInfo.imageLinks
                        ? book.volumeInfo.imageLinks.thumbnail
                        : '',
                    description: book.volumeInfo.description || "Sin descripción",
                    rating: book.volumeInfo.averageRating || "N/A",
                    language: book.volumeInfo.language
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
