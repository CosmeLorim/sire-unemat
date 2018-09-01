/**
 * Classe DAO referente ao controller "reservas".
 * 
 * @class ReservasDAO
 */
class ReservasDAO
{
    /**
     * Cria uma instância de CursosDAO.
     * 
     * @param {ConnectionConfig} connection 
     * @memberof CursosDAO
     */
    constructor(connection)
    {
        this._pool = connection;
    }

    /**
     * Recupera as reservas do dia do banco.
     * Busca por: reservas.data.
     * 
     * @param {Object} dados
     * @param {Number} dados.data
     * @param {function({error: Error}, {results: QueryResult})} callback
     * @memberof ReservasDAO
     */
    buscaReservasDoDia(dados, callback)
    {
        const text = `SELECT * FROM obter_reservas(${dados.data});`;

        // console.log(text);
        this._pool.query(text, callback);
    }

    /**
     * Recupera as reservas do dia do banco por tipo de objeto.
     * Busca por: reservas.data, tipos_objetos.id.
     * 
     * @param {Object} dados
     * @param {Number} dados.data
     * @param {Number} dados.tipoObjeto
     * @param {function({error: Error}, {results: QueryResult})} callback
     * @memberof ReservasDAO
     */
    buscaReservasDoDiaPorTipoObjeto(dados, callback)
    {
        const text = `SELECT * FROM obter_reservas_por_tipo_objeto(${dados.data}, ${dados.tipoObjeto});`;

        // console.log(text);
        this._pool.query(text, callback);
    }

    /**
     * Verifica se há reservas em vários dias e horários variados.
     * 
     * @param {Object} dados
     * @param {Number[]} dados.datas
     * @param {Object[]} dados.horarios
     * @param {Boolean} dados.horarios[].checked
     * @param {String} dados.horarios[].campo
     * @param {function({error: Error}, {results: QueryResult})} callback
     * @memberof ReservasDAO
     */
    buscaPorHorariosEDatas(dados, callback)
    {
        let text = '';

        /**
         * Itera sobre as datas para criar a consulta sobre as mesmas
         */
        dados.datas.forEach((item) =>
        {
            text += `SELECT `+
                        `* `+
                    `FROM `+
                        `reservas `+
                    `WHERE `+
                        `(`;

            /**
             * Itera sobre os horários para criar a consulta sobre as mesmas
             */
            dados.horarios.forEach((item) =>
            {
                if (item.checked === "true")
                    text += `${item.campo} = TRUE OR \n`;
            });

            /**
             * Remove da string o trecho "OR \n"
             */
            text = text.substr(0, text.length - 4) + "\n";

            /**
             * Adiciona o trecho da string do fechamento da consulta dos horários
             * Adiciona a condição da data e objeto
             */
            text += `) `+
                    `AND `+
                        `data = ${item} `+
                    `AND `+
                        `ativo = TRUE `+
                    `AND `+
                        `objeto = ${dados.objeto}\nUNION\n`;
        });

        /**
         * Remove da string o trecho "\nUNION\n"
         */
        text = text.substr(0, text.length - 7) + ";";

        // console.log(text);
        this._pool.query(text, callback);
    }

    /**
     * Recupera o usuário de uma determinada reserva.
     * Busca por: reservas.objeto, reservas.data.
     * 
     * @param {Object} dados 
     * @param {Number} dados.objeto
     * @param {Number} dados.data
     * @param {function({error: Error}, {results: QueryResult})} callback
     * @memberof ReservasDAO
     */
    buscaPorUsuarioDasReservas(dados, callback)
    {
        const text = `SELECT `+
                        `r.mat_aula_1, r.mat_aula_2, r.mat_aula_3, r.mat_aula_4, r.almoco, `+
                        `r.vesp_aula_1, r.vesp_aula_2, r.vesp_aula_3, r.vesp_aula_4, r.janta, `+
                        `r.not_aula_1, r.not_aula_2, r.not_aula_3, r.not_aula_4, r.data, r.id, `+
                        `us.nome, us.usr, d.descricao AS disciplina_descricao, op.descricao AS operacao_descricao `+
                    `FROM `+
                        `oferecimentos of `+
                    `LEFT JOIN `+
                        `disciplinas d ON d.id = of.disciplina `+
                    `INNER JOIN `+
                        `operacoes op ON op.oferecimento = of.id `+
                    `INNER JOIN `+
                        `reservas r ON r.operacao = op.id `+
                    `INNER JOIN `+
                        `usuarios us ON us.id = of.usuario `+
                    `WHERE `+
                        `of.ativo = TRUE `+
                    `AND `+
                        `op.ativo = TRUE `+
                    `AND `+
                        `r.ativo = TRUE `+
                    `AND `+
                        `r.objeto = ${dados.objeto} `+
                    `AND `+
                        `r.data = ${dados.data};`

        // console.log(text);
        this._pool.query(text, callback);
    }

