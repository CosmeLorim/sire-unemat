class DisciplinasDAO
{
    constructor(connection)
    {
        this._pool = connection;
        this._tabela = 'disciplinas';
    }

    /*         FUNÇÃO PARA RECUPERAR UM INTERVALO DE DEISCIPLINAS NO BANCO             */
    /*                 ['DESCRIAO', 'LIMIT', 'OFFSET']                                 */
    buscaIntervalo(adcionais, callback)
    {
        const text = `SELECT
                        d.ativo AS disciplinaAtivo, d.carga_horaria AS disciplinaCargaHoraria, d.curso AS cursoID, d.descricao AS disciplinaDescricao,
                        d.id AS disciplinaID, d.semestre AS disciplinaSemestre, d.sigla AS disciplinaSigla,
                        c.descricao AS cursoDescricao
                    FROM
                        ${this._tabela} d
                    INNER JOIN
                        cursos c ON c.id = d.curso
                    WHERE
                        d.descricao
                    ILIKE
                        \'${adcionais.txconsulta}\'
                    ORDER BY
                        d.descricao ASC
                    LIMIT
                        ${adcionais.limit}
                    OFFSET
                        ${adcionais.offset};
                    SELECT
                        COUNT(d.ativo)
                    FROM
                        ${this._tabela} d
                    INNER JOIN
                        cursos c ON c.id = d.curso
                    WHERE
                        d.descricao
                    ILIKE
                        \'${adcionais.txconsulta}\';`;
//        console.log(text);
        this._pool.query(text, callback);
    }

    /*         FUNÇÃO PARA RECUPERAR UM INTERVALO DE DISCIPLINAS ATIVAS NO BANCO       */
    /*                 ['DESCRIAO', 'LIMIT', 'OFFSET']                                 */
    buscaIntervaloAtivas(adcionais, callback)
    {
        const text = `SELECT
                        d.ativo AS disciplinaAtivo, d.carga_horaria AS disciplinaCargaHoraria, d.curso AS cursoID, d.descricao AS disciplinaDescricao,
                        d.id AS disciplinaID, d.semestre AS disciplinaSemestre, d.sigla AS disciplinaSigla,
                        c.descricao AS cursoDescricao
                    FROM
                        ${this._tabela} d
                    INNER JOIN
                        cursos c ON c.id = d.curso
                    WHERE
                        d.descricao ILIKE \'${adcionais.txconsulta}\' AND d.ativo = \'true\'
                    ORDER BY
                        d.descricao ASC
                    LIMIT
                        ${adcionais.limit}
                    OFFSET
                        ${adcionais.offset};`;

        this._pool.query(text, callback);
    }
    
    /*         FUNÇÃO PARA RECUPERAR UM INTERVALO DE DISCIPLINAS ATIVAS NO BANCO       */
    /*                 ['DESCRIAO', 'LIMIT', 'OFFSET']                                 */
    buscaIntervaloAtivasNaoOferecidas(adcionais, callback)
    {
        const text = `SELECT
                        d.id AS disciplinaid, d.descricao AS disciplinadescricao, d.sigla AS disciplinasigla, d.carga_horaria AS disciplinacargahoraria,
                        d.semestre AS disciplinasemestre, c.sigla AS cursosigla
                    FROM
                        ${this._tabela} d
                    INNER JOIN
                        cursos c
                    ON
                        c.id = d.curso
                    WHERE
                        d.descricao ILIKE \'${adcionais.txconsulta}\'
                    AND
                        d.id not in (select coalesce(disciplina, -1) from oferecimentos WHERE ativo = \'true\')
                    AND
                        d.ativo = \'true\'
                    ORDER BY
                        d.descricao ASC
                    LIMIT
                        ${adcionais.limit}
                    OFFSET
                        ${adcionais.offset};`;

        this._pool.query(text, callback);
    }

    /*
     * função para buscar uma disciplina por id
     * @param {integer} id
     * @param {function} callback
     * @returns {undefined}
     */
    buscarPorId(id, callback)
    {
        const text = `SELECT
                        *
                    FROM
                        ${this._tabela}
                    WHERE
                        id = ${id}
                    LIMIT
                        1;`;
//        console.log(text);
        this._pool.query(text, callback);
    }

    /*
     * função para buscar uma disciplina por id
     * @param {char} txBusca
     * @param {function} callback
     * @returns {undefined}
     */
    buscarPorDescricaoECurso(txBusca, curso, callback)
    {
        const text = `SELECT
                        *
                    FROM
                        ${this._tabela}
                    WHERE
                        descricao ILIKE \'${txBusca}\' AND curso = ${curso}
                    LIMIT
                        1;`;

        this._pool.query(text, callback);
    }

    /*
     * função para recuperar todos os cursos no banco
     * @param {function} callback
     * @returns {undefined}
     */
    buscarTodos(callback)
    {
        const text = `SELECT * FROM ${this._tabela};`;
        this._pool.query(text, callback);
    }

    /*
     * função para inserir uma nova disciplina no banco
     * @param {char} descricao
     * @param {char} sigla
     * @param {integer} curso
     * @param {boolena} ativo
     * @param {integer} carga_horaria
     * @param {integer} semestre
     * @param {function} callback
     * @returns {undefined}
     */
    inserir(descricao, sigla, curso, ativo, carga_horaria, semestre, callback)
    {
        const text = `INSERT INTO
                        ${this._tabela} (descricao, sigla, curso, ativo, carga_horaria, semestre)
                    VALUES
                        (\'${descricao}\', \'${sigla}\', ${curso}, ${ativo}, ${carga_horaria}, ${semestre})`;
        this._pool.query(text, callback);
    }

    /*                                   */

    /*
     * função para atualizar um curso no banco
     * @param {integer} id
     * @param {char} descricao
     * @param {char} sigla
     * @param {integer} curso
     * @param {boolean} ativo
     * @param {integer} carga_horaria
     * @param {integer} semestre
     * @param {function} callback
     * @returns {undefined}
     */
    atualizar(id, descricao, sigla, curso, ativo, carga_horaria, semestre, callback)
    {
        const text = `UPDATE
                        ${this._tabela}
                    SET
                        descricao = \'${descricao}\', sigla = \'${sigla}\', ativo = ${ativo}, curso = ${curso},
                        carga_horaria = ${carga_horaria}, semestre = ${semestre}
                    WHERE
                        id = ${id};`;
        this._pool.query(text, callback);
    }
}

module.exports = () => DisciplinasDAO;
