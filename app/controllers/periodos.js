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
 * Responde os dados de um intervalo de periodos conforme os dados oriundos da requisição
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
        offset: request.query.offset,
    };

    /**
     * Configuração de conexão com o banco de dados
     */
    const connection = application.config.dbConnection;

    /**
     * Instância da classe DAO de conexão com o banco de dados com configuração de conexão pronta
     */
    const PeriodosDAO = new application.app.models.PeriodosDAO(connection);

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
         * Responde se houve erro ou sucesso durante a requisição com o banco de dados e faz log do erro
         */
        if (error)
        {
            response.send({status: "alert", title: "Erro!", msg: "Erro no servidor."});
            console.log("Erro: na recuperação dos objetos", error);
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
    PeriodosDAO.buscaIntervalo(
        {
            order: dadosURLEncoded.order,
            limit: dadosURLEncoded.limit,
            offset: dadosURLEncoded.offset,
            txConsulta: dadosURLEncoded.txConsulta
        }, callback);
};

/**
 * Responde a particula de administração de usuário
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response 
 */
module.exports.administrar = (application, request, response) =>
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
     * Responde a partícula de administração de períodos
     */
    response.render("admin/periodos");
};

/**
 * Cadastra um novo período
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response 
 */
module.exports.inserir = (application, request, response) =>
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
    if(typeof(request.body.nome)  === "undefined" || typeof(request.body.ativo) === "undefined" || 
       typeof(request.body.dataInicio.dia) === "undefined" || typeof(request.body.dataInicio.mes) === "undefined" || typeof(request.body.dataInicio.ano) === "undefined" ||
       typeof(request.body.dataFim.dia)    === "undefined" || typeof(request.body.dataFim.mes)    === "undefined" || typeof(request.body.dataFim.ano)    === "undefined")
    {
        application.app.controllers.utils.tratativaRequisicaoFaltandoDados(application, request, response);
        return;
    }

    /**
     * Dados obtidos, via método post, da requisição
     */    
    const dadosPost =
    {
        nome: request.body.nome,
        ativo: JSON.parse(request.body.ativo),
        dataInicio: application.app.modules.datas.dataParaTimesTamp(
            {
                dia: request.body.dataInicio.dia,
                mes: request.body.dataInicio.mes,
                ano: request.body.dataInicio.ano   
            }
        ),
        dataFim: application.app.modules.datas.dataParaTimesTamp(
            {
                dia: request.body.dataFim.dia,
                mes: request.body.dataFim.mes,
                ano: request.body.dataFim.ano   
            }
        )
    };

    /**
     * Configuração de conexão com o banco de dados
     */
    const connection = application.config.dbConnection;

    /**
     * Instância da classe DAO de conexão com o banco de dados com configuração de conexão pronta
     */
    const PeriodosDAO = new application.app.models.PeriodosDAO(connection);
    
    /**
     * Callback para verificar a existência de um período com a mesma descrição fornecida e com conflito de tempo
     * Faz tratativa de erros de acesso ao banco e reporta se a operação ocorreu com sucesso
     *
     * @param {Error} error 
     * @param {QueryResult} results 
     */
    const callbackVerificacao = (error, results) =>
    {
        if (error)
        {
            response.send({status: "alert", title: "Erro!", msg: "Erro no servidor."});
            console.log("Erro na verificação de períodos: ", error);
        } else
        {
            /**
             * Caso não haja um objeto com a descrição fornecida é feita a inserção
             * Caso haja um objeto com a descrição fornecida a requisição é respondida e fim do fluxo
             */
            if (!results.rows[0].existe && !results.rows[1].conflito)
            {
                PeriodosDAO.inserir(
                    {
                        nome: dadosPost.nome,
                        dataInicio: dadosPost.dataInicio,
                        dataFim: dadosPost.dataFim
                    }, callbackInsercao);
            } else
            {
                response.send({ status: "warning", title: "Erro!", msg: "Período já existe ou há conflito de datas." });
            }
        }
    };

    /**
     * Callback para inserção de um novo período
     * Faz tratativa de erros durante a inserção no banco e reporta se a operação ocorreu com sucesso
     *
     * @param {Error} error 
     * @param {QueryResult} results 
     */
    const callbackInsercao = (error, results) =>
    {
        if (error)
        {
            response.send({status: "alert", title: "Erro!", msg: "Erro no servidor."});
            console.log("Erro no cadastro de período: ", error);
        } else
        {
            /**
             * Verifica se precisa alterar o período ativo.
             */
            if(dadosPost.ativo)
            {
                /**
                 * Efetua a alteração do período ativo.
                 */
                PeriodosDAO.AlterarPeriodoAtivo(
                    {
                        id: results.rows[0].id
                    }, callbackTrocaDePeriodoAtivo);
            } else
            {
                response.send({status: "success", title: "Sucesso!", msg: `Período ${dadosPost.nome} cadastrado com sucesso!`});
            }
        }
    };

    /**
     * Callback para troca de poríodo ativo
     * Faz tratativa de erros durante a inserção no banco e reporta se a operação ocorreu com sucesso
     *
     * @param {Error} error 
     * @param {QueryResult} results 
     */
    const callbackTrocaDePeriodoAtivo = (error, results) =>
    {
        if (error)
        {
            response.send({status: "alert", title: "Erro!", msg: "Erro no servidor."});
            console.log("Erro ao atualizar período: ", error);
        } else
        {
            response.send({status: "success", title: "Sucesso!", msg: `Período ${dadosPost.nome} cadastrado com sucesso!`});
        }
    };

    /**
     * Efetua a verificação de existência de curso com a mesma descrição
     */
    PeriodosDAO.verificarSeExisteEConflito(
        {
            txConsulta: dadosPost.nome,
            dataInicio: dadosPost.dataInicio,
            dataFim: dadosPost.dataFim
        }, callbackVerificacao);
};