    /**
     * Recupera as datas do período vigente.
     * 
     * @param {function({error: Error}, {results: QueryResult})} callback
     * @memberof ReservasDAO
     */
    buscarDatasDoPeriodoVigente(callback)
    {
        const text = `SELECT data_inicio, data_fim FROM periodos WHERE ativo = TRUE LIMIT 1;` +
                     `SELECT id, descricao FROM tipos_objeto;`;

        this._pool.query(text, callback);
    }

    /**
     * Verifica se o usuário possui perfil de reserva para o tipo de objeto na qual está tentando reservar.
     * Busca por: usuario.usr, objeto.id.
     * 
     * @param {Object} dados 
     * @param {String} dados.usr
     * @param {Number} dados.objeto
     * @param {function({error: Error}, {results: QueryResult})} callback
     * @memberof ReservasDAO
     */
    verificaPerfilDoUsuario(dados, callback)
    {
        const subConsulta = `SELECT `+
                                `COUNT(p.id) `+
                            `FROM `+
                                `objetos ob `+
                            `INNER JOIN `+
                                `perfis p ON p.tipo_objeto = ob.tipo_objeto `+
                            `INNER JOIN `+
                                `usuarios us ON us.id = p.usuario `+
                            `WHERE `+
                                `us.usr ILIKE '${dados.usr}' `+
                            `AND `+
                                `ob.id = ${dados.objeto} `+
                            `AND `+
                                `p.ativo = TRUE `+
                            `AND `+
                                `ob.ativo = TRUE `+
                            `LIMIT 1`;
    
        const text = `SELECT (${subConsulta}) > 0 AS existe;`;

        // console.log(text);
        this._pool.query(text, callback);
    }

    /**
     * Verifica se o usuário é dono de uma reserva.
     * Busca por: usuario.usr, reservas.data, reservas.objeto.
     * 
     * @param {Object} dados 
     * @param {String} dados.usr
     * @param {Number} dados.objeto
     * @param {Number} dados.data
     * @param {String[]} dados.horarios
     * @param {function({error: Error}, {results: QueryResult})} callback
     * @memberof ReservasDAO
     */
    verificarSeUsuarioEDonoDaReserva(dados, callback)
    {
        /**
         * Inicio da sub-consulta, é definidos os Joins e parametros de retorno
         */
        let subConsulta = `SELECT `+
                                `COUNT(res.id) ` +
                            `FROM `+
                                `reservas res `+
                            `INNER JOIN `+
                                `operacoes op ON op.id = res.operacao `+
                            `INNER JOIN `+
                                `oferecimentos of ON of.id = op.oferecimento `+
                            `INNER JOIN `+
                                `usuarios us ON us.id = of.usuario `+
                            `WHERE `;

        let subConsultaHorarios = '';

        /**
         * É adicionado a consulta a verificação dos horários
         */
        dados.horarios.forEach(horario => 
        {
            subConsultaHorarios += `${horario} = TRUE OR `;
        });

        /**
         * Remove o trecho " OR " da sub-consulta
         */
        if(subConsultaHorarios.length != 0)
        {
            subConsulta += `(${subConsultaHorarios.substr(0, subConsultaHorarios.length - 4)}) AND `;
        }

        /**
         * Final da subconsulta com os demais parametros da clausura WHERE
         */
        subConsulta += `res.ativo = TRUE `+
                    `AND `+
                        `op.ativo = TRUE `+
                    `AND `+
                        `of.ativo = TRUE `+
                    `AND `+
                        `us.usr <> '${dados.usr}' `+
                    `AND `+
                        `res.objeto = ${dados.objeto} `+
                    `AND `+
                        `res.data = ${dados.data} `+
                    `LIMIT 1`;

        /**
         * Consulta completa é comtada e o resultado é colocado em um álias chamado "percente"
         */
        const text = `SELECT (${subConsulta}) < 1 AS pertence;`;

        // console.log(text);
        this._pool.query(text, callback)
    }

