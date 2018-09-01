/**
 * Renderiza a página de administração
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response 
 */
module.exports.admin = (application, request, response) =>
{
    /**
     * Verifica se está autenticado,
     * caso esteja: o fluxo de execução continua e
     * caso não esteja: a requisição é transferida para a tratativa no controller "autenticacao" e
     * interrompe o fluxo
     */
    if (!application.app.controllers.autenticacao.verificarSeAutenticado(application, request, response))
    {
        response.redirect("/");
        return;
    }

    /**
     * Verifica se é administrador,
     * caso seja: o fluxo de execução continua e
     * caso não seja: a requisição é transferida para a tratativa no controller "autenticacao" e
     * interrompe o fluxo
     */
    if(!application.app.controllers.autenticacao.verificarSeAdministrador(application, request, response))
    {
        application.app.controllers.autenticacao.tratativaRotaAdministrativaNaoAdministrador(application, request, response);
        return;
    }

    /**
     * Rendezia a página de administração.
     */
    response.render("admin", { usuario: request.session.nome, tempoSessao: parseInt(process.env.EXPRESS_COOKIE_MAXAGE) });
};