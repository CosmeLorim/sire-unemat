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
 * Responde os dados de um intervalo de oferecimentos conforme os dados oriundos da requisição
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response
 */
module.exports.buscar = (application, request, response) =>
{
    /**
     * Verifica se está autenticado
     * caso esteja: o fluxo de execução continua
     * caso não esteja: a requisição é transferida para a tratativa no controller "autenticacao" e
     * interrompe o fluxo
     */
    if (!application.app.controllers.autenticacao.verificarSeAutenticado(application, request, response))
    {
        application.app.controllers.autenticacao.tratativaRequisicoesNaoAutenticadas(application, request, response);
        return;
    }

    /**
     * Verifica se há todos os dados necessários para atender a requisição
     * notifica caso haja a falta de algum dado
     */
    if(typeof(request.query.limit) === "undefined" || typeof(request.query.offset) === "undefined")
    {
        application.app.controllers.utils.tratativaRequisicaoFaltandoDados(application, request, response);
        return;
    }
    
    /**
     * Dados obtidos, via URL enconded, da requisição
     */
    const dadosURLEncoded =
    {
        txConsulta: typeof(request.query.txConsulta) === "undefined" ? "%" : `%${request.query.txConsulta}%`,        
        limit: request.query.limit,
        offset: request.query.offset
    };

    /**
     * Configuração de conexão com o banco de dados
     */
    const connection = application.config.dbConnection;

    /**
     * Instância da classe DAO de conexão com o banco de dados com configuração de conexão pronta
     */
    const OferecimentosDAO = new application.app.models.OferecimentosDAO(connection);

    /**
     * Callback para a consulta no banco de dados
     * Faz tratativa de erros de acesso ao banco, reporta caso haja erro na consulta e
     * envia os dados recuperados durante a consulta
     * 
     * @param {Error} error 
     * @param {QueryResult} results 
     */
    const callback = (error, results) =>
    {
        /**
         * Responde se houve erro ou sucesso durante a requisição com o banco de dados e
         * faz log do erro
         */
        if (error)
        {
            response.send({status: "alert", title: "Erro!", msg: "Erro no servidor."});
            console.log("Erro na recuperação dos oferecimentos", error);
        } else
        {
            /**
             * Captura e remove dos dados a serem enviados a quantidade de tuplas existentes
             * no banco conforme os dados da consulta ignorando "limit" e "offset"
             */
            const count = results.rows.pop().count;
            
            /**
             * Envia em formato JSON os dados da consulta e a quantidade de registros
             */
            response.send(JSON.stringify(
                {
                    total: count,
                    rows: results.rows
                }
            ));
        }
    };
    
    /**
     * Efetua a consulta de operações utilizando os dados informados na requisição
     */
    OferecimentosDAO.buscaIntervaloAtivo(
        {
            txConsulta: dadosURLEncoded.txConsulta,
            limit: dadosURLEncoded.limit,
            offset: dadosURLEncoded.offset,
            admin: request.session.admin ? false : request.session.usr
        }, callback);
};

/**
 * Responde a particula de administração de oferecimentos
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response 
 */
module.exports.administrar = async (application, request, response) =>
{
    /**
     * Verifica se está autenticado
     * caso esteja: o fluxo de execução continua
     * caso não esteja: a requisição é transferida para a tratativa no controller "autenticacao" e
     * interrompe o fluxo
     */
    if (!application.app.controllers.autenticacao.verificarSeAutenticado(application, request, response))
    {
        application.app.controllers.autenticacao.tratativaRotaAdminNaoAutenticado(application, request, response);
        return;
    }

    /**
     * Verifica se é administrador
     * caso seja: o fluxo de execução continua
     * caso não seja: a requisição é transferida para a tratativa no controller "autenticacao" e
     * interrompe o fluxo
     */
    if(!application.app.controllers.autenticacao.verificarSeAdministrador(application, request, response))
    {
        application.app.controllers.autenticacao.tratativaRotaAdministrativaNaoAdministrador(application, request, response);
        return;
    }

    /**
     * Configuração de conexão com o banco de dados
     */
    const connection = application.config.dbConnection;

    /**
     * Instância da classe DAO de conexão com o banco de dados com configuração de conexão pronta
     */
    const OferecimentosDAO = new application.app.models.OferecimentosDAO(connection);

    try {
        const results = await OferecimentosDAO.buscarPeriodoAtivoECursosAsync();

        const periodoAtivo = results.shift();
        const cursos = results;
        
        response.render("admin/oferecimentos", { periodo: periodoAtivo, cursos: cursos });
    } catch (error) {
        tratativaErrosConsultas(error, response);
    }
};

