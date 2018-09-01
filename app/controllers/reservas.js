/**
 * Responde as reservas de um determinado dia, caso não infomado será consultado o dia atual
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response
 */
module.exports.buscar = (application, request, response) =>
{
    /**
     * Dados obtidos, via URL enconded, da requisição
     */
    const dadosURLEncoded =
    {
        dia: request.query.dia,
        mes: request.query.mes,
        ano: request.query.ano,
        tipoObjeto: request.query.tipoObjeto
    };
    
    /**
     * Gera o TimesTamp para consulta, utiliza os dados enviados via URL Encoded
     * Se a requisição não enviar a data a consulta será do dia atual
     * Caso na requisição haja data será do dia informado
     */
    const data = (typeof(dadosURLEncoded.dia) === "undefined" || typeof(dadosURLEncoded.mes) === "undefined" || typeof(dadosURLEncoded.ano) === "undefined")
    ? application.app.modules.datas.timeStampDiaAtual()
    : application.app.modules.datas.dataParaTimesTamp({ dia: dadosURLEncoded.dia, mes: dadosURLEncoded.mes, ano: dadosURLEncoded.ano });

    /**
     * Configuração de conexão com o banco de dados
     */
    const connection = application.config.dbConnection;

    /**
     * Instância da classe DAO de conexão com o banco de dados com configuração de conexão pronta
     */
    const ReservasDAO = new application.app.models.ReservasDAO(connection);

    /**
     * Callback para a consulta no banco de dados
     * Faz tratativa de erros de acesso ao banco, reporta caso haja erro na consulta e
     * envia os dados recuperados durante a consulta
     * 
     * @param {Error} error 
     * @param {QueryResult} results 
     */
    const callbackBuscaReservas = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro na recuperação das reservas', error);
        } else
        {
            response.send(JSON.stringify(
                {
                    total: results.rows.length,
                    rows: results.rows
                }
            ));
        }
    };
    
    /**
     * Verifica se foi informado o tipo de objeto
     * Caso seja, consulta pelo tipo de objeto informado
     * Caso não seja, consulta por todos os tipos de objeto ativos
     */
    if(typeof(dadosURLEncoded.tipoObjeto) !== 'undefined')
    {
        /**
         * Efetua a consulta de operações utilizando os dados informados na requisição
         */
        ReservasDAO.buscaReservasDoDiaPorTipoObjeto({ data: data, tipoObjeto: dadosURLEncoded.tipoObjeto }, callbackBuscaReservas);
    } else
    {
        /**
         * Efetua a consulta de operações utilizando os dados informados na requisição
         */
        ReservasDAO.buscaReservasDoDia({ data: data }, callbackBuscaReservas);
    }
};

/**
 * Responde o usuário da reserva de um objeto em um determinado dia
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response
 */
