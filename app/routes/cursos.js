module.exports = (application) =>
{
    /*                API DE CURSOS                                */
    application.get('/cursos', (request, response) =>
    {
        application.app.controllers.cursos.recuperarObjetos(application, request, response);
    });
    application.get('/administrar-cursos', (request, response) =>
    {
        application.app.controllers.cursos.administrar(application, request, response);
    });
    application.post('/cadastrar-curso', (request, response) =>
    {
        application.app.controllers.cursos.inserir(application, request, response);
    });
    application.post('/atualizar-curso', (request, response) =>
    {
        application.app.controllers.cursos.atualizar(application, request, response);
    });
};
