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

module.exports.verificaDadosParaRelatoriosETrata = (application, request, response, next) =>
{
    if(typeof(request.query.id) === "undefined" || typeof(request.query.dataInicio) === "undefined" || typeof(request.query.dataFim) === "undefined")
    {
        application.app.controllers.utils.tratativaRequisicaoFaltandoDados(application, request, response);
        return;
    }
    next();
}

/**
 * Responde a particula de administração de relatórios.
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response 
 */
module.exports.administrar = async (application, request, response) => { response.render('admin/relatorios') };

/**
 * Responde o relatório de reservas de um objeto em um determinado espaço de tempo.
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response 
 */
module.exports.relatoriosObjeto = async (application, request, response) =>
{
    const dadosReq =
    {
        id: request.query.id,
        dataInicio: request.query.dataInicio,
        dataFim: request.query.dataFim
    };

    const RelatoriosDAO = new application.app.models.RelatoriosDAO(application.config.dbConnection);

    try {
        const timesTampDataInicio = application.app.modules.datas.dataParaTimesTamp(
            {
                dia: dadosReq.dataInicio.dia,
                mes: dadosReq.dataInicio.mes,
                ano: dadosReq.dataInicio.ano
            });
        const timesTampDataFim = application.app.modules.datas.dataParaTimesTamp(
            {
                dia: dadosReq.dataFim.dia,
                mes: dadosReq.dataFim.mes,
                ano: dadosReq.dataFim.ano
            });

        const relatorioConsulta = await RelatoriosDAO.relatorioObjeto({ objeto: dadosReq.id, dataInicio: timesTampDataInicio, dataFim: timesTampDataFim });

        const relatorio = relatorioConsulta.map(formatarRelatorio);

        const dataEHora = application.app.modules.datas.dataEHoraAtual();

        response.send({ relatorio, dataEHora });
    } catch (error) {
        tratativaErrosConsultas(error);
    }
};

/**
 * Responde o relatório de reservas de um usuário em um determinado espaço de tempo.
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response 
 */
module.exports.relatoriosUsuario = async (application, request, response) =>
{
    const dadosReq =
    {
        id: request.query.id,
        dataInicio: request.query.dataInicio,
        dataFim: request.query.dataFim
    };

    const RelatoriosDAO = new application.app.models.RelatoriosDAO(application.config.dbConnection);

    try {
        const timesTampDataInicio = application.app.modules.datas.dataParaTimesTamp(
            {
                dia: dadosReq.dataInicio.dia,
                mes: dadosReq.dataInicio.mes,
                ano: dadosReq.dataInicio.ano
            });
        const timesTampDataFim = application.app.modules.datas.dataParaTimesTamp(
            {
                dia: dadosReq.dataFim.dia,
                mes: dadosReq.dataFim.mes,
                ano: dadosReq.dataFim.ano
            });

        const relatorioConsulta = await RelatoriosDAO.relatorioUsuario({ usuario: dadosReq.id, dataInicio: timesTampDataInicio, dataFim: timesTampDataFim });

        const relatorio = relatorioConsulta.map(formatarRelatorio);

        response.send(JSON.stringify(relatorio))
    } catch (error) {
        tratativaErrosConsultas(error);
    }
};

/**
 * Responde o relatório de reservas de uma disciplina em um determinado espaço de tempo.
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response 
 */
module.exports.relatoriosDisciplina = async (application, request, response) =>
{
    const dadosReq =
    {
        id: request.query.id,
        dataInicio: request.query.dataInicio,
        dataFim: request.query.dataFim
    };

    const RelatoriosDAO = new application.app.models.RelatoriosDAO(application.config.dbConnection);

    try {
        const timesTampDataInicio = application.app.modules.datas.dataParaTimesTamp(
            {
                dia: dadosReq.dataInicio.dia,
                mes: dadosReq.dataInicio.mes,
                ano: dadosReq.dataInicio.ano
            });
        const timesTampDataFim = application.app.modules.datas.dataParaTimesTamp(
            {
                dia: dadosReq.dataFim.dia,
                mes: dadosReq.dataFim.mes,
                ano: dadosReq.dataFim.ano
            });

        const relatorioConsulta = await RelatoriosDAO.relatorioDisciplina({ disciplina: dadosReq.id, dataInicio: timesTampDataInicio, dataFim: timesTampDataFim });

        const relatorio = relatorioConsulta.map(formatarRelatorio);
        
        response.send(JSON.stringify(relatorio))
    } catch (error) {
        tratativaErrosConsultas(error);
    }
};


const formatarRelatorio = rel => (
    {
        reserva: {
            id: rel.reservaid,
            objeto: rel.objetodescricao,
            data: rel.data,
            descricao: function() {
                if(!!rel.operacaodescricao)
                    return rel.operacaodescricao;
                else if (!!rel.disciplinadescricao)
                    return `Aula - ${rel.disciplinadescricao} (descrição gerada automáticamente)`;
                else
                    'Reserva sem descrição (descrição gerada automáticamente).';
            }(),
            mat_aula_1: rel.mat_aula_1,
            mat_aula_2: rel.mat_aula_2,
            mat_aula_3: rel.mat_aula_3,
            mat_aula_4: rel.mat_aula_4,
            almoco: rel.almoco,
            vesp_aula_1: rel.vesp_aula_1,
            vesp_aula_2: rel.vesp_aula_2,
            vesp_aula_3: rel.vesp_aula_3,
            vesp_aula_4: rel.vesp_aula_4,
            janta: rel.janta,
            not_aula_1: rel.not_aula_1,
            not_aula_2: rel.not_aula_2,
            not_aula_3: rel.not_aula_3,
            not_aula_4: rel.not_aula_4
        },
        oferecimento: {
            usuario: rel.usuarionome,
            disciplina: rel.disciplinadescricao ? rel.disciplinadescricao : 'Reserva sem disciplina (descrição gerada automáticamente).'
        }
    })