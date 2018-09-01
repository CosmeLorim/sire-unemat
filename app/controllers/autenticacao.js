/**
 * Trata erros de chamadas assíncronas.
 * 
 * @param {String} error
 */
const tratativaErrosConsultas = (error, response) =>
{
    console.error(error);
    response.send({ status: "alert", title: "Erro!", msg: "Erro no servidor." });
}

/**
 * Efetua a autenticação de usuário
 * 
 * @param {Application} application 
 * @param {Resquest} request 
 * @param {Response} response 
 */
module.exports.autenticar = async (application, request, response) =>
{
    if(typeof(request.body.usr) === "undefined" || typeof(request.body.passwd) === "undefined")
    {
        application.app.controllers.utils.tratativaRequisicaoFaltandoDados(application, request, response);
        return;
    }
    
    const dadosReq = 
    {
        usr: request.body.usr,
        passwd: request.body.passwd
    };

    const AutenticacaoDAO = new application.app.models.AutenticacaoDAO(application.config.dbConnection);

    try {
        const usuario = await AutenticacaoDAO.buscarUsuario({ usr: dadosReq.usr });
        
        if (usuario.length === 0)
        {
            response.send({status: "alert", title: "Erro!", msg: "Usuário não encontrado."});
            return;
        }
        
        if (usuario[0].passwd !== dadosReq.passwd)
        {
            response.send({status: "alert", title: "Erro!", msg: "Senha incorreta."});
            return;
        }

        const oferecimento = await AutenticacaoDAO.verificarOferecimento({ usr: dadosReq.usr });
        
        if(!usuario[0].admin && !oferecimento[0].possui)
        {
            response.send({ status: "alert", title: "Erro!", msg: "Este usuário não tem permissão de acessar, pois não há disciplinas ligadas a ele no período vigente." });
            return;
        }

        request.session.autorizado = true;
        request.session.usr = dadosReq.usr;
        request.session.nome = usuario[0].nome;
        request.session.admin = usuario[0].admin;

        response.send(
            {
                status: "success",
                usuario: { admin: request.session.admin, nome: request.session.nome, usr: request.session.usr, primeiroLogin: usuario[0].primeiro_login }
            });
    } catch (error) {
        tratativaErrosConsultas(error, response)
    }
};

/**
 * Efetua o logoff de usuário
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response 
 */
module.exports.sair = (application, request, response) =>
{
    request.session.destroy((error) =>
    {
        response.redirect("/");
    });
};

/**
 * Verifica se quem requisitou está autenticado
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response 
 */
module.exports.verificarSeAutenticado = (application, request, response) => request.session.autorizado;

/**
 * Trata a requisição de rotas administrativas quando não está logado
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response 
 */
module.exports.tratativaRotaAdminNaoAutenticado = (application, request, response) =>
{
    response.send(`<center><h2>Você não está logado, retorne a <a href="/">página inicial</a> e faça login</h2></center>`);
};

/**
 * Trata as requisições não autenticadas
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response 
 */
module.exports.tratativaRequisicoesNaoAutenticadas = (application, request, response) =>
{
    response.send({ status: "alert", title: "Erro de autenticação!", msg: "Você não pode fazer essa ação sem estar logado, faça login e tente novamente!" });
};

/**
 * Verifica se o requisitante é administrador
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response  
 */
module.exports.verificarSeAdministrador = (application, request, response) => request.session.admin;

/**
 * Trata a requisição de rotas administrativas quando não o requisitante não é administrador
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response 
 */
module.exports.tratativaRotaAdministrativaNaoAdministrador = (application, request, response) =>
{
    response.send(`<center><h2>Você não é administrador, retorne a <a href="/">página inicial</a>!</h2></center>`);
};

/**
 * Trata requisições quando o requisitante não é administrador
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response 
 */
module.exports.tratativaRequisicoesDeNaoAdministrador = (application, request, response) =>
{
    response.send({status: "alert", title: "Erro de autorização!", msg: "Você não pode fazer essa ação se não for administrador!"});
};