/**
 * Cadastra um novo oferecimento
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response 
 */
module.exports.inserir = async (application, request, response) =>
{
    /**
     * Verifica se está autenticado
     * caso esteja: o fluxo de execução continua
     * caso não esteja: a requisição é transferida para a tratativa no controller "autenticacao" e
     * interrompe o fluxo
     */
    if (!application.app.controllers.autenticacao.verificarSeAutenticado(application, request, response))
    {
        application.app.controllers.autenticacao.tratativaRequisicoesNaoAutenticadas(application, request, response);
        return;
    }
    
    /**
     * Verifica se é administrador
     * caso seja: o fluxo de execução continua
     * caso não seja: a requisição é transferida para a tratativa no controller "autenticacao" e
     * interrompe o fluxo
     */
    if(!application.app.controllers.autenticacao.verificarSeAdministrador(application, request, response))
    {
        application.app.controllers.autenticacao.tratativaRequisicoesDeNaoAdministrador(application, request, response);
        return;
    }
    
    /**
     * Verifica se há todos os dados necessários para atender a requisição e
     * notifica caso haja a falta de algum dado
     */
    if(typeof(request.body.periodo) === "undefined" || typeof(request.body.usuario) === "undefined")
    {
        application.app.controllers.utils.tratativaRequisicaoFaltandoDados(application, request, response);
        return;
    }

    /**
     * Dados obtidos, via método post, da requisição
     */
    const dadosPost = 
    {
        disciplina: request.body.disciplina,
        periodo: request.body.periodo,
        usuario: request.body.usuario
    };
    
    /**
     * Configuração de conexão com o banco de dados
     */
    const connection = application.config.dbConnection;

    /**
     * Instância da classe DAO de conexão com o banco de dados com configuração de conexão pronta
     */
    const OferecimentosDAO = new application.app.models.OferecimentosDAO(connection);
    
    try {
        const conflitoDeOferecimento = typeof(dadosPost.disciplina) !== 'undefined' ?
            await OferecimentosDAO.verificarOferecimentoComDisciplinaAsync(
                { periodo: dadosPost.periodo, disciplina: dadosPost.disciplina })
            : await OferecimentosDAO.verificarOferecimentoSemDisciplinaAsync(
                { usuario: dadosPost.usuario, periodo: dadosPost.periodo });
        /* Evita duplicidade de oferecimentos */
        if(conflitoDeOferecimento[0].existe)
        {
            if(typeof(dadosPost.disciplina) === 'undefined')
                response.send({ status: "warning", title: "Erro!", msg: "Este usuário já possui um oferecimento sem disciplina neste semestre." });
            else
                response.send({ status: "warning", title: "Erro!", msg: "Esta disciplina já possui oferecimento neste semestre." });
            return;
        }

        await OferecimentosDAO.inserirAsync({ periodo: dadosPost.periodo, usuario: dadosPost.usuario, disciplina: dadosPost.disciplina });

        response.send({ status: "success", title: "Sucesso!", msg: "Oferecimento reativado com sucesso!" });        
    } catch (error) {
        tratativaErrosConsultas(error, response);
    }
};

/**
 * Desativa um oferecimento no banco de dados
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response 
 */
