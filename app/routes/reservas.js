/**
 * Exporta o módulo de rotas de Reservas
 * 
 * @param {Application} application 
 */
module.exports = (application) =>
{
    /**
     * Recebe requisições na rota "/reservas" via método "get" e transfere a requisição para a
     * função "administrar" que tem o propósito de renderizar a partícula de administração de reservas
     * no controller "reservas"
     */
    application.get("/reservas", (request, response) =>
    {
        application.app.controllers.reservas.administrar(application, request, response);
    });

    /**
     * Recebe requisições na rota "/api/reservas" via método "get" e transfere a requisição para a
     * função "buscar" que tem o propósito de buscar as reservas de um determinado dia
     * no controller "reservas"
     */
    application.get("/api/reservas", (request, response) =>
    {
        application.app.controllers.reservas.buscar(application, request, response);
    });

    /**
     * Recebe requisições na rota "/api/reservas/usuarios" via método "get" e transfere a requisição para a
     * função "buscar" que tem o propósito de buscar os usuários e horários de reservas de um objeto em um determinado dia
     * no controller "reservas"
     */
    application.get("/api/reservas/usuarios", (request, response) =>
    {
        application.app.controllers.reservas.buscarUsuariosDaReserva(application, request, response);
    });

    /**
     * Recebe requisições na rota "/api/reserva" via método "post" e transfere a requisição para a
     * função "inserir" que tem o propósito de cadastrar novas reservas
     * no controller "reservas"
     */
    application.post("/api/reserva", (request, response) =>
    {
        application.app.controllers.reservas.inserir(application, request, response);
    });

    /**
     * Recebe requisições na rota "/api/reserva" via método "put" e transfere a requisição para a
     * função "cancelar" que tem o propósito de cancelar algumas reservas
     * no controller "reservas"
     */
    application.delete("/api/reserva", (request, response) =>
    {
        application.app.controllers.reservas.cancelar(application, request, response);
    });
};