module.exports.buscarUsuariosDaReserva = (application, request, response) =>
{
    /**
     * Verifica se há todos os dados necessários para atender a requisição
     * notifica caso haja a falta de algum dado
     */
    if(typeof(request.query.data) === "undefined" || typeof(request.query.objeto) === "undefined")
    {
        application.app.controllers.utils.tratativaRequisicaoFaltandoDados(application, request, response);
        return;
    }

    /**
     * Dados obtidos, via URL enconded, da requisição
     */
    const dadosURLEncoded =
    {
        data: request.query.data,
        objeto: request.query.objeto
    };
    
    /**
     * Configuração de conexão com o banco de dados
     */
    const connection = application.config.dbConnection;

    /**
     * Instância da classe DAO de conexão com o banco de dados com configuração de conexão pronta
     */
    const ReservasDAO = new application.app.models.ReservasDAO(connection);

    /**
     * Callback para buscar do objeto e dia requisitado
     * Faz tratativa de erros de acesso ao banco e reporta se a operação ocorreu com sucesso
     *
     * @param {Error} error 
     * @param {QueryResult} results 
     */
    const callbackConsulta = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro na consulta do(s) usuário(s) da reserva de um objeto em um dia: ', error);
        } else
        {
            /**
             * Monta o array com a aula e informa qual professor tem a reserva ou se está livre
             */
            let reserva = [
                { item: 'Matutino 1', professor: '', usr: '', descricao: '' },
                { item: 'Matutino 2', professor: '', usr: '', descricao: '' },
                { item: 'Matutino 3', professor: '', usr: '', descricao: '' },
                { item: 'Matutino 4', professor: '', usr: '', descricao: '' },
                { item: 'Almoco', professor: '', usr: '', descricao: '' },
                { item: 'Vespertino 1', professor: '', usr: '', descricao: '' },
                { item: 'Vespertino 2', professor: '', usr: '', descricao: '' },
                { item: 'Vespertino 3', professor: '', usr: '', descricao: '' },
                { item: 'Vespertino 4', professor: '', usr: '', descricao: '' },
                { item: 'Janta', professor: '', usr: '', descricao: '' },
                { item: 'Noturno 1', professor: '', usr: '', descricao: '' },
                { item: 'Noturno 2', professor: '', usr: '', descricao: '' },
                { item: 'Noturno 3', professor: '', usr: '', descricao: '' },
                { item: 'Noturno 4', professor: '', usr: '', descricao: '' }
            ];
            
            /**
             * Preenche o array de aulas com o nome e usuário dos professores que detém a reserva e descrição
             */
            results.rows.forEach((row) =>
            {
                let descricao = row.operacao_descricao !== "" ? row.operacao_descricao : `Aula - ${row.disciplina_descricao} (descrição gerada automáticamente)`;
                
                if (row.mat_aula_1)
                {
                    reserva[0].professor = row.nome;
                    reserva[0].usr = row.usr;
                    reserva[0].descricao = descricao;
                }
                if (row.mat_aula_2)
                {
                    reserva[1].professor = row.nome;
                    reserva[1].usr = row.usr;
                    reserva[1].descricao = descricao;
                }
                if (row.mat_aula_3)
                {
                    reserva[2].professor = row.nome;
                    reserva[2].usr = row.usr;
                    reserva[2].descricao = descricao;
                }
                if (row.mat_aula_4)
                {
                    reserva[3].professor = row.nome;
                    reserva[3].usr = row.usr;
                    reserva[3].descricao = descricao;
                }
                if (row.almoco)
                {
                    reserva[4].professor = row.nome;
                    reserva[4].usr = row.usr;
                    reserva[4].descricao = descricao;
                }
                if (row.vesp_aula_1)
                {
                    reserva[5].professor = row.nome;
                    reserva[5].usr = row.usr;
                    reserva[5].descricao = descricao;
                }
                if (row.vesp_aula_2)
                {
                    reserva[6].professor = row.nome;
                    reserva[6].usr = row.usr;
                    reserva[6].descricao = descricao;
                }
                if (row.vesp_aula_3)
                {
                    reserva[7].professor = row.nome;
                    reserva[7].usr = row.usr;
                    reserva[7].descricao = descricao;
                }
                if (row.vesp_aula_4)
                {
                    reserva[8].professor = row.nome;
                    reserva[8].usr = row.usr;
                    reserva[8].descricao = descricao;
                }
                if (row.janta)
                {
                    reserva[9].professor = row.nome;
                    reserva[9].usr = row.usr;
                    reserva[9].descricao = descricao;
                }
                if (row.not_aula_1)
                {
                    reserva[10].professor = row.nome;
                    reserva[10].usr = row.usr;
                    reserva[10].descricao = descricao;
                }
                if (row.not_aula_2)
                {
                    reserva[11].professor = row.nome;
                    reserva[11].usr = row.usr;
                    reserva[11].descricao = descricao;
                }
                if (row.not_aula_3)
                {
                    reserva[12].professor = row.nome;
                    reserva[12].usr = row.usr;
                    reserva[12].descricao = descricao;
                }
                if (row.not_aula_4)
                {
                    reserva[13].professor = row.nome;
                    reserva[13].usr = row.usr;
                    reserva[13].descricao = descricao;
                }
            });

            /**
             * Preenche o array com a informação de quais aulas o objeto não tem reserva
             */
            reserva.forEach((aula) =>
            {
                if (aula.professor === '')
                    aula.professor = 'Livre';
            });

            /**
             * Responde a requição com as informações de reservas do objeto para o dia informado
             */
            response.send({ reservas: reserva });
        }
    };

    /**
     * Efetua a consulta
     */
    ReservasDAO.buscaPorUsuarioDasReservas({ data: dadosURLEncoded.data, objeto: dadosURLEncoded.objeto }, callbackConsulta);
};

