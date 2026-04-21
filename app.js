$(document).ready(function() {
    // 1. Función para buscar libros (usando la API de Google Books)
    function buscarLibros(tema) {
        const url = `https://www.googleapis.com/books/v1/volumes?q=${tema}`;

        $.ajax({
            url: url,
            method: 'GET',
            success: function(data) {
                console.log("Datos recibidos:", data);
                renderizarResultados(data.items);
            },
            error: function() {
                alert("Error al conectar con la API");
            }
        });
    }

    // 2. Función para "dibujar" los libros usando Mustache
    function renderizarResultados(libros) {
        // El "molde" que está en el HTML (lo crearemos en el siguiente paso)
        const template = $('#movie-card-template').html();
        
        // Mustache necesita un objeto con la lista
        const viewData = {
            movies: libros.map(book => ({
                title: book.volumeInfo.title,
                poster_path: book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : 'https://via.placeholder.com/150',
                vote_average: book.volumeInfo.averageRating || "N/A",
                id: book.id
            }))
        };

        const rendered = Mustache.render(template, viewData);
        $('#results-container').html(rendered);
    }

    // 3. Evento del botón de Populares (buscaremos libros de "Programación")
    $('#btn-popular').click(function() {
        buscarLibros('programming');
    });

    // 4. Cambiar vistas
    $('#grid-mode').click(function() {
        $('#results-container').removeClass('list-view').addClass('grid-view');
    });

    $('#list-mode').click(function() {
        $('#results-container').removeClass('grid-view').addClass('list-view');
    });
});
