/*              RECUPERAÇÃO DE USUÁRIOS                              */
module.exports.recuperarTodos = (application, request, response) =>
{
    const txConsulta = request.query.txconsulta === undefined ? '' : request.query.txconsulta;

    const adcionais = {
        limit: request.query.limit,
        offset: request.query.offset,
        txConsulta: '%' + txConsulta + '%'
    };

    const callback = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro na recuperação dos usuários: ', error);
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

    const connection = application.config.dbConnection;
    const UsuariosDAO = new application.app.models.UsuariosDAO(connection);
    UsuariosDAO.buscaIntervalo(adcionais, callback);
};

/*              RECUPERAÇÃO DE USUÁRIOS                              */
module.exports.recuperarUm = (application, request, response) =>
{
    const dadosForm = request.body;
    const connection = application.config.dbConnection;
    const PerfisDAO = new application.app.models.PerfisDAO(connection);

    const callback = (error, results) =>
    {
        if (error)
        {
            console.log('Erro ao recuperar um usuário');
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
        } else
        {
            response.send(JSON.stringify(results.rows));
        }
    };
    PerfisDAO.buscarPorUsuario(dadosForm.id, callback);
};

module.exports.administrar = (application, request, response) =>
{
    if (!application.app.controllers.autenticacao.verificarSeAutenticado(application, request, response))
    {
        application.app.controllers.autenticacao.tratativaRotaAdminNaoAutenticado(application, request, response);
        return;
    }
    
    const connection = application.config.dbConnection;
    let TiposObjetosDAO = new application.app.models.TiposObjetosDAO(connection);

    let callback = (error, results) =>
    {
        if (error)
        {
            console.log('Erro ao abrir tela administrativa.');
            response.send(error);
        }
        else
        {
            let dados =
                    {
                        tiposObjetos: results.rows
                    };
            response.render('admin/usuarios', {dados: dados});
        }
    };

    TiposObjetosDAO.buscarTodos(callback);
};
/*              CADASTRO DE USUÁRIOS                                */
module.exports.inserir = (application, request, response) =>
{
    if (!application.app.controllers.autenticacao.verificarSeAutenticado(application, request, response))
    {
        application.app.controllers.autenticacao.tratativaRequisicoesNaoAutenticadas(application, request, response);
        return;
    }
    
    const dados = request.body;
    const callbackVerificacaoUsuario = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro na verificação de usuario: ', error);
        } else
        {
            if (results.rowCount === 0)
                UsuariosDAO.inserir([
                    dados.usuario.nome,
                    dados.usuario.usr,
                    dados.usuario.passwd,
                    dados.usuario.admin,
                    dados.usuario.ativo
                ], callbackInsercao);
            else
                response.send({status: 'alert', title: 'Erro!', msg: 'Usuário já existe no banco.'});
        }
    };
    const callbackInsercao = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro no cadastro de usuario: ', error);
        } else
        {
            UsuariosDAO.buscarPorUsr(dados.usuario.usr, callbackBuscaUsuario);
        }
    };
    const callbackBuscaUsuario = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro na busca do usuário', error);
        } else
        {
            let tiposObjetos = [];
            const usuario = results.rows[0].id;

            if (dados.perfil !== undefined)
            {
                dados.perfil.forEach((perfil) =>
                {
                    if (perfil.ativo === 'true')
                        tiposObjetos.push(perfil.tipo_objeto);
                });

                const PerfisDAO = new application.app.models.PerfisDAO(connection);
                PerfisDAO.inserir(tiposObjetos, usuario, callbackCriaPerfil);
            } else
                response.send({status: 'success', title: 'Sucesso!', msg: 'Usuário cadastrado com sucesso!'});
        }
    };
    const callbackCriaPerfil = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro na criação do perfil', error);
        } else
        {
            response.send({status: 'success', title: 'Sucesso!', msg: 'Usuário cadastrado com sucesso!'});
        }
    };
    const connection = application.config.dbConnection;
    const UsuariosDAO = new application.app.models.UsuariosDAO(connection);

    UsuariosDAO.buscarPorUsr(dados.usuario.usr, callbackVerificacaoUsuario);
};
/*              ATUALIZAÇÃO DE USUÁRIOS                              */
module.exports.atualizar = (application, request, response) =>
{
    if (!application.app.controllers.autenticacao.verificarSeAutenticado(application, request, response))
    {
        application.app.controllers.autenticacao.tratativaRequisicoesNaoAutenticadas(application, request, response);
        return;
    }
    
    const dadosForm = request.body;

    const callbackAtualizacaoUzuario = (error, results) =>
    {
        if (error)
        {
            console.log('Erro ao atualizar usuário:', error);
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
        } else
        {
            PerfisDAO.verificar(dadosForm.usuario.id, callbackVerificaPerfil);
        }
    };
    const callbackVerificaPerfil = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro ao verificar perfil:', error);
        } else
        {
            let perfilAtualizado = [], perfilNovo = [], encontrou;

            dadosForm.perfil.forEach((perfil) =>
            {
                encontrou = false;
                results.rows.forEach((row) =>
                {
                    if (perfil.tipo_objeto == row.tipo_objeto)
                    {
                        perfilAtualizado.push({
                            id: row.id,
                            usuario: dadosForm.usuario.id,
                            tipo_objeto: perfil.tipo_objeto,
                            ativo: perfil.ativo
                        });
                        encontrou = true;
                        return;
                    }
                });
                if ((!encontrou) && (perfil.ativo == 'true'))
                    perfilNovo.push(perfil.tipo_objeto);
            });
            dadosForm.perfilNovo = perfilNovo;
            PerfisDAO.atualizar(perfilAtualizado, callbackAtualizacaoPerfil);
        }
    };
    const callbackAtualizacaoPerfil = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro ao atualizar perfil:', error);
        } else
        {
            const perfilNovo = dadosForm.perfilNovo;
            const usuario = dadosForm.usuario.id;
            PerfisDAO.inserir(perfilNovo, usuario, callbackCriaPerfil);
        }
    };
    const callbackCriaPerfil = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro ao atualizar perfil:', error);
        } else
        {
            response.send({status: 'success', title: 'Sucesso!', msg: 'Usuário atualizado com sucesso!'});
        }
    };
    const connection = application.config.dbConnection;
    const PerfisDAO = new application.app.models.PerfisDAO(connection);
    const UsuariosDAO = new application.app.models.UsuariosDAO(connection);

    if (dadosForm.usuario.passwd === "")
        UsuariosDAO.atualizarSemSenha(
                dadosForm.usuario.admin,
                dadosForm.usuario.ativo,
                dadosForm.usuario.id,
                dadosForm.usuario.nome,
                dadosForm.usuario.usr,
                callbackAtualizacaoUzuario
                );
    else
        UsuariosDAO.atualizarTudo(
                dadosForm.usuario.admin,
                dadosForm.usuario.ativo,
                dadosForm.usuario.id,
                dadosForm.usuario.nome,
                dadosForm.usuario.passwd,
                dadosForm.usuario.usr,
                callbackAtualizacaoUzuario
                );
};