/**
 * Responde a particula de administração de reservas
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
     * Configuração de conexão com o banco de dados
     */
    const connection = application.config.dbConnection;

    /**
     * Instância da classe DAO de conexão com o banco de dados com configuração de conexão pronta
     */
    const ReservasDAO = new application.app.models.ReservasDAO(connection);

    /**
     * Callback para buscar as datas do período vigente no sistema
     * Faz tratativa de erros de acesso ao banco e reporta se a operação ocorreu com sucesso
     *
     * @param {Error} error 
     * @param {QueryResult} results 
     */
    const callbackBuscaDatasPeriodoVigente = (error, results) =>
    {
        if(error)
        {
            console.log('Erro na consulta do período vigente:', error);
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
        } else
        {
            /**
             * Gera um objeto com a data do dia atual, for depois do inicio do período vigente, ou primeiro dia do período vigente para a view
             */
            let dataInicio = new Date(Date.now() + 86400000);
            dataInicio = 
                {
                    dia: dataInicio.getDate() < 10 ? `0${dataInicio.getDate()}` : String(dataInicio.getDate()),
                    mes: (dataInicio.getMonth() + 1) < 10 ? `0${(dataInicio.getMonth() + 1)}` : String(dataInicio.getMonth() + 1),
                    ano: String(dataInicio.getFullYear())
                };

            /**
             * Verifica se a data do inicio do período é depois do dia atual
             * Se for, a data gerada é a do inicio do período
             */
            if(Date.parse(`${dataInicio.ano}-${dataInicio.mes}-${dataInicio.dia}`) < (results.rows[0].data_inicio * 1000))
            {
                dataInicio = new Date(results.rows[0].data_inicio * 1000);
                dataInicio = 
                    {
                        dia: dataInicio.getDate() < 10 ? `0${dataInicio.getDate()}` : String(dataInicio.getDate()),
                        mes: (dataInicio.getMonth() + 1) < 10 ? `0${(dataInicio.getMonth() + 1)}` : String(dataInicio.getMonth() + 1),
                        ano: String(dataInicio.getFullYear())
                    };
            }
            
            /**
             * Gera um objeto com a data do fim do período vigente para enviar para a view
             */
            let dataFim = new Date(86400000 + parseInt(results.rows[0].data_fim) * 1000), trintaDiasApartiDeHoje;
            if(!request.session.admin)
                {
                    trintaDiasApartiDeHoje = (application.app.modules.datas.timeStampDiaAtual() * 1000) + (86400000 * 30);
                    dataFim = dataFim < trintaDiasApartiDeHoje ? dataFim : new Date(trintaDiasApartiDeHoje);
                }
            dataFim = 
                {
                    dia: dataFim.getDate() < 10 ? `0${dataFim.getDate()}` : String(dataFim.getDate()),
                    mes: (dataFim.getMonth() + 1) < 10 ? `0${(dataFim.getMonth() + 1)}` : String(dataFim.getMonth() + 1),
                    ano: String(dataFim.getFullYear())
                };
                
            results.rows.shift();
            /**
             * Renderiza a partícula de administração de reservas
             */
            response.render('admin/reservas',
                {
                    admin: request.session.admin,
                    periodoDeReservas: { inicio: dataInicio, fim: dataFim },
                    tiposObjetos: results.rows
                });
        }
    };

    /**
     * Busca as datas do período vigente no sistema
     */
    ReservasDAO.buscarDatasDoPeriodoVigente(callbackBuscaDatasPeriodoVigente);
};