/**
 * Atualiza um período
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
    if(typeof(request.params.id)           === "undefined" || typeof(request.body.nome)           === "undefined" || typeof(request.body.ativo)          === "undefined" || 
       typeof(request.body.dataInicio.dia) === "undefined" || typeof(request.body.dataInicio.mes) === "undefined" || typeof(request.body.dataInicio.ano) === "undefined" ||
       typeof(request.body.dataFim.dia)    === "undefined" || typeof(request.body.dataFim.mes)    === "undefined" || typeof(request.body.dataFim.ano)    === "undefined")
    {
        application.app.controllers.utils.tratativaRequisicaoFaltandoDados(application, request, response);
        return;
    }

    /**
     * Dados obtidos, enviados via método "post", da requisição
     */
    const dadosPost = 
    {
        id: request.params.id,
        nome: request.body.nome,
        ativo: JSON.parse(request.body.ativo),
        dataInicio: application.app.modules.datas.dataParaTimesTamp(
            {
                dia: request.body.dataInicio.dia,
                mes: request.body.dataInicio.mes,
                ano: request.body.dataInicio.ano   
            }
        ),
        dataFim: application.app.modules.datas.dataParaTimesTamp(
            {
                dia: request.body.dataFim.dia,
                mes: request.body.dataFim.mes,
                ano: request.body.dataFim.ano   
            }
        )
    };
    
    /**
     * Configuração de conexão com o banco de dados
     */
    const connection = application.config.dbConnection;

    /**
     * Instância da classe DAO de conexão com o banco de dados com configuração de conexão pronta
     */
    const PeriodosDAO = new application.app.models.PeriodosDAO(connection);

    try {
        let conflitoDeNomeEData, listaParaAtualizar = [];

        conflitoDeNomeEData = await PeriodosDAO.verificarConflitoDeNomeEDataAsync(
            {
                id: dadosPost.id, nome: dadosPost.nome, dataInicio: dadosPost.dataInicio, dataFim: dadosPost.dataFim
            });
        /* Evita conflito de nomes */
        if(conflitoDeNomeEData[0].existe || conflitoDeNomeEData[0].conflito)
        {
            response.send({status: "warning", title: "Erro!", msg: "Período já existe cadastrado ou há conflito de datas."});
            return;
        }
        listaParaAtualizar.push(PeriodosDAO.atualizarAsync(
            {
                id: dadosPost.id, nome: dadosPost.nome, dataInicio: dadosPost.dataInicio, dataFim: dadosPost.dataFim
            }));

        if(dadosPost.ativo)
            listaParaAtualizar.push(PeriodosDAO.alterarPeriodoAtivoAsync({ id: dadosPost.id }));

        await Promise.all(listaParaAtualizar);

        response.send({ status: "success", title: "Sucesso!", msg: "Período " + dadosPost.nome + " atualizado com sucesso!" });
        
    } catch (error) {
        tratativaErrosConsultas(error, response);
    }
};