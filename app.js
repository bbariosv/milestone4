$(document).ready(function() {
    let currentPage = 0;
    let currentQuery = "cinema"; // Default search
    let itemsPerPage = 10;

    // Initial load
    fetchData(currentQuery, currentPage);

    function fetchData(query, startIndex) {
        $("#main-container").html("<p style='text-align:center;'>Loading data...</p>");
        
        const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&startIndex=${startIndex}&maxResults=${itemsPerPage}`;

        $.ajax({
            url: url,
            method: 'GET',
            success: function(data) {
                if (data.items) {
                    renderItems(data.items);
                } else {
                    $("#main-container").html("<p>No results found.</p>");
                }
                updatePaginationDisplay();
            },
            error: function() {
                alert("Error connecting to the API.");
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

    // Nav Events
    $('#btn-popular').click(function() {
        currentQuery = "subject:fiction";
        currentPage = 0;
        $('#search-bar').hide();
        fetchData(currentQuery, currentPage);
    });

    $('#btn-search-view').click(function() {
        $('#search-bar').fadeIn();
    });

    $('#btn-do-search').click(function() {
        const q = $('#query').val();
        if (q) {
            currentQuery = q;
            currentPage = 0;
            fetchData(currentQuery, currentPage);
        }
    });

    // Pagination
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

    // Layout Switch
    $('#grid-mode').click(function() {
        $('#main-container').removeClass('list-view').addClass('grid-view');
    });

    $('#list-mode').click(function() {
        $('#main-container').removeClass('grid-view').addClass('list-view');
    });

    // Details-on-Demand
    $(document).on('click', '.movie-card', function() {
        const id = $(this).data('id');
        $.get(`https://www.googleapis.com/books/v1/volumes/${id}`, function(data) {
            const template = $('#detail-template').html();
            const detailData = {
                title: data.volumeInfo.title,
                poster: data.volumeInfo.imageLinks ? data.volumeInfo.imageLinks.medium || data.volumeInfo.imageLinks.thumbnail : '',
                description: data.volumeInfo.description || "No description available.",
                rating: data.volumeInfo.averageRating || "N/A",
                language: data.volumeInfo.language.toUpperCase()
            };
            const rendered = Mustache.render(template, detailData);
            $('#details-content').html(rendered);
            $('#details-panel').fadeIn();
        });
    });

    $('#close-details').click(function() {
        $('#details-panel').fadeOut();
    });
});
