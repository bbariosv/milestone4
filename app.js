$(document).ready(function() {
    console.log("¡La página está lista y jQuery funcionando!");

    // Al hacer clic en "Buscador"
    $('#btn-search-view').click(function() {
        $('#search-bar').toggle(); // Muestra u oculta la barra
    });

    // Cambiar a Modo Lista
    $('#list-mode').click(function() {
        $('#results-container').removeClass('grid-view').addClass('list-view');
    });

    // Cambiar a Modo Cuadrícula
    $('#grid-mode').click(function() {
        $('#results-container').removeClass('list-view').addClass('grid-view');
    });
});
