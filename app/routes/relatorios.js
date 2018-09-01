/**
 * Exporta o módulo de rotas de Relatórios
 * 
 * @param {Application} application 
 */
module.exports = (application) =>
{
    const utils = application.app.controllers.utils;
    const relatoriosCtrl = application.app.controllers.relatorios;

    /* Responde a partícula de administração de relatorios */
    application.get("/relatorios", (request, response) =>
    {
        utils.execucaoMiddlewares(application, request, response, utils.verificaETrataNaoAdministrativo, relatoriosCtrl.administrar);
    });

    application.get('/api/relatorios/objetos', (request, response) =>
    {
        utils.execucaoMiddlewares(application, request, response, utils.verificaETrataNaoAdministrativo, relatoriosCtrl.verificaDadosParaRelatoriosETrata, relatoriosCtrl.relatoriosObjeto);
    });

    application.get('/api/relatorios/usuarios', (request, response) =>
    {
        utils.execucaoMiddlewares(application, request, response, utils.verificaETrataNaoAdministrativo, relatoriosCtrl.verificaDadosParaRelatoriosETrata, relatoriosCtrl.relatoriosUsuario);
    });

    application.get('/api/relatorios/disciplinas', (request, response) =>
    {
        utils.execucaoMiddlewares(application, request, response, utils.verificaETrataNaoAdministrativo, relatoriosCtrl.verificaDadosParaRelatoriosETrata, relatoriosCtrl.relatoriosDisciplina);
    });
};
