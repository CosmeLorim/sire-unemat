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
 * Responde os dados de um intervalo de cursos conforme os dados oriundos da requisição
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
     * Dados obtidos, via método post, da requisição
     */
    const dadosPost =
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
    const DisciplinasDAO = new application.app.models.DisciplinasDAO(connection);

    /**
     * Callback para a consulta no banco de dados
     * Faz tratativa de erros de acesso ao banco, reporta caso haja erro na consulta e
     * envia os dados recuperados durante a consulta
     * 
     * @param {Error} error 
     * @param {QueryResult} results 
     */
    let callback = (error, results) =>
    {
        if (error)
        {
            response.send({ status: "alert", title: "Erro!", msg: "Erro no servidor." });
            console.log("Erro na recuperação das disciplinas por intervalo", error);
        } else
        {
            /**
             * Captura e remove dos dados a serem enviados a quantidade de tuplas existentes
             * no banco conforme os dados da consulta ignorando "limit" e "offset"
             */
            const count = results.rows.pop().count;
            const disciplinas = results.rows.map(disc => 
                ({
                    disciplina: {
                        id: disc.disciplinaid,
                        descricao: disc.disciplinadescricao,
                        sigla: disc.disciplinasigla,
                        ativo: disc.disciplinaativo,
                        cargaHoraria: disc.disciplinacargahoraria,
                        semestre: disc.disciplinasemestre
                    },
                    curso: {
                        id: disc.cursoid,
                        sigla: disc.cursosigla
                    }
                }))
            /**
             * Envia em formato JSON os dados da consulta e a quantidade de registros
             */
            response.send(JSON.stringify(
                {
                    total: count,
                    rows: disciplinas
                }
            ));
        }
    };

    /**
     * Efetua a consulta de operações utilizando os dados informados na requisição
     */
    DisciplinasDAO.buscaIntervalo(
        {
            order: dadosPost.order,
            limit: dadosPost.limit,
            offset: dadosPost.offset,
            txConsulta: dadosPost.txConsulta
        }, callback);
};

/**
 * Responde os dados de um intervalo de cursos ativos conforme os dados oriundos da requisição
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response
 */
module.exports.buscarAtivas = (application, request, response) =>
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
    if(typeof(request.query.txConsulta) === "undefined" || typeof(request.query.limit) === "undefined" || typeof(request.query.offset) === "undefined")
    {
        application.app.controllers.utils.tratativaRequisicaoFaltandoDados(application, request, response);
        return;
    }

    /**
     * Dados obtidos, via método post, da requisição
     */
    const dadosPost =
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
    const DisciplinasDAO = new application.app.models.DisciplinasDAO(connection);

    /**
     * Callback para a consulta no banco de dados
     * Faz tratativa de erros de acesso ao banco, reporta caso haja erro na consulta e
     * envia os dados recuperados durante a consulta
     * 
     * @param {Error} error  
     * @param {QueryResult} results 
     */
    let callback = (error, results) =>
    {
        if (error)
        {
            response.send({ status: "alert", title: "Erro!", msg: "Erro no servidor." });
            console.log("Erro na recuperação das disciplinas por intervalo", error);
        } else
        {
            /**
             * Captura e remove dos dados a serem enviados a quantidade de tuplas existentes
             * no banco conforme os dados da consulta ignorando "limit" e "offset"
             */
            const count = results.rows[results.rows.length -1].count;
            results.rows.pop();
            
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
    DisciplinasDAO.buscaIntervaloAtivas(
        {
            order: dadosPost.order,
            limit: dadosPost.limit,
            offset: dadosPost.offset,
            txConsulta: dadosPost.txConsulta
        }, callback);
};

/**
 * Recupera as disciplinas ativas não oferecidas
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response 
 */
module.exports.buscarAtivasNaoOferecidas = async (application, request, response) =>
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
     * Verifica se há todos os dados necessários para atender a requisição
     * notifica caso haja a falta de algum dado
     */
    if(typeof(request.query.limit) === "undefined" || typeof(request.query.offset) === "undefined")
    {
        application.app.controllers.utils.tratativaRequisicaoFaltandoDados(application, request, response);
        return;
    }
    
    /**
     * Dados obtidos, via método post, da requisição
     */
    const dadosPost =
    {
        txConsulta: typeof(request.query.txConsulta) === "undefined" ? "%" : `%${request.query.txConsulta}%`,
        curso: parseInt(request.query.curso),
        periodo: request.query.periodo,
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
    const DisciplinasDAO = new application.app.models.DisciplinasDAO(connection);    

    try {
        const disciplinaResults = await DisciplinasDAO.buscaIntervaloAtivasNaoOferecidasAsync(
            {
                txConsulta: dadosPost.txConsulta,
                curso: dadosPost.curso,
                limit: dadosPost.limit,
                offset: dadosPost.offset
            });
        const count = disciplinaResults.pop().count;
        response.send(JSON.stringify({ total: count, rows: disciplinaResults }));
    } catch (error) {
        tratativaErrosConsultas(error, response);
    }
};

/**
 * Responde a particula de administração de disciplinas
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
     * Configuração de conexão com o banco de dados
     */
    const connection = application.config.dbConnection;
    
    /**
     * Instância da classe DAO de conexão com o banco de dados com configuração de conexão pronta
     */
    const DisciplinasDAO = new application.app.models.DisciplinasDAO(connection);

    /**
     * Callback para buscar os cursos existêntes no banco
     * Faz tratativa de erros de acesso ao banco e reporta se a operação ocorreu com sucesso
     *
     * @param {Error} error 
     * @param {QueryResult} results 
     */
    const callback = (error, results) =>
    {
        if (error)
        {
            response.send(error);
        }
        else
        {
            const cursos = results.rows;
            response.render("admin/disciplinas", { cursos: cursos });
        }
    };

    /**
     * Efetua a consulta de cursos
     */
    DisciplinasDAO.buscarTodosCursos(callback);
};

