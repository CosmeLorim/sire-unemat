/**
 * Exporta o módulo de rotas da raiz
 * 
 * @param {Application} application 
 */
module.exports = function(application)
{
    /**
     * Recebe requisições na rota "/" via método "get" e transfere a requisição para a
     * função "inicio" que tem o propósito de renderizar a página inicial
     * no controller "inicio"
     */
    application.get("/", (request, response) =>
    {
        application.app.controllers.inicio.inicio(application, request, response);
    });
};