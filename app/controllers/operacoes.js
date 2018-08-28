/**
 * Responde os dados de um intervalo de operações conforme os dados oriundos
 * da requisição
 * @param {*} application 
 * @param {*} request 
 * @param {*} response 
 */
module.exports.recuperarOperacoes = (application, request, response) =>
{
    if (!application.app.controllers.autenticacao.verificarSeAutenticado(application, request, response))
    {
        application.app.controllers.autenticacao.tratativaRequisicoesNaoAutenticadas(application, request, response);
        return;
    }

    /**
     * Obtém os dados, via URL enconded, da requisição
     */
    const dadosForm = 
    {
        txconsulta: request.query.txconsulta === undefined ? '%' : `%${request.query.txconsulta}%`,
        limit: request.query.limit,
        offset: request.query.offset
    };

    /**
     * Verifica se há todos os dados necessários para atender a requisição e
     * notifica caso haja a falta de algum dado
     */
    if(dadosForm.limit === undefined || dadosForm.offset === undefined)
    {
        response.send(
            {
                status: 'warning',
                title: 'Erro, requisição enviou dados incompletos!',
                msg: 'Não foi possivel responder a requisição.'
            });
        return;
    }

    /**
     * Função de callback para a consulta no banco de dados
     * Faz tratativa de erros de acesso ao banco, reporta caso haja erro na consulta e
     * envia os dados recuperados durante a consulta
     * @param {*} error 
     * @param {*} response 
     */
    const callback = (error, results) =>
    {
        /**
         * Responde se houve erro ou sucesso durante a requisição com o banco de dados e
         * faz log do erro
         */
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro: na recuperação dos operacoes', error);
        } else
        {
            /**
             * Capitura e remove dos dados a serem enviados a quantidade de tuplas existentes
             * no banco conforme os dados da consulta ignorando "limit" e "offset"
             */
            const count = results.rows.pop().count;

            /**
             * Envia em formato JSON os dados da consulta e a quantidade de tuplas
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
     * Carrega a configuração de conexão com o banco de dados
     */
    const connection = application.config.dbConnection;

    /**
     * Instancia a classe DAO de conexão com o banco de dados e carrega a configuração de conexão
     */
    const OperacoesDAO = new application.app.models.OperacoesDAO(connection);

    /**
     * Faz a consulta de operações utilizando os dados informados na requisição
     */
    OperacoesDAO.buscaIntervalo(
        {
            txconsulta: dadosForm.txconsulta,
            limit: dadosForm.limit,
            offset: dadosForm.offset
        },
        callback
    );
};

/**
 * Desativa uma operacao no banco de dados
 * @param {*} application 
 * @param {*} request 
 * @param {*} response 
 */
module.exports.desativarOperacao = (application, request, response) =>
{
    if (!application.app.controllers.autenticacao.verificarSeAutenticado(application, request, response))
    {
        application.app.controllers.autenticacao.tratativaRequisicoesNaoAutenticadas(application, request, response);
        return;
    }
    
    /**
     * Obtém os dados, enviados via método "post", da requisição
     */
    const operacao =
    {
        id: request.body.id
    };

    /**
     * Verifica se há todos os dados necessários para atender a requisição e
     * notifica caso haja a falta de algum dado
     */
    if(operacao.id === undefined)
    {
        response.send(
            {
                status: 'warning',
                title: 'Erro, requisição enviou dados incompletos!',
                msg: 'Não foi possivel responder a requisição.'
            });
        return;
    }

    /**
     * Função de callback para a tentativa de desativação da operacao
     * Faz tratativa de erros de acesso ao banco e reporta se a operação ocorreu com sucesso
     * @param {*} error 
     * @param {*} response 
     */
    const callback = (error, results) =>
    {
        /**
         * Responde se houve erro ou sucesso durante a requisição com o banco de dados e
         * faz log do erro
         */
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro: na recuperação dos operacoes', error);
        }
        else
        {
            response.send({status: 'success', title: 'Desativação de Operação', msg: 'A operação foi cancelada com succeso!'});
        }        
    };

    /**
     * Carrega a configuração de conexão com o banco de dados
     */
    const connection = application.config.dbConnection;

    /**
     * Instancia a classe DAO de conexão com o banco de dados e carrega a configuração de conexão
     */
    const OperacoesDAO = new application.app.models.OperacoesDAO(connection);

    /**
     * Efetua a desativação da operação informada na requisição
     */
    OperacoesDAO.desativarOperacao(
        {
            id: operacao.id
        },
        callback
    );
};