/**
 * Efetua novas reservas
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
    * Verifica se há todos os dados necessários para atender a requisição e
    * notifica caso haja a falta de algum dado
    */
    if(typeof(request.body.oferecimento) === "undefined" || typeof(request.body.objeto)  === "undefined" || typeof(request.body.horarios) === "undefined" ||
       typeof(request.body.datas) === "undefined" || typeof(request.body.descricaoOperacao) === "undefined")
    {
        application.app.controllers.utils.tratativaRequisicaoFaltandoDados(application, request, response);
        return;
    }

    /**
     * Dados obtidos, via método post, da requisição
     */
    const dadosPost = 
    {
        oferecimento: request.body.oferecimento,
        objeto: request.body.objeto,
        horarios: request.body.horarios,
        datas: request.body.datas,
        descricaoOperacao: request.body.descricaoOperacao
    };

    /**
     * Configuração de conexão com o banco de dados
     */
    const connection = application.config.dbConnection;

    /**
     * Instância da classe DAO de conexão com o banco de dados com configuração de conexão pronta
     */
    const ReservasDAO = new application.app.models.ReservasDAO(connection);

    /**
     * Gera os TimesTamp para os dias informados
     */
    const datasTimesTamp = dadosPost.datas.map((data) => application.app.modules.datas.dataParaTimesTamp({ dia: data.dia, mes: data.mes, ano: data.ano })).sort();
    
    /**
     * Callback para verificar se as reservas estão dentro do período possível de se fazer reserva
     * Faz tratativa de erros de acesso ao banco e reporta se a operação ocorreu com sucesso
     *
     * @param {Error} error 
     * @param {QueryResult} results 
     */
    const callbackConsultaDataPeriodoVigente = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro na consulta do fim do período vigiente:', error);
        } else
        {
            /**
             * Verifica se as reservas estã dentro do período de reservas do sistema
             */
            if(datasTimesTamp[0] >= application.app.modules.datas.timeStampDiaAtual() &&
               (datasTimesTamp[datasTimesTamp.length - 1] <= results.rows[0].data_fim))
            {
                /**
                 * Verifica se o usuário é administrador
                 * Caso seja administrado continua para as demais verificações
                 * Caso não seja administrador verifica se o usuário tem perfil para reservar o objeto
                 */
                if(request.session.admin)
                {
                    /**
                     * Efetua a verificação de reservas nos horarios, dias e no objeto informado
                     */
                    ReservasDAO.buscaPorHorariosEDatas(
                        {
                            horarios: dadosPost.horarios,
                            datas: datasTimesTamp,
                            objeto: dadosPost.objeto
                        }, callbackVerificacaoConflitoHorarios);
                } else
                {
                    /**
                     * Efetua a verificação de perfil do usuário
                     */
                    ReservasDAO.verificaPerfilDoUsuario(
                        {
                            usr: request.session.usr,
                            objeto: dadosPost.objeto
                        }, callbackVerificacaoPerfil);
                }
            } else
            {
                response.send({ status: 'warning', title: 'Operação não permitida!', msg: 'Você está tentando reservar um dia fora do período de reservas.' });
            }
        }
    }

    /**
     * Callback para verificar se o usuário ter perfil de reserva ativo para o objeto
     * Faz tratativa de erros de acesso ao banco e reporta se a operação ocorreu com sucesso
     *
     * @param {Error} error 
     * @param {QueryResult} results 
     */
    const callbackVerificacaoPerfil = (error, results) =>
    {
        if (error)
        {
            response.send({ status: 'alert', title: 'Erro!', msg: 'Erro no servidor.' });
            console.log('Erro na efetuação da reserva: ', error);
        } else
        {
            if(results.rows[0].existe)
            {
                /**
                 * Efetua a verificação de reservas nos horarios, dias e no objeto informado
                 */
                ReservasDAO.buscaPorHorariosEDatas(
                    {
                        horarios: dadosPost.horarios,
                        datas: datasTimesTamp,
                        objeto: dadosPost.objeto
                    }, callbackVerificacaoConflitoHorarios);
            } else
            {
                response.send({ status: 'warning', title: 'Operação não permitida!', msg: 'O seu perfil de usuário não tem permissão de reservar este objeto.' });
            }
        }
    };

    /**
     * Callback para verificar a existência reservas para o objeto nos horarios e dias informados
     * Faz tratativa de erros de acesso ao banco e reporta se a operação ocorreu com sucesso
     *
     * @param {Error} error 
     * @param {QueryResult} results 
     */
    const callbackVerificacaoConflitoHorarios = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro na verificação da reserva: ', error);
        } else
        {
            if (results.rowCount === 0)
            {
                /**
                 * Efetua inserção da operação das reservas que virão a ser inseridas
                 */
                ReservasDAO.inserirOperacaoRecuperandoId(
                    {
                        descricao: dadosPost.descricaoOperacao,
                        oferecimento: dadosPost.oferecimento
                    }, callbackCadastroOperacao);
            } else
            {
                /**
                 * Filtra os dias na qual houve conflito nas reservas
                 */
                const reservasConflitantes = datasTimesTamp.filter(
                    data => results.rows.some(
                        row => data === parseInt(row.data)));

                response.send({status: 'warning', title: 'Erro!', msg: 'Reserva já existe.', reservasConflitantes: reservasConflitantes});
            }
        }
    };

    /**
     * Callback para inserção da operação das reservas
     * Faz tratativa de erros durante a inserção no banco e reporta se a operação ocorreu com sucesso
     *
     * @param {Error} error 
     * @param {QueryResult} results 
     */
    const callbackCadastroOperacao = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro na criação da operação: ', error);
        } else
        {
            /**
             * Efetua a inserção das reservas
             */
            ReservasDAO.inserir(
                {
                    objeto: dadosPost.objeto,
                    horarios: dadosPost.horarios,
                    datas: datasTimesTamp,
                    operacao: results.rows[0].id
                },
                callbackCadastroReserva);
        }
    };

    /**
     * Callback para inserção da reserva
     * Faz tratativa de erros durante a inserção no banco e reporta se a operação ocorreu com sucesso
     *
     * @param {Error} error 
     * @param {QueryResult} results 
     */
    const callbackCadastroReserva = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro na efetuação da reserva: ', error);
        } else
        {
            response.send({status: 'success', title: 'Sucesso!', msg: 'Reserva cadastrada com sucesso!'});
        }
    };
    
    ReservasDAO.buscarDatasDoPeriodoVigente(callbackConsultaDataPeriodoVigente);
};

