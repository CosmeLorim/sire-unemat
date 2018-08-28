//  =====   RECUPERAÇÃO DE RESERVAS DE UM DETERMINADO DIA (DIA ATUAL QUANDO NÃO ESPECIFICADO UM DIA)   =====
module.exports.recuperarObjetos = (application, request, response) =>
{
    let data = application.app.controllers.utils.dataParaTimesTamp({dia: request.query.dia, mes: request.query.mes, ano: request.query.ano});

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

    const connection = application.config.dbConnection;
    const ReservasDAO = new application.app.models.ReservasDAO(connection);
    ReservasDAO.buscaReservasDoDia({data: data}, callbackBuscaReservas);
};

//  =====   RECUPERAÇÃO DE DADOS   =====
module.exports.recuperarUsuariosDaReserva = (application, request, response) =>
{
    const data = request.body.data;
    const objeto = request.body.objeto;

    const callbackConsulta = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
//            console.log('Erro na consulta do(s) usuário(s) da reserva de um objeto em um dia: ', error);
        } else
        {
            let reserva = [
                {item: 'Matutino 1', professor: ''},
                {item: 'Matutino 2', professor: ''},
                {item: 'Matutino 3', professor: ''},
                {item: 'Matutino 4', professor: ''},
                {item: 'Almoco', professor: ''},
                {item: 'Vespertino 1', professor: ''},
                {item: 'Vespertino 2', professor: ''},
                {item: 'Vespertino 3', professor: ''},
                {item: 'Vespertino 4', professor: ''},
                {item: 'Janta', professor: ''},
                {item: 'Noturno 1', professor: ''},
                {item: 'Noturno 2', professor: ''},
                {item: 'Noturno 3', professor: ''},
                {item: 'Noturno 4', professor: ''}
            ];

            results.rows.forEach((row) =>
            {
                if (row.mat_aula_1)
                    reserva[0].professor = row.nome;
                if (row.mat_aula_2)
                    reserva[1].professor = row.nome;
                if (row.mat_aula_3)
                    reserva[2].professor = row.nome;
                if (row.mat_aula_4)
                    reserva[3].professor = row.nome;
                if (row.almoco)
                    reserva[4].professor = row.nome;
                if (row.vesp_aula_1)
                    reserva[5].professor = row.nome;
                if (row.vesp_aula_2)
                    reserva[6].professor = row.nome;
                if (row.vesp_aula_3)
                    reserva[7].professor = row.nome;
                if (row.vesp_aula_4)
                    reserva[8].professor = row.nome;
                if (row.janta)
                    reserva[9].professor = row.nome;
                if (row.not_aula_1)
                    reserva[10].professor = row.nome;
                if (row.not_aula_2)
                    reserva[11].professor = row.nome;
                if (row.not_aula_3)
                    reserva[12].professor = row.nome;
                if (row.not_aula_4)
                    reserva[13].professor = row.nome;
            });

            reserva.forEach((aula) =>
            {
                if (aula.professor === '')
                    aula.professor = 'Livre';
            });

            response.send({reservas: reserva});
        }
    };

    const connection = application.config.dbConnection;
    const ReservasDAO = new application.app.models.ReservasDAO(connection);
    ReservasDAO.buscaPorUsuarioDasReservas({data: data, objeto: objeto}, callbackConsulta);
};

//  =====   ADMINISTRAÇÃO DOS RESERVAS   =====
module.exports.administrar = (application, request, response) =>
{
    if (!application.app.controllers.autenticacao.verificarSeAutenticado(application, request, response))
    {
        application.app.controllers.autenticacao.tratativaRotaAdminNaoAutenticado(application, request, response);
        return;
    }

    response.render('admin/reservas');
};

//  =====   CADASTRO DE RESERVAS   =====
module.exports.inserir = (application, request, response) =>
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
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro na verificação da reserva: ', error);
        } else
        {
            if (results.rowCount === 0)
            {
                OperacoesDAO = new application.app.models.OperacoesDAO(connection);
                OperacoesDAO.inserirRecuperandoUltimoId({descricaoOperacao: dadosForm.descricaoOperacao}, callbackCadastroOperacao);
            } else
            {
                const reservasConflitantes = datasTimesTamp.filter((data) => results.rows.some((row) => data === parseInt(row.data)));
                response.send({status: 'warning', title: 'Erro!', msg: 'Reserva já existe.', reservasConflitantes: reservasConflitantes});
            }
        }
    };

    const callbackCadastroOperacao = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro na criação da operação: ', error);
        } else
        {
            ReservasDAO.inserir(
                    {
                        oferecimento: dadosForm.oferecimento,
                        objeto: dadosForm.objeto,
                        horarios: dadosForm.horarios,
                        datas: datasTimesTamp,
                        operacao: results.rows[0].id
                    },
                    callbackCadastroReserva);
        }
    };

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

    const dadosForm = request.body;
    const connection = application.config.dbConnection;
    const ReservasDAO = new application.app.models.ReservasDAO(connection);
    
    let datasTimesTamp = dadosForm.datas.map((data) => application.app.controllers.utils.dataParaTimesTamp({dia: data.dia, mes: data.mes, ano: data.ano}));
    
    ReservasDAO.buscaPorHorariosEDatas({horarios: dadosForm.horarios, datas: datasTimesTamp, objeto: dadosForm.objeto}, callbackVerificacao);
};

//  =====   CANCELAMENTO DE RESERVAS   =====
module.exports.cancelar = (application, request, response) =>
{
    if (!application.app.controllers.autenticacao.verificarSeAutenticado(application, request, response))
    {
        application.app.controllers.autenticacao.tratativaRequisicoesNaoAutenticadas(application, request, response);
        return;
    }

    const dadosForm = request.body;
    const connection = application.config.dbConnection;
    const ReservasDAO = new application.app.models.ReservasDAO(connection);

    const callback = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro ao atualizar reserva: ', error);
        } else {
            response.send({status: 'success', title: 'Sucesso!', msg: 'Reserva(s) cancelada(s) com sucesso!'});
        }
    };

    ReservasDAO.cancelar(
            {
                horarios: dadosForm.horarioCancelamentoReserva,
                data: dadosForm.data,
                objeto: dadosForm.objeto
            },
            callback);
};