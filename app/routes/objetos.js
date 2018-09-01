/**
 * Exporta o módulo de rotas de Objetos
 * 
 * @param {Application} application 
 */
module.exports = function (application)
{
    const utils = application.app.controllers.utils;
    const objetosCtrl = application.app.controllers.objetos;
    
    /* Renderiza a partícula de administração de objetos */
    application.get("/objetos", (request, response) =>
    {
        utils.execucaoMiddlewares(application, request, response, utils.verificaETrataNaoAdministrativo, objetosCtrl.administrar);
    });

    /* Busca dados referentes a objetos */
    application.get("/api/objetos", (request, response) =>
    {
        utils.execucaoMiddlewares(application, request, response, utils.verificaETrataNaoAdministrativo, objetosCtrl.buscar);
    });

    /* Cadastra um novo objeto */
    application.post("/api/objetos", (request, response) =>
    {
        utils.execucaoMiddlewares(application, request, response, utils.verificaETrataNaoAdministrativo, objetosCtrl.inserir);
    });

    /* Atualiza um objeto */
    application.put("/api/objetos/:id", (request, response) =>
    {
        utils.execucaoMiddlewares(application, request, response, utils.verificaETrataNaoAdministrativo, objetosCtrl.atualizar);
    });
};
