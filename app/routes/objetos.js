module.exports = function (application)
{
    /*              API DE OBJETOS                                     */
    application.get('/objetos', (request, response) =>
    {
        application.app.controllers.objetos.recuperarObjetos(application, request, response);
    });
    application.get('/administrar-objetos', (request, response) =>
    {
        application.app.controllers.objetos.administrar(application, request, response);
    });
    application.post('/cadastrar-objeto', (request, response) =>
    {
        application.app.controllers.objetos.inserir(application, request, response);
    });
    application.post('/atualizar-objeto', (request, response) =>
    {
        application.app.controllers.objetos.atualizar(application, request, response);
    });
};
