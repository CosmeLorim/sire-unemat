/**
 * Exporta o módulo de rotas de Operações
 * 
 * @param {Application} application 
 */
module.exports = (application) =>
{
    /**
     * Recebe requisições na rota "/api/operacoes" via método "get" e transfere a requisição para a
     * função "buscar" que tem o propósito buscar dados referentes a operação
     * no controller "operacoes"
     */
    application.get("/api/operacoes", (request, response) =>
    {
        application.app.controllers.operacoes.buscar(application, request, response);
    });

    /**
     * Recebe requisições na rota "/api/operacao/" via método "delete" e transfere a requisição para a
     * função "desativar" que tem o propósito de desativar uma operação no banco
     * no controller "operacoes"
     */
    application.delete("/api/operacao/:id", (request, response) =>
    {
        application.app.controllers.operacoes.desativar(application, request, response);
    });
};