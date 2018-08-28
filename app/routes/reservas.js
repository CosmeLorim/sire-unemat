module.exports = (application) =>
{
    /*                API DE RESERVAS                                */
    application.get('/reservas', (request, response) =>
    {
        application.app.controllers.reservas.recuperarObjetos(application, request, response);
    });
    application.get('/administrar-reservas', (request, response) =>
    {
        application.app.controllers.reservas.administrar(application, request, response);
    });
    application.post('/reservas/usuarios', (request, response) =>
    {
        application.app.controllers.reservas.recuperarUsuariosDaReserva(application, request, response);
    });
    application.post('/cadastrar-reserva', (request, response) =>
    {
        application.app.controllers.reservas.inserir(application, request, response);
    });
    application.post('/cancelar-reserva', (request, response) =>
    {
        application.app.controllers.reservas.cancelar(application, request, response);
    });
};
