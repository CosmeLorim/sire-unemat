/**
 * Renderiza a página de acesso do professor
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response 
 */
module.exports.comum = (application, request, response) =>
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
     * Rendezia a página de acesso do professor.
     */
    response.render("comum", { usuario: request.session.nome, tempoSessao: parseInt(process.env.EXPRESS_COOKIE_MAXAGE) });
};