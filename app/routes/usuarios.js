module.exports = function (application)
{
    /*                API DE USUÁRIOS                                */
    application.get('/usuarios', (request, response) =>
    {
        application.app.controllers.usuarios.recuperarTodos(application, request, response);
    });
    application.get('/administrar-usuarios', (request, response) =>
    {
        application.app.controllers.usuarios.administrar(application, request, response);
    });
    application.post('/usuario', (request, response) =>
    {
        application.app.controllers.usuarios.recuperarUm(application, request, response);
    });
    application.post('/cadastrar-usuario', (request, response) =>
    {
        application.app.controllers.usuarios.inserir(application, request, response);
    });
    application.post('/atualizar-usuario', (request, response) =>
    {
        application.app.controllers.usuarios.atualizar(application, request, response);
    });
};
