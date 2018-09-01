/**
 * Exporta o módulo de rotas de Tipos Objetos
 * 
 * @param {Application} application 
 */
module.exports = (application) =>
{
    const utils = application.app.controllers.utils;
    const tiposObjetosCtrl = application.app.controllers.tiposObjetos;

    /* Responde a partícula de administração de tiposobjetos */
    application.get("/tipos-objeto", (request, response) =>
    {
        utils.execucaoMiddlewares(application, request, response, utils.verificaETrataNaoAdministrativo, tiposObjetosCtrl.administrar);
    });
    
    /* Recupera dados referentes a tipos de objetos */
    application.get("/api/tipos-objeto", (request, response) =>
    {
        utils.execucaoMiddlewares(application, request, response, utils.verificaETrataNaoAdministrativo, tiposObjetosCtrl.buscar);
    });
    
    /* Cadastra um novo tipo de objeto */
    application.post("/api/tipos-objeto", (request, response) =>
    {
        utils.execucaoMiddlewares(application, request, response, utils.verificaETrataNaoAdministrativo, tiposObjetosCtrl.inserir);
    });

    /* Atualiza um tipo de objeto */
    application.put("/api/tipos-objeto/:id", (request, response) =>
    {
        utils.execucaoMiddlewares(application, request, response, utils.verificaETrataNaoAdministrativo, tiposObjetosCtrl.atualizar);
    });
};
