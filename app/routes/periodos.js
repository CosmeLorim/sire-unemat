/**
 * Exporta o módulo de rotas de Períodos
 * 
 * @param {Application} application 
 */
module.exports = (application) =>
{
    /**
     * Recebe requisições na rota "/periodos" via método "get" e transfere a requisição para a
     * função "administrar" que tem o propósito de renderizar a partícula de administração de periodos
     * no controller "periodos"
     */
    application.get("/periodos", (request, response) =>
    {
        application.app.controllers.periodos.administrar(application, request, response);
    });

    /**
     * Recebe requisições na rota "/api/periodos" via método "get" e transfere a requisição para a
     * função "buscar" que tem o propósito de buscar dados referentes a periodos
     * no controller "periodos"
     */
    application.get("/api/periodos", (request, response) =>
    {
        application.app.controllers.periodos.buscar(application, request, response);
    });

    /**
     * Recebe requisições na rota "/api/periodo" via método "post" e transfere a requisição para a
     * função "inserir" que tem o propósito de cadastrar um novo período
     * no controller "periodos"
     */
    application.post("/api/periodo", (request, response) =>
    {
        application.app.controllers.periodos.inserir(application, request, response);
    });

    /**
     * Recebe requisições na rota "/api/periodo" via método "put" e transfere a requisição para a
     * função "atualizar" que tem o propósito de atualizar um período
     * no controller "periodos"
     */
    application.put("/api/periodo/:id", (request, response) =>
    {
        application.app.controllers.periodos.atualizar(application, request, response);
    });
};
