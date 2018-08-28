/*              RECUPERAÇÃO DE DISCPLINAS                            */
module.exports.recuperarTodas = (application, request, response) =>
{
    const txconsulta = request.query.txconsulta === undefined ? '' : request.query.txconsulta;

    const adcionais =
            {
                ordem: request.query.order,
                limit: request.query.limit,
                offset: request.query.offset,
                txconsulta: '%' + txconsulta + '%'
            };

    const connection = application.config.dbConnection;
    const DisciplinasDAO = new application.app.models.DisciplinasDAO(connection);

    let callback = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro na recuperação das disciplinas por intervalo', error);
        } else
        {
            const count = results.rows[results.rows.length -1].count;
            results.rows.pop();
            
            response.send(JSON.stringify(
                    {
                        total: count,
                        rows: results.rows
                    }
            ));
        }
    };

    DisciplinasDAO.buscaIntervalo(adcionais, callback);
};

module.exports.recuperarTodasAtivas = (application, request, response) =>
{
    const txconsulta = request.query.txconsulta === undefined ? '' : request.query.txconsulta;

    const adcionais =
            {
                ordem: request.query.order,
                limit: request.query.limit,
                offset: request.query.offset,
                txconsulta: '%' + txconsulta + '%'
            };

    const connection = application.config.dbConnection;
    const DisciplinasDAO = new application.app.models.DisciplinasDAO(connection);

    const callback = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro na recuperação de todas as disciplinas ativas', error);
        } else
        {
            response.send(JSON.stringify(
                    {
                        total: results.rowCount,
                        rows: results.rows
                    }
            ));
        }
    };

    DisciplinasDAO.buscaIntervaloAtivas(adcionais, callback);
};

module.exports.recuperarTodasAtivasNaoOferecidas = (application, request, response) =>
{
    const txconsulta = request.query.txconsulta === undefined ? '' : request.query.txconsulta;

    const adcionais =
            {
                ordem: request.query.order,
                limit: request.query.limit,
                offset: request.query.offset,
                txconsulta: '%' + txconsulta + '%'
            };

    const connection = application.config.dbConnection;
    const DisciplinasDAO = new application.app.models.DisciplinasDAO(connection);

    const callback = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro na recuperação de todas as disciplinas ativas', error);
        } else
        {
            response.send(JSON.stringify(
                    {
                        total: results.rowCount,
                        rows: results.rows
                    }
            ));
        }
    };

    DisciplinasDAO.buscaIntervaloAtivasNaoOferecidas(adcionais, callback);
};

module.exports.administrar = (application, request, response) =>
{
    if (!application.app.controllers.autenticacao.verificarSeAutenticado(application, request, response))
    {
        application.app.controllers.autenticacao.tratativaRotaAdminNaoAutenticado(application, request, response);
        return;
    }
    
    const connection = application.config.dbConnection;
    const CursosDAO = new application.app.models.CursosDAO(connection);

    const callback = (error, results) =>
    {
        if (error)
            response.send(error);
        else
        {
            let dados =
                    {
                        cursos: results.rows
                    };
            response.render('admin/disciplinas', {dados: dados});
        }
    };

    CursosDAO.buscarTodos(callback);
};
/*              CADASTRO DE DISCPLINAS                              */
module.exports.inserir = (application, request, response) =>
{
    if (!application.app.controllers.autenticacao.verificarSeAutenticado(application, request, response))
    {
        application.app.controllers.autenticacao.tratativaRequisicoesNaoAutenticadas(application, request, response);
        return;
    }
    
    const dadosForm = request.body;

    const callbackVerificacao = (error, results) =>
    {
        if (error)
        {
            console.log('Erro ao verificar disciplina', error);
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
        } else
        {
            if (results.rowCount === 0)
                DisciplinasDAO.inserir(dadosForm.descricao, dadosForm.sigla, dadosForm.curso, dadosForm.ativo, dadosForm.carga_horaria, dadosForm.semestre, callbackInsercao);
            else
                response.send({status: 'alert', title: 'Erro!', msg: 'Curso já existe no banco.'});
        }
    };

    const callbackInsercao = (error, results) =>
    {
        if (error)
        {
            console.log('Erro ao cadastrar disciplina', error);
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
        } else
        {
            response.send({status: 'success', title: 'Sucesso!', msg: 'Disciplina cadastrada com sucesso!'});
        }
    };

    const connection = application.config.dbConnection;
    const DisciplinasDAO = new application.app.models.DisciplinasDAO(connection);
    DisciplinasDAO.buscarPorDescricaoECurso(dadosForm.descricao, dadosForm.curso, callbackVerificacao);
};
/*              ATUALIZAÇÃO DE DISCPLINAS                            */
module.exports.atualizar = (application, request, response) =>
{
    if (!application.app.controllers.autenticacao.verificarSeAutenticado(application, request, response))
    {
        application.app.controllers.autenticacao.tratativaRequisicoesNaoAutenticadas(application, request, response);
        return;
    }
    
    const callbackVerificacao = (error, results) =>
    {
        if (error)
        {
            console.log('Erro ao verificar disciplina', error);
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
        } else
        {
            if (results.rowCount !== 0)
                DisciplinasDAO.atualizar(dadosForm.id, dadosForm.descricao, dadosForm.sigla, dadosForm.curso, dadosForm.ativo, dadosForm.carga_horaria, dadosForm.semestre, callbackAtualizacao);
            else
                response.send({status: 'alert', title: 'Erro!', msg: 'Curso não existe no banco.'});
        }
    };

    const callbackAtualizacao = (error, results) =>
    {
        if (error)
        {
            console.log('Erro ao cadastrar disciplina', error);
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
        } else
        {
            response.send({status: 'success', title: 'Sucesso!', msg: 'Disciplina atualizada com sucesso!'});
        }
    };

    const dadosForm = request.body;
    const connection = application.config.dbConnection;
    const DisciplinasDAO = new application.app.models.DisciplinasDAO(connection);
    DisciplinasDAO.buscarPorId(dadosForm.id, callbackVerificacao);
};