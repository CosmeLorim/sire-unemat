/**
 * Trata a requisição quando não o requisitante não forneceu os dados necessários para atender a requisição
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response 
 */
module.exports.tratativaRequisicaoFaltandoDados = (application, request, response) =>
{
    response.send({ status: "warning", title: "Erro, requisição enviou dados incompletos!", msg: "Não foi possivel responder a requisição." });
};

/**
 * Verifica se o usuário está autenticado, se é administrador e trata caso não seja a.
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response 
 * @param {Next} next
 */
module.exports.verificaETrataNaoAdministrativo = (application, request, response, next) =>
{
    if (!application.app.controllers.autenticacao.verificarSeAutenticado(application, request, response))
    {
        application.app.controllers.autenticacao.tratativaRequisicoesNaoAutenticadas(application, request, response);
        return;
    }
    
    if(!application.app.controllers.autenticacao.verificarSeAdministrador(application, request, response))
    {
        application.app.controllers.autenticacao.tratativaRequisicoesDeNaoAdministrador(application, request, response);
        return;
    }
    
    next();
};

/**
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response 
 * @param {Middleware} ...middlewares 
 */
module.exports.execucaoMiddlewares = (application, request, response, ...middlewares) =>
{
    const execucaoPassos = indice =>
    {
        if(middlewares && indice < middlewares.length)
            middlewares[indice](application, request, response, () => execucaoPassos(indice + 1));
    };

    execucaoPassos(0);
};
