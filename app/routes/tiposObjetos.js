module.exports = (application) =>
{
    /*                API DE CATEGORIAS                                */
    application.get('/tiposobjetos', (request, response) =>
    {
        application.app.controllers.tiposObjetos.recuperarObjetos(application, request, response);
    });
    application.get('/administrar-tiposobjetos', (request, response) =>
    {
        application.app.controllers.tiposObjetos.administrar(application, request, response);
    });
    application.post('/cadastrar-tipoobjeto', (request, response) =>
    {
        application.app.controllers.tiposObjetos.inserir(application, request, response);
    });
    application.post('/atualizar-tipoobjeto', (request, response) =>
    {
        application.app.controllers.tiposObjetos.atualizar(application, request, response);
    });
};