    /**
     * Insere novas reservas no banco.
     * 
     * @param {Object} dados 
     * @param {Number} dados.objeto 
     * @param {Object[]} dados.horarios 
     * @param {Boolean} dados.horarios[].checked
     * @param {String} dados.horarios[].campo
     * @param {function({error: Error}, {results: QueryResult})} callback
     * @memberof ReservasDAO
     */
    inserir(dados, callback)
    {
        let text = '';
        /**
         * Itera sobre as datas para reservas vários dias
         */
        dados.datas.forEach((item) =>
        {
            text += `INSERT INTO `+
                        `reservas `+
                        `( `+
                            `mat_aula_1, mat_aula_2, mat_aula_3, mat_aula_4, `+
                            `vesp_aula_1, vesp_aula_2, vesp_aula_3, vesp_aula_4, `+
                            `not_aula_1, not_aula_2, not_aula_3, not_aula_4, `+
                            `almoco, janta, `+
                            `data, objeto, operacao `+
                        `) `+
                    `VALUES `+
                        `( `+
                            `${dados.horarios[0].checked}, ${dados.horarios[1].checked}, ${dados.horarios[2].checked}, ${dados.horarios[3].checked}, `+
                            `${dados.horarios[4].checked}, ${dados.horarios[5].checked}, ${dados.horarios[6].checked}, ${dados.horarios[7].checked}, `+
                            `${dados.horarios[8].checked}, ${dados.horarios[9].checked}, ${dados.horarios[10].checked}, ${dados.horarios[11].checked}, `+
                            `${dados.horarios[12].checked}, ${dados.horarios[13].checked}, `+
                            `${item}, ${dados.objeto}, ${dados.operacao}`+
                        `);\n`;
        });
        
        // console.log(text);
        this._pool.query(text, callback);
    }
    
    /**
     * Insere uma nova operação e retorna a ID do registro criado.
     * 
     * @param {Object} dados
     * @param {String} dados.descricao
     * @param {Number} dados.oferecimento
     * @param {function({error: Error}, {results: QueryResult})} callback
     * @memberof ReservasDAO
     */
    inserirOperacaoRecuperandoId(dados, callback)
    {
        const text =`INSERT INTO `+
                        `operacoes (descricao, oferecimento) `+
                    `VALUES `+
                        `('${dados.descricao}', ${dados.oferecimento}) `+
                    `RETURNING `+
                        `id;`;

        // console.log(text);
        this._pool.query(text, callback);
    }

    /**
     * Desativa reservas.
     * Busca por: reservas.objeto, reservas.data.
     * 
     * @param {Object} dados 
     * @param {Number} dados.objeto
     * @param {Number} dados.data
     * @param {String[]} dados.horarios
     * @param {function({error: Error}, {results: QueryResult})} callback
     * @memberof ReservasDAO
     */
    cancelar(dados, callback)
    {
        let text = `UPDATE reservas SET `;
        
        /**
         * Itera sobre os horarios para setar falso
         */
        dados.horarios.forEach((horario) =>
        {
            text += `${horario} = FALSE, `;
        });

        /**
         * Remove o trecho ", " da String
         */
        text = text.substr(0, text.length - 2) + " ";

        /**
         * Adiciona a condição de objeto, data e ativo
         */
        text += `WHERE `+
                    `objeto = ${dados.objeto} `+
                `AND `+
                    `data = ${dados.data} `+
                `AND `+
                    `ativo = TRUE;`;
        
        // console.log(text);
        this._pool.query(text, callback);
    }
}

module.exports = () => ReservasDAO;