/**
 * Desativa resevas
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response 
 */
module.exports.cancelar = (application, request, response) =>
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
    if(typeof(request.body.horarioCancelamentoReserva) === "undefined" || typeof(request.body.data)  === "undefined" || typeof(request.body.objeto) === "undefined")
    {
        application.app.controllers.utils.tratativaRequisicaoFaltandoDados(application, request, response);
        return;
    }

    /**
     * Dados obtidos, via URL enconded, da requisição
     */
    const dadosPost = 
    {
        horarioCancelamentoReserva: request.body.horarioCancelamentoReserva,
        data: request.body.data,
        objeto: request.body.objeto
    };
    
    /**
     * Configuração de conexão com o banco de dados
     */
    const connection = application.config.dbConnection;

    /**
     * Instância da classe DAO de conexão com o banco de dados com configuração de conexão pronta
     */
    const ReservasDAO = new application.app.models.ReservasDAO(connection);

    /**
     * Callback para verificar se o usuário é dono das reservas que está tentando cancelar
     * Faz tratativa de erros de acesso ao banco e reporta se a operação ocorreu com sucesso
     *
     * @param {Error} error 
     * @param {QueryResult} results 
     */
    const callbackVerificacaoDePropriedadeDaReserva = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro ao atualizar reserva: ', error);
        } else {
            if(results.rows[0].pertence)
            {
                /**
                 * Efetua o cancelamento de reservas
                 */
                ReservasDAO.cancelar(
                    {
                        horarios: dadosPost.horarioCancelamentoReserva,
                        data: dadosPost.data,
                        objeto: dadosPost.objeto
                    },
                    callbackCancelamento);
            } else
            {
                response.send({status: 'warning', title: 'Erro de permissão!', msg: 'Não foi possível cancelar a(s) reserva(s), pois você não tem permissão!'});
            }
        }
    }

    /**
     * Callback para cancelamento de reservas
     * Faz tratativa de erros de acesso ao banco e reporta se a operação ocorreu com sucesso
     *
     * @param {Error} error 
     * @param {QueryResult} results 
     */
    const callbackCancelamento = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro ao atualizar reserva: ', error);
        } else {
            response.send({status: 'success', title: 'Sucesso!', msg: 'Reserva(s) cancelada(s) com sucesso!'});
        }
    };

    /**
     * Verifica se o usuário é administrador
     * Caso seja administrador o cancelamento continua
     * Caso não seja administrador será verificado se o usuário é dono das reservas
     */
    if(request.session.admin)
    {
        /**
         * Efetua o cancelamento de reservas
         */
        ReservasDAO.cancelar(
            {
                horarios: dadosPost.horarioCancelamentoReserva,
                data: dadosPost.data,
                objeto: dadosPost.objeto
            },
            callbackCancelamento);
    } else
    {
        /**
         * Verifica se o usuário é dono das reservas
         */
        ReservasDAO.verificarSeUsuarioEDonoDaReserva(
            {
                horarios: dadosPost.horarioCancelamentoReserva,
                usr: request.session.usr,
                objeto: dadosPost.objeto,
                data: dadosPost.data
            }, callbackVerificacaoDePropriedadeDaReserva);
    }
};