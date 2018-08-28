module.exports = (application) =>
{
    /**
     * Recebe requisições na rota "/operacoes" via método "get" e transfere a requisição para a
     * função "recuperarOperacoes" que tem o propósito recuperar dados referentes a operação
     * no controller "operacoes"
     */
    application.get('/operacoes', (request, response) =>
    {
        application.app.controllers.operacoes.recuperarOperacoes(application, request, response);
    });

    /**
     * Recebe requisições na rota "/desativar-operacao" via método "post" e transfere a requisição para a
     * função "desativarOperacao" que tem o propósito de desativar uma operação no banco
     * no controller "operacoes"
     */
    application.post('/desativar-operacao', (request, response) =>
    {
        application.app.controllers.operacoes.desativarOperacao(application, request, response);
    });
};