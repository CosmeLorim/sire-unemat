/**
 * Responde os dados de um intervalo de operações conforme os dados oriundos da requisição
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
     * Verifica se há todos os dados necessários para atender a requisição e
     * notifica caso haja a falta de algum dado
     */
    if(typeof(request.query.limit) === "undefined" || typeof(request.query.limit) === "undefined" || typeof(request.query.offset) === "undefined")
    {
        application.app.controllers.utils.tratativaRequisicaoFaltandoDados(application, request, response);
        return;
    }
    
    /**
     * Dados obtidos, via URL enconded, da requisição
     */
    const dadosForm = 
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
    const OperacoesDAO = new application.app.models.OperacoesDAO(connection);

    /**
     * Função de callback para a consulta no banco de dados
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
            console.log("Erro: na recuperação dos operacoes", error);
        } else
        {
            /**
             * Captura e remove dos dados a serem enviados a quantidade de tuplas existentes
             * no banco conforme os dados da consulta ignorando "limit" e "offset"
             */
            const count = results.rows.pop().count;
            
            /**
             * Trata operações sem descrição colocando a descrição "Aula - <disciplina.descricao> (descrição gerada automáticamente)"
            */
            const resultados = results.rows.map(row =>
            {
                row.descricao = row.operacao_descricao !== '' ? row.operacao_descricao : `Aula - ${row.disciplina_descricao} (descrição gerada automáticamente)`;
                delete row.operacao_descricao;
                delete row.disciplina_descricao;
                return row;
            });

            /**
             * Envia em formato JSON os dados da consulta e a quantidade de tuplas
             */
            response.send(JSON.stringify(
                    {
                        total: count,
                        rows: resultados
                    }
            ));
        }
    };

    /**
     * Faz a consulta de operações utilizando os dados informados na requisição
     */
    OperacoesDAO.buscaIntervalo(
        {
            txConsulta: dadosForm.txConsulta,
            limit: dadosForm.limit,
            offset: dadosForm.offset,
            admin: request.session.admin ? false : request.session.usr
        },
        callback
    );
};

/**
 * Desativa uma operacao no banco de dados
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
     * Verifica se há todos os dados necessários para atender a requisição e
     * notifica caso haja a falta de algum dado
     */
    if(typeof(request.params.id) === "undefined")
    {
        application.app.controllers.utils.tratativaRequisicaoFaltandoDados(application, request, response);
        return;
    }

    /**
     * Dados obtidos, enviados via método "post", da requisição
     */
    const dadosPost =
    {
        id: request.params.id
    };
    
    /**
     * Configuração de conexão com o banco de dados
     */
    const connection = application.config.dbConnection;

    /**
     * Instância da classe DAO de conexão com o banco de dados com configuração de conexão pronta
     */
    const OperacoesDAO = new application.app.models.OperacoesDAO(connection);

    /**
     * Callback para verificar se o usuário está tentando desativar uma operação que é dele
     * Faz tratativa de erros de acesso ao banco e reporta se a operação ocorreu com sucesso
     *
     * @param {Error} error 
     * @param {QueryResult} results 
     */
    const callbackVerificacaoDaOperacao = (error, results) =>
    {
        /**
         * Responde se houve erro ou sucesso durante a requisição com o banco de dados e
         * faz log do erro
         */
        if (error)
        {
            response.send({status: "alert", title: "Erro!", msg: "Erro no servidor."});
            console.log("Erro: na verificação do usuário da operação", error);
        }
        else
        {
            if(results.rows[0].pertence)
            {
                /**
                 * Efetua a desativação da operação informada na requisição
                 */
                OperacoesDAO.desativarOperacao(
                    {
                        id: dadosPost.id
                    },
                    callbackDesativacaoOperacao
                );
            } else
            {
                response.send({status: "success", title: "Operação não permitida", msg: "Você está tentando desativar uma operação que não tem permissão!"});
            }
        }
    }

    /**
     * Callback para a tentativa de desativação da operacao
     * Faz tratativa de erros de acesso ao banco e reporta se a operação ocorreu com sucesso
     *
     * @param {Error} error 
     * @param {QueryResult} results 
     */
    const callbackDesativacaoOperacao = (error, results) =>
    {
        /**
         * Responde se houve erro ou sucesso durante a requisição com o banco de dados e
         * faz log do erro
         */
        if (error)
        {
            response.send({status: "alert", title: "Erro!", msg: "Erro no servidor."});
            console.log("Erro: na desativação da operação", error);
        }
        else
        {
            response.send({status: "success", title: "Desativação de Operação", msg: "A operação foi cancelada com succeso!"});
        }        
    };

    /**
     * Verifica se o usuário é administrador
     * Caso seja administrado continua para a desativação da operação
     * Caso não seja administrador verifica se o usuário é dono da operação
     */
    if(request.session.admin)
    {
        /**
         * Efetua a desativação da operação informada na requisição
         */
        OperacoesDAO.desativarOperacao(
            {
                id: dadosPost.id
            },
            callbackDesativacaoOperacao
        );
    } else
    {
        /**
         * Efetua a verificação do usuário da operaçaõ
         */
        OperacoesDAO.verificarUsuarioDaOperacao(
            {
                usr: request.session.usr,
                operacao: dadosPost.id
            }, callbackVerificacaoDaOperacao
        )
    }
};