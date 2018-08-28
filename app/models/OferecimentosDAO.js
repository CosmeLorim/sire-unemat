class OferecimentosDAO
{
    constructor(connection)
    {
        this._pool = connection;
        this._tabela = 'oferecimentos';
    }

    /*
     * Função para recuperar um intervalo de oferecimentos do banco
     * @param {
     *  usuario: integer,
     *  limit: integer,
     *  offset: integer
     * } dados
     * @param {function} callback
     * @returns {undefined}
     */
    buscaIntervaloAtivo(dados, callback)
    {
        const text = `SELECT
                        ofer.id, us.nome AS usuarionome, us.usr AS usuariousr, p.nome AS periodonome, COALESCE(di.descricao, 'Não atribuído') AS disciplina,
                        COALESCE(cur.sigla, 'Não atribuído') AS sigla
                    FROM
                        oferecimentos ofer
                    INNER JOIN
                        periodos p
                    ON
                        p.id = ofer.periodo
                    LEFT JOIN
                        disciplinas di
                    ON
                        di.id = ofer.disciplina
                    LEFT JOIN
                        cursos cur
                    ON
                        cur.id = di.curso
                    INNER JOIN
                        usuarios us
                    ON
                        us.id = ofer.usuario
                    WHERE
                        ofer.ativo = TRUE 
                    AND
                        (
                            di.descricao ilike \'${dados.txBusca}\'
                        OR
                            us.usr ilike \'${dados.txBusca}\'
                        OR
                            us.nome ilike \'${dados.txBusca}\'
                        )
                    LIMIT
                        ${dados.limit}
                    OFFSET
                        ${dados.offset};
                    SELECT
                        COUNT(ofer.id)
                    FROM
                        oferecimentos ofer
                    INNER JOIN
                        periodos p
                    ON
                        p.id = ofer.periodo
                    LEFT JOIN
                        disciplinas di
                    ON
                        di.id = ofer.disciplina
                    LEFT JOIN
                        cursos cur
                    ON
                        cur.id = di.curso
                    INNER JOIN
                        usuarios us
                    ON
                        us.id = ofer.usuario
                    WHERE
                        ofer.ativo = TRUE 
                    AND
                        (
                            di.descricao ilike \'${dados.txBusca}\'
                        OR
                            us.usr ilike \'${dados.txBusca}\'
                        OR
                            us.nome ilike \'${dados.txBusca}\'
                        );`;
//        console.log(text);
        this._pool.query(text, callback);
    }

    /*
     * Função para recuperar um intervalo de oferecimentos do banco
     * @param {integer} usuario
     * @param {integer} limit
     * @param {integer} offset
     * @param {function} callback
     * @returns {undefined}
     */
    buscaIntervaloAtivoPorUsuario(usuario, limit, offset, callback)
    {
        const text = `SELECT
                        ofer.id, us.nome AS usuarionome, us.usr AS usuariousr, p.nome AS periodonome, COALESCE(di.descricao, 'Não atribuído') AS disciplina,
                        COALESCE(cur.sigla, 'Não atribuído') AS sigla
                    FROM
                        oferecimentos ofer
                    INNER JOIN
                        periodos p
                    ON
                        p.id = ofer.periodo
                    LEFT JOIN
                        disciplinas di
                    ON
                        di.id = ofer.disciplina
                    LEFT JOIN
                        cursos cur
                    ON
                        cur.id = di.curso
                    INNER JOIN
                        usuarios us
                    ON
                        us.id = ofer.usuario
                    WHERE
                        ofer.ativo = TRUE AND us.usr ILIKE \'${usuario}\'
                    LIMIT
                        ${limit}
                    OFFSET
                        ${offset};`;
//        console.log(text);

        this._pool.query(text, callback);
    }

    /*
     * Função para recuperar um intervalo de oferecimentos do banco
     * @param {integer} disciplina
     * @param {integer} limit
     * @param {integer} offset
     * @param {function} callback
     * @returns {undefined}
     */
    buscaIntervaloAtivoPorDisciplina(disciplina, limit, offset, callback)
    {
        const text = `SELECT
                        ofer.id, us.nome AS usuarionome, us.usr AS usuariousr, p.nome AS periodonome, COALESCE(di.descricao, 'Não atribuído') AS disciplina,
                        COALESCE(cur.sigla, 'Não atribuído') AS sigla
                    FROM
                        oferecimentos ofer
                    INNER JOIN
                        periodos p
                    ON
                        p.id = ofer.periodo
                    LEFT JOIN
                        disciplinas di
                    ON
                        di.id = ofer.disciplina
                    LEFT JOIN
                        cursos cur
                    ON
                        cur.id = di.curso
                    INNER JOIN
                        usuarios us
                    ON
                        us.id = ofer.usuario
                    WHERE
                        ofer.ativo = TRUE AND di.descricao ILIKE \'${disciplina}\'
                    LIMIT
                        ${limit}
                    OFFSET
                        ${offset};`;

        this._pool.query(text, callback);
    }
    
    /*
     * função para recuperar um oferecimento do banco
     * @param {integer} periodo
     * @param {integer} usuario
     * @param {integer} disciplina
     * @param {function} callback
     * @returns {undefined}
     */
    busca(periodo, usuario, disciplina, callback)
    {
        const text = `SELECT
                        *
                    FROM
                        ${this._tabela}
                    WHERE
                        periodo = ${periodo}
                    AND
                        usuario = ${usuario}
                    AND
                        disciplina = ${disciplina}
                    LIMIT
                        1;`;
        this._pool.query(text, callback);
    }
    
     /*
     * função de consulta de oferecimentos por período e usuário
     * @param {integer} periodo
     * @param {integer} usuario
     * @param {function} callback
     * @returns {undefined}
     */
    buscaPorPeriodoEUsuario(periodo, usuario, callback)
    {
        const text = `SELECT
                        *
                    FROM
                        ${this._tabela}
                    WHERE
                        periodo = ${periodo}
                    AND
                        usuario = ${usuario}
                    AND
                        disciplina < 0`;

        this._pool.query(text, callback);
    }

    /*
     * função de consulta de oferecimentos por período e disciplina
     * @param {integer} periodo
     * @param {integer} usuario
     * @param {function} callback
     * @returns {undefined}
     */
    buscaPorPeriodoEDisciplina(periodo, disciplina, callback)
    {
        const text = `SELECT
                        *
                    FROM
                        ${this._tabela}
                    WHERE
                        periodo = ${periodo} AND disciplina = ${disciplina}`;

        this._pool.query(text, callback);
    }

    /*
     * função para recuperar todos os oferecimentos do banco
     * @param {function} callback
     * @returns {undefined}
     */
    buscarTodos(callback)
    {
        const text = `SELECT * FROM ${this._tabela};`;
        this._pool.query(text, callback);
    }

    /*
     *  função para inserir um novo oferecimento com disciplina
     * @param {integer} disciplina
     * @param {integer} periodo
     * @param {integer} usuario
     * @param {boolean} ativo
     * @param {function} callback
     * @returns {undefined}
     */
    inserirComDisciplina(disciplina, periodo, usuario, callback)
    {
        const text = `INSERT INTO
                        ${this._tabela} (disciplina, periodo, usuario)
                    VALUES
                        (${disciplina}, ${periodo}, ${usuario});`;

        this._pool.query(text, callback);
    }

    /*
     *  função para inserir um novo oferecimento sem disciplina
     * @param {integer} disciplina
     * @param {integer} periodo
     * @param {integer} usuario
     * @param {boolean} ativo
     * @param {function} callback
     * @returns {undefined}
     */
    inserirSemDisciplina(periodo, usuario, callback)
    {
        const text = `INSERT INTO
                        ${this._tabela} (periodo, usuario)
                    VALUES
                        (${periodo}, ${usuario});`;

        this._pool.query(text, callback, text);
    }

    /*
     * função para atualizar um período no banco
     * @param {type} id
     * @param {integer} disciplina
     * @param {integer} periodo
     * @param {integer} usuario
     * @param {type} ativo
     * @param {type} callback
     * @returns {Generator}
     */
    atualizar(id, disciplina, periodo, usuario, ativo, callback)
    {
        const text = `UPDATE
                        ${this._tabela}
                    SET
                        disciplina = ${disciplina}, periodo = ${periodo}, usuario = ${usuario}, ativo = ${ativo}
                    WHERE
                        id = ${id}`;
        this._pool.query(text, callback);
    }

    /*
     * função para desativar um oferecimento
     * @param {integer} id
     * @param {function} callback
     * @returns {undefined}
     */
    desativar(id, callback)
    {
        const text = `UPDATE
                        ${this._tabela}
                    set
                        ativo = 'FALSE'
                    WHERE
                        id = ${id};`;
//        console.log(text);
        this._pool.query(text, callback);
    }

    /*
     * função para desativar um oferecimento
     * @param {integer} id
     * @param {function} callback
     * @returns {undefined}
     */
    reativativar(id, callback)
    {
        const text = `UPDATE
                        ${this._tabela}
                    set
                        ativo = 'TRUE'
                    WHERE
                        id = ${id};`;
//        console.log(text);
        this._pool.query(text, callback);
    }
}

module.exports = () => OferecimentosDAO;
