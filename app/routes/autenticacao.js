/**
 * Exporta o módulo de rotas de Autenticação
 * 
 * @param {Application} application 
 */
module.exports = (application) =>
{
    /**
     * Recebe requisições na rota "/autenticar" via método "post" e transfere a requisição para a
     * função "autenticar" que tem o propósito de autenticar o usuário e gerar a sessão
     * no controller "autenticacao"
     */
    application.post("/autenticar", (request, response) =>
    {
        application.app.controllers.autenticacao.autenticar(application, request, response);
    });
    
    /**
     * Recebe requisições na rota "/sair" via método "get" e transfere a requisição para a
     * função "sair" que tem o propósito de deslogar o usuário
     * no controller "autenticacao"
     */
    application.get("/sair", (request, response) =>
    {
        application.app.controllers.autenticacao.sair(application, request, response);
    });
};
