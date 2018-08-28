class ReservasDAO
{
    constructor(connection)
    {
        this._pool = connection;
        this._tabela = 'reservas';
    }

    buscaReservasDoDia(dados, callback)
    {
        const text = `SELECT
                        *
                    FROM
                        obter_reservas(${dados.data});`;

//        console.log(text);
        this._pool.query(text, callback);
    }

    /*
     * Função que verifica se há reservas em vários dias e horários
     * @param {horarios: [{checked: boolean, campo: char}, datas: [integer]} dados
     * @param {function} callback
     * @returns {undefined}
     */
    buscaPorHorariosEDatas(dados, callback)
    {
        let text = '';
        dados.datas.forEach((item) =>
        {
            text += `SELECT
                        *
                    FROM
                        ${this._tabela}
                    WHERE
                        (\n`;
            dados.horarios.forEach((item) =>
            {
                if (item.checked === 'true')
                    text += item.campo + ' = ' + item.checked + ' OR \n';
            });
            text = text.substr(0, text.length - 4) + '\n';
            text += `)
                    AND
                        data = ${item}
                    AND
                        objeto = ${dados.objeto}\nUNION\n`;
        });
        text = text.substr(0, text.length - 7) + ';';
//        console.log(text);
        this._pool.query(text, callback);
    }

    buscaPorUsuarioDasReservas(dados, callback)
    {
        const text = `SELECT
                        r.*, u.nome, d.descricao
                    FROM
                        reservas r
                    INNER JOIN
                        oferecimentos o
                    ON
                        r.oferecimento = o.id
                    LEFT JOIN
                        disciplinas d
                    ON
                        o.disciplina = d.id
                    INNER JOIN
                        usuarios u
                    ON
                        o.usuario = u.id
                    WHERE
                        r.objeto = ${dados.objeto}
                    AND
                        r.data = ${dados.data}
                    AND
                        r.ativo = true;`;

//        console.log(text);
        this._pool.query(text, callback);
    }

    /*
     * função para fazer cadastro de reservas
     * @param
     * {
     *   oferecimento: integer,
     *   objeto: integer,
     *   horarios:[{checked: boolean, campo: char]},
     *   horarios: [integer]
     * } dados
     * @param {function} callback
     * @returns {undefined}
     */
    inserir(dados, callback)
    {
        let text = '';
        dados.datas.forEach((item) =>
        {
            text += `INSERT INTO
                        ${this._tabela}
                        (
                            mat_aula_1,
                            mat_aula_2,
                            mat_aula_3,
                            mat_aula_4,
                            vesp_aula_1,
                            vesp_aula_2,
                            vesp_aula_3,
                            vesp_aula_4,
                            not_aula_1, 
                            not_aula_2,
                            not_aula_3,
                            not_aula_4,
                            almoco,
                            janta,
                            data,
                            objeto,
                            oferecimento,
                            operacao
                        )
                    VALUES
                        (
                            ${dados.horarios[0].checked},
                            ${dados.horarios[1].checked},
                            ${dados.horarios[2].checked},
                            ${dados.horarios[3].checked},
                            ${dados.horarios[4].checked},
                            ${dados.horarios[5].checked},
                            ${dados.horarios[6].checked},
                            ${dados.horarios[7].checked},
                            ${dados.horarios[8].checked},
                            ${dados.horarios[9].checked},
                            ${dados.horarios[10].checked},
                            ${dados.horarios[11].checked},
                            ${dados.horarios[12].checked},
                            ${dados.horarios[13].checked},
                            ${item},
                            ${dados.objeto},
                            ${dados.oferecimento},
                            ${dados.operacao}
                      );\n`;
        });
//        console.log(text);
        this._pool.query(text, callback);
    }

    cancelar(dados, callback)
    {
        let text = `UPDATE ${this._tabela} SET `;
        
        dados.horarios.forEach((horario) =>
        {
            text += `${horario} = false, `;
        });

        text = text.substr(0, text.length - 2);
        text += ` WHERE
                    objeto = ${dados.objeto}
                AND
                    data = ${dados.data}
                AND
                    ativo = true;`;
        
//        console.log(text);
        this._pool.query(text, callback);
    }
}

module.exports = () => ReservasDAO;
