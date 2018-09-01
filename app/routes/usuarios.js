/**
 * Exporta o módulo de rotas de Usuários
 * 
 * @param {Application} application 
 */
module.exports = function (application)
{
    const utils = application.app.controllers.utils;
    const usuariosCtrl = application.app.controllers.usuarios;

    /* Renderiza a partícula de administração de usuários */
    application.get("/usuarios", (request, response) =>
    {
        utils.execucaoMiddlewares(application, request, response, utils.verificaETrataNaoAdministrativo, usuariosCtrl.administrar);
    });

    /* Busca dados referentes a usuários */
    application.get("/api/usuarios", (request, response) =>
    {
        utils.execucaoMiddlewares(application, request, response, utils.verificaETrataNaoAdministrativo, usuariosCtrl.buscar);
    });

    /* Busca dados de um usuário expecífico */
    application.get("/api/usuarios/:id", (request, response) =>
    {
        utils.execucaoMiddlewares(application, request, response, utils.verificaETrataNaoAdministrativo, usuariosCtrl.buscarUm);
    });

    /* Cadastra um novo usuário */
    application.post("/api/usuarios", (request, response) =>
    {
        utils.execucaoMiddlewares(application, request, response, utils.verificaETrataNaoAdministrativo, usuariosCtrl.inserir);
    });

    /* Atualiza um usuário */
    application.put("/api/usuarios/:usr", (request, response) =>
    {
        utils.execucaoMiddlewares(application, request, response, utils.verificaETrataNaoAdministrativo, usuariosCtrl.atualizar);
    });
};