module.exports.desativar = (application, request, response) =>
{
    /**
     * Verifica se está autenticado
     * caso esteja: o fluxo de execução continua
     * caso não esteja: a requisição é transferida para a tratativa no controller "autenticacao" e
     * interrompe o fluxo
     */
    if (!application.app.controllers.autenticacao.verificarSeAutenticado(application, request, response))
    {
        application.app.controllers.autenticacao.tratativaRequisicoesNaoAutenticadas(application, request, response);
        return;
    }
    
    /**
     * Verifica se é administrador
     * caso seja: o fluxo de execução continua
     * caso não seja: a requisição é transferida para a tratativa no controller "autenticacao" e
     * interrompe o fluxo
     */
    if(!application.app.controllers.autenticacao.verificarSeAdministrador(application, request, response))
    {
        application.app.controllers.autenticacao.tratativaRequisicoesDeNaoAdministrador(application, request, response);
        return;
    }

    /**
     * Verifica se há todos os dados necessários para atender a requisição e
     * notifica caso haja a falta de algum dado
     */
    if(typeof(request.params.id) === "undefined")
    {
        application.app.controllers.utils.tratativaRequisicaoFaltandoDados(application, request, response);
        return;
    }

    /**
     * Dados obtidos, via método post, da requisição
     */
    const dadosPost = 
    {
        id: request.params.id,
    };
    
    /**
     * Configuração de conexão com o banco de dados
     */
    const connection = application.config.dbConnection;

    /**
     * Instância da classe DAO de conexão com o banco de dados com configuração de conexão pronta
     */
    const OferecimentosDAO = new application.app.models.OferecimentosDAO(connection);

    /**
     * Callback para desatvação de um oferecimento
     * Faz tratativa de erros de acesso ao banco e reporta se a operação ocorreu com sucesso
     *
     * @param {Error} error 
     * @param {QueryResult} results 
     */
    const callback = (error, results) =>
    {
        if (error)
        {
            response.send({status: "alert", title: "Erro!", msg: "Erro no servidor."});
            console.log("Erro ao atualizar oferecimento: ", error);
        } else
        {
            response.send({status: "success", title: "Sucesso!", msg: "Oferecimento cancelado com sucesso!"});
        }
    };

    /**
     * Efetua a desativação do oferecimento utilizando os dados informados na requisição
     */
    OferecimentosDAO.desativar({ oferecimento: dadosPost.id }, callback);
};

/**
 * Atualiza um oferecimento no banco de dados
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response 
 */
module.exports.atualizar = async (application, request, response) =>
{
    /**
     * Verifica se está autenticado
     * caso esteja: o fluxo de execução continua
     * caso não esteja: a requisição é transferida para a tratativa no controller "autenticacao" e
     * interrompe o fluxo
     */
    if (!application.app.controllers.autenticacao.verificarSeAutenticado(application, request, response))
    {
        application.app.controllers.autenticacao.tratativaRequisicoesNaoAutenticadas(application, request, response);
        return;
    }
    
    /**
     * Verifica se é administrador
     * caso seja: o fluxo de execução continua
     * caso não seja: a requisição é transferida para a tratativa no controller "autenticacao" e
     * interrompe o fluxo
     */
    if(!application.app.controllers.autenticacao.verificarSeAdministrador(application, request, response))
    {
        application.app.controllers.autenticacao.tratativaRequisicoesDeNaoAdministrador(application, request, response);
        return;
    }

    /**
     * Verifica se há todos os dados necessários para atender a requisição e
     * notifica caso haja a falta de algum dado
     */
    if(typeof(request.params.id) === "undefined")
    {
        application.app.controllers.utils.tratativaRequisicaoFaltandoDados(application, request, response);
        return;
    }

    /**
     * Dados obtidos, via método post, da requisição
     */
    const dadosPost = 
    {
        id: request.params.id,
        usuario: request.body.usuario
    };

    /**
     * Configuração de conexão com o banco de dados
     */
    const connection = application.config.dbConnection;

    /**
     * Instância da classe DAO de conexão com o banco de dados com configuração de conexão pronta
     */
    const OferecimentosDAO = new application.app.models.OferecimentosDAO(connection);

    try {
        await OferecimentosDAO.atualizarAsync({ id: dadosPost.id, usuario: dadosPost.usuario });
        
        response.send({status: "success", title: "Sucesso!", msg: "Oferecimento atualizado com sucesso!"});
    } catch (error) {
        tratativaErrosConsultas(error, response);
    }
}