/**
 * Cadastra uma nova disciplina
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
    if(typeof(request.body.descricao) === "undefined" || typeof(request.body.sigla)        === "undefined" || typeof(request.body.curso)    === "undefined" ||
       typeof(request.body.ativo)     === "undefined" || typeof(request.body.cargaHoraria) === "undefined" || typeof(request.body.semestre) === "undefined")
    {
        application.app.controllers.utils.tratativaRequisicaoFaltandoDados(application, request, response);
        return;
    }
    
    /**
     * Dados obtidos, via método post, da requisição
     */
    const dadosPost =
    {
        descricao: request.body.descricao,
        sigla: request.body.sigla,
        curso: parseInt(request.body.curso),
        ativo: JSON.parse(request.body.ativo),
        cargaHoraria: parseInt(request.body.cargaHoraria),
        semestre: parseInt(request.body.semestre) 
    };
    
    /**
     * Configuração de conexão com o banco de dados
     */
    const connection = application.config.dbConnection;

    /**
     * Instância da classe DAO de conexão com o banco de dados com configuração de conexão pronta
     */
    const DisciplinasDAO = new application.app.models.DisciplinasDAO(connection);

    /**
     * Callback para verificar a existência de uma disciplina com a mesma descrição fornecida no mesmo curso na qual está tentando inserir
     * Faz tratativa de erros de acesso ao banco e reporta se a operação ocorreu com sucesso
     *
     * @param {Error} error 
     * @param {QueryResult} results 
     */
    const callbackVerificacao = (error, results) =>
    {
        if (error)
        {
            console.log("Erro ao verificar disciplina", error);
            response.send({ status: "alert", title: "Erro!", msg: "Erro no servidor." });
        } else
        {
            /**
             * Caso não haja disciplina com a descrição fornecida é feita a inserção
             * Caso haja disciplina com a descrição fornecida a requisição é respondida e fim do fluxo
             */
            if (!results.rows[0].existe)
            {
                DisciplinasDAO.inserir(
                    {
                        descricao: dadosPost.descricao,
                        sigla: dadosPost.sigla,
                        curso: dadosPost.curso,
                        ativo: dadosPost.ativo,
                        cargaHoraria: dadosPost.cargaHoraria,
                        semestre: dadosPost.semestre
                    },
                    callbackInsercao);
            } else
            {
                response.send({ status: "warning", title: "Erro!", msg: "Disciplina já existe neste curso." });
            }
        }
    };

    /**
     * Callback para inserção
     * Faz tratativa de erros de acesso ao banco e reporta se a operação ocorreu com sucesso
     *
     * @param {Error} error 
     * @param {QueryResult} results 
     */
    const callbackInsercao = (error, results) =>
    {
        if (error)
        {
            console.log("Erro ao cadastrar disciplina", error);
            response.send({ status: "alert", title: "Erro!", msg: "Erro no servidor." });
        } else
        {
            response.send({status: "success", title: "Sucesso!", msg: "Disciplina cadastrada com sucesso!"});
        }
    }; 

    /**
     * Verifica a existência da disciplina no mesmo curso na qual está tentando inserir
     */
    DisciplinasDAO.buscarPorDescricaoECurso(
        {
            descricao: dadosPost.descricao,
            curso: dadosPost.curso
        },
        callbackVerificacao);
};

