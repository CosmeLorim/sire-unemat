/**
 * Exporta o módulo de rotas de Cursos
 * 
 * @param {Application} application 
 */
module.exports = (application) =>
{
    const utils = application.app.controllers.utils;
    const cursosCtrl = application.app.controllers.cursos;

    /* Renderiza a partícula de administração de cursos */
    application.get("/cursos", (request, response) =>
    {
        utils.execucaoMiddlewares(application, request, response, utils.verificaETrataNaoAdministrativo, cursosCtrl.administrar);
    });

    /* Busca dados referentes a cursos */
    application.get("/api/cursos", (request, response) =>
    {
        utils.execucaoMiddlewares(application, request, response, utils.verificaETrataNaoAdministrativo, cursosCtrl.buscar);
    });

    /* Cadastra um novo curso */
    application.post("/api/cursos", (request, response) =>
    {
        utils.execucaoMiddlewares(application, request, response, utils.verificaETrataNaoAdministrativo, cursosCtrl.inserir);
    });

    /* Atualiza um curso */
    application.put("/api/cursos/:id", (request, response) =>
    {
        utils.execucaoMiddlewares(application, request, response, utils.verificaETrataNaoAdministrativo, cursosCtrl.atualizar);
    });
};
