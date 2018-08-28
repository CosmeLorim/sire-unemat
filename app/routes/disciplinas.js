module.exports = (application) =>
{
    /*                API DE DISCIPLINAS                                */
    application.get('/disciplinas', (request, response) =>
    {
        application.app.controllers.disciplinas.recuperarTodas(application, request, response);
    });
    application.get('/disciplinas/ativas', (request, response) =>
    {
        application.app.controllers.disciplinas.recuperarTodasAtivas(application, request, response);
    });
    application.get('/disciplinas/ativas/nao-oferecidas', (request, response) =>
    {
        application.app.controllers.disciplinas.recuperarTodasAtivasNaoOferecidas(application, request, response);
    });
    application.get('/administrar-disciplinas', (request, response) =>
    {
        application.app.controllers.disciplinas.administrar(application, request, response);
    });
    application.post('/cadastrar-disciplina', (request, response) =>
    {
        application.app.controllers.disciplinas.inserir(application, request, response);
    });
    application.post('/atualizar-disciplina', (request, response) =>
    {
        application.app.controllers.disciplinas.atualizar(application, request, response);
    });
};
