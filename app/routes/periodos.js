module.exports = (application) =>
{
    /*                API DE PERÍODOS                                */
    application.get('/periodos', (request, response) =>
    {
        application.app.controllers.periodos.recuperarObjetos(application, request, response);
    });
    application.get('/administrar-periodos', (request, response) =>
    {
        application.app.controllers.periodos.administrar(application, request, response);
    });
    application.post('/cadastrar-periodo', (request, response) =>
    {
        application.app.controllers.periodos.inserir(application, request, response);
    });
    application.post('/atualizar-periodo', (request, response) =>
    {
        application.app.controllers.periodos.atualizar(application, request, response);
    });
};