/**
 * Atualiza uma determinada disciplina
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
    if(typeof(request.params.id) === "undefined"  || typeof(request.body.descricao) === "undefined" || typeof(request.body.sigla)        === "undefined" ||
       typeof(request.body.curso) === "undefined" || typeof(request.body.ativo) === "undefined"     || typeof(request.body.cargaHoraria) === "undefined" ||
       typeof(request.body.semestre) === "undefined")
    {
        application.app.controllers.utils.tratativaRequisicaoFaltandoDados(application, request, response);
        return;
    }

    /**
     * Dados obtidos, via método post, da requisição
     */
    const dadosPost =
    {
        id: parseInt(request.params.id),
        descricao: request.body.descricao,
        sigla: request.body.sigla,
        curso: parseInt(request.body.curso),
        ativo: JSON.parse(request.body.ativo),
        cargaHoraria: parseInt(request.body.cargaHoraria),
        semestre: parseInt(request.body.semestre)
    };
    
    /**
     * Configuração de conexão com o banco de dados
     */
    const connection = application.config.dbConnection;

    /**
     * Instância da classe DAO de conexão com o banco de dados com configuração de conexão pronta.
     */
    const DisciplinasDAO = new application.app.models.DisciplinasDAO(connection);

    /**
     * Disciplina encontrada pela busca por descrição.
     */
    let disciplinaConsulta = { id: Number(), descricao: String(), sigla: String(), curso: Number(), ativo: Boolean(), carga_horaria: Number() };

    /*  Efetua busca de disciplina por descrição */
    try {
        disciplinaConsulta = await DisciplinasDAO.buscarPorDescricaoAsync({ descricao: dadosPost.descricao });
    } catch (error) {
        tratativaErrosConsultas(error);
        return;
    }
    /**
     * Caso não haja disciplina com a descrição fornecida é feita a inserção
     * Caso haja disciplina com a descrição fornecida a requisição é respondida e fim do fluxo
     */
    if(disciplinaConsulta.length !== 0 && disciplinaConsulta[0].id !== dadosPost.id)
    {
        response.send({ status: "warning", title: "Conflito de nomes!", msg: "Este nome existe em outra disciplina." });
        return;
    }

    try {
        if(!dadosPost.ativo && disciplinaConsulta[0].ativo)
        {
            await DisciplinasDAO.desativacaoComAtualizacaoAsync(
                {
                    id: dadosPost.id,
                    descricao: dadosPost.descricao,
                    sigla: dadosPost.sigla,
                    curso: dadosPost.curso,
                    semestre: dadosPost.semestre,
                    cargaHoraria: dadosPost.cargaHoraria
                });
        } else
        {
            await DisciplinasDAO.atualizarAsync(
                {
                    id: dadosPost.id,
                    descricao: dadosPost.descricao,
                    sigla: dadosPost.sigla,
                    curso: dadosPost.curso,
                    ativo: dadosPost.ativo,
                    semestre: dadosPost.semestre,
                    cargaHoraria: dadosPost.cargaHoraria
                });
        }
        response.send({ status: "success", title: "Sucesso!", msg: "Disciplina atualizada com sucesso!" });
    } catch (error) {
        tratativaErrosConsultas(error, response);
        return;
    }
}
