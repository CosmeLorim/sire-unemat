/**
 * Exporta o módulo de rotas de Oferecimentos
 * 
 * @param {Application} application 
 */
module.exports = (application) =>
{
    /**
     * Recebe requisições na rota "/oferecimentos" via método "get" e transfere a requisição para a
     * função "administrar" que tem o propósito de renderizar a partícula de administração de oferecimentos
     * no controller "oferecimentos"
     */
    application.get("/oferecimentos", (request, response) =>
    {
        application.app.controllers.oferecimentos.administrar(application, request, response);
    });

    /**
     * Recebe requisições na rota "/api/oferecimentos" via método "get" e transfere a requisição para a
     * função "buscar" que tem o propósito de buscar dados referentes a oferecimentos
     * no controller "oferecimentos"
     */
    application.get("/api/oferecimentos", (request, response) =>
    {
        application.app.controllers.oferecimentos.buscar(application, request, response);
    });

    /**
     * Recebe requisições na rota "/api/oferecimento" via método "post" e transfere a requisição para a
     * função "inserir" que tem o propósito de cadastrar um novo oferecimento
     * no controller "oferecimentos"
     */
    application.post("/api/oferecimento", (request, response) =>
    {
        application.app.controllers.oferecimentos.inserir(application, request, response);
    });

    application.put("/api/oferecimento/:id", (request, response) =>
    {
        application.app.controllers.oferecimentos.atualizar(application, request, response);
    })

    /**
     * Recebe requisições na rota "/api/oferecimento" via método "delete" e transfere a requisição para a
     * função "desativar" que tem o propósito de desativar um oferecimento
     * no controller "oferecimentos"
     */
    application.delete("/api/oferecimento/:id", (request, response) =>
    {
        application.app.controllers.oferecimentos.desativar(application, request, response);
    });
};
