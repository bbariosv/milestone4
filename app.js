$(document).ready(function() {
    let currentPage = 0;
    let currentQuery = "movies"; 
    let itemsPerPage = 10;

    // Carga inicial automática
    fetchData(currentQuery, 0);

    function fetchData(query, startIndex) {
        // Usamos el contenedor principal
        $("#main-container").html("<p style='text-align:center;'>Loading data...</p>");
        
        const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${itemsPerPage}`;

        $.ajax({
            url: url,
            method: 'GET',
            success: function(data) {
                if (data.items) {
                    renderItems(data.items);
                } else {
                    $("#main-container").html("<p style='text-align:center;'>No results found. Try another search.</p>");
                }
                updatePaginationDisplay();
            },
            error: function() {
                // Si sale este error, es que la API de Google está saturada o la URL está mal
                $("#main-container").html("<p style='text-align:center;'>API Error. Please try again later.</p>");
            }
        });
    }

    function renderItems(items) {
        const template = $('#movie-card-template').html();
        const viewData = {
            items: items.map(item => ({
                id: item.id,
                title: item.volumeInfo.title,
                poster: item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : 'https://via.placeholder.com/150x200?text=No+Image',
                rating: item.volumeInfo.averageRating || "N/A"
            }))
        };
        const rendered = Mustache.render(template, viewData);
        $('#main-container').html(rendered);
    }

    function updatePaginationDisplay() {
        const pageNumber = Math.floor(currentPage / itemsPerPage) + 1;
        $('#page-info').text(`Page ${pageNumber}`);
    }

    // Eventos de botones
    $('#btn-popular').click(function() {
        currentQuery = "subject:cinema";
        currentPage = 0;
        fetchData(currentQuery, 0);
    });

    $('#btn-search-view').click(function() {
        $('#search-bar').toggle();
    });

    $('#btn-do-search').click(function() {
        const q = $('#query').val();
        if (q) {
            currentQuery = q;
            currentPage = 0;
            fetchData(currentQuery, 0);
        }
    });

    $('#next-page').click(function() {
        currentPage += itemsPerPage;
        fetchData(currentQuery, currentPage);
    });

    $('#prev-page').click(function() {
        if (currentPage >= itemsPerPage) {
            currentPage -= itemsPerPage;
            fetchData(currentQuery, currentPage);
        }
    });

    // Cambios de vista
    $('#grid-mode').click(function() {
        $('#main-container').removeClass('list-view').addClass('grid-view');
    });

    $('#list-mode').click(function() {
        $('#main-container').removeClass('grid-view').addClass('list-view');
    });

    // Detalles
    $(document).on('click', '.movie-card', function() {
        const id = $(this).data('id');
        $.get(`https://www.googleapis.com/books/v1/volumes/${id}`, function(data) {
            const template = $('#detail-template').html();
            const detailData = {
                title: data.volumeInfo.title,
                poster: data.volumeInfo.imageLinks ? data.volumeInfo.imageLinks.thumbnail : '',
                description: data.volumeInfo.description || "No description available.",
                rating: data.volumeInfo.averageRating || "N/A",
                language: (data.volumeInfo.language || "EN").toUpperCase()
            };
            const rendered = Mustache.render(template, detailData);
            $('#details-content').html(rendered);
            $('#details-panel').fadeIn();
        });
    });

    $('#close-details').click(function() { $('#details-panel').fadeOut(); });
});
