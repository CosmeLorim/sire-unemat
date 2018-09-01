/**
 * Exporta o módulo de rotas de Disciplinas
 * 
 * @param {Application} application 
 */
module.exports = (application) =>
{
    /**
     * Recebe requisições na rota "/disciplinas" via método "get" e transfere a requisição para a
     * função "administrar" que tem o propósito de renderizar a partícula de administração de disciplinas
     * no controller "disciplinas"
     */
    application.get("/disciplinas", (request, response) =>
    {
        application.app.controllers.disciplinas.administrar(application, request, response);
    });

    /**
     * Recebe requisições na rota "/api/disciplinas" via método "get" e transfere a requisição para a
     * função "buscar" que tem o propósito de buscar dados referentes a disciplinas
     * no controller "disciplinas"
     */
    application.get("/api/disciplinas", (request, response) =>
    {
        application.app.controllers.disciplinas.buscar(application, request, response);
    });

    /**
     * Recebe requisições na rota "/api/disciplinas-ativas" via método "get" e transfere a requisição para a
     * função "buscarAtivas" que tem o propósito de buscar dados referentes a disciplinas
     * no controller "disciplinas"
     */
    application.get("/api/disciplinas/ativas", (request, response) =>
    {
        application.app.controllers.disciplinas.buscarAtivas(application, request, response);
    });

    /**
     * Recebe requisições na rota "/api/disciplinas/ativas/nao-oferecidas" via método "get" e transfere a requisição para a
     * função "buscarAtivasNaoOferecidas" que tem o propósito de buscar dados referentes a disciplinas ativas que não possuem oferecimento
     * no controller "disciplinas"
     */
    application.get("/api/disciplinas/ativas/nao-oferecidas", (request, response) =>
    {
        application.app.controllers.disciplinas.buscarAtivasNaoOferecidas(application, request, response);
    });

    /**
     * Recebe requisições na rota "/api/cadastrar-disciplinas" via método "post" e transfere a requisição para a
     * função "inserir" que tem o propósito de cadastrar uma nova disciplina
     * no controller "disciplinas"
     */
    application.post("/api/disciplina", (request, response) =>
    {
        application.app.controllers.disciplinas.inserir(application, request, response);
    });

    /**
     * Recebe requisições na rota "/api/atualizar-disciplinas" via método "put" e transfere a requisição para a
     * função "atualizar" que tem o propósito de recuperar dados referentes a disciplinas
     * no controller "disciplinas"
     */
    application.put("/api/disciplina/:id", (request, response) =>
    {
        application.app.controllers.disciplinas.atualizar(application, request, response);
    });
};
