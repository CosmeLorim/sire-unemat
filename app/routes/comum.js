/**
 * Exporta o módulo de rotas da área do professor
 * 
 * @param {Application} application 
 */
module.exports = (application)=>
{
    /**
     * Recebe requisições na rota "/professor" via método "get" e transfere a requisição para a
     * função "comum" que tem o propósito de renderizar a página de acesso do professor
     * no controller "comum"
     */
    application.get("/comum", (request, response) =>
    {
        application.app.controllers.comum.comum(application, request, response);
    });
};