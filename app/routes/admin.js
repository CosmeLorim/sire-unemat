/**
 * Exporta o módulo de rotas de Administração
 * 
 * @param {Application} application 
 */
module.exports = (application)=>
{
    /**
     * Recebe requisições na rota "/admin" via método "get" e transfere a requisição para a
     * função "admin" que tem o propósito de renderizar a página de administração
     * no controller "admin"
     */
    application.get("/admin", (request, response) =>
    {
        application.app.controllers.admin.admin(application, request, response);
    });
};