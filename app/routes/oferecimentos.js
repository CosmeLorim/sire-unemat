module.exports = (application) =>
{
    /*                API DE OFERECIMENTOS                                */
    application.get('/oferecimentos', (request, response) =>
    {
        application.app.controllers.oferecimentos.recuperarObjetos(application, request, response);
    });
    application.get('/administrar-oferecimentos', (request, response) =>
    {
        application.app.controllers.oferecimentos.administrar(application, request, response);
    });
    application.post('/cadastrar-oferecimento', (request, response) =>
    {
        application.app.controllers.oferecimentos.inserir(application, request, response);
    });
    application.post('/desativar-oferecimento', (request, response) =>
    {
        application.app.controllers.oferecimentos.desativar(application, request, response);
    });
};
