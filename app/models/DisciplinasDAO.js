/**
 * Classe DAO referente ao controller "disciplinas".
 * 
 * @class DisciplinasDAO
 */
class DisciplinasDAO
{
    /**
     * Cria uma instância de DisciplinasDAO.
     * 
     * @param {ConnectionConfig} connection 
     * @memberof DisciplinasDAO
     */
    constructor(connection)
    {
        this._pool = connection;
    }

    /**
     * Recupera um intervalo de disciplinas.
     * Busca por: disciplina.descricao, disciplina.sigla, cursos.descricao.
     * 
     * @param {Object} dados 
     * @param {String} dados.txConsulta
     * @param {Number} dados.offset
     * @param {Number} dados.limit
     * @param {function({error: Error}, {results: QueryResult})} callback 
     * @memberof DisciplinasDAO
     */
    buscaIntervalo(dados, callback)
    {
        const text = `SELECT `+
                        `d.ativo AS disciplinaAtivo, d.carga_horaria AS disciplinaCargaHoraria, d.curso AS cursoID, d.descricao AS disciplinaDescricao,`+
                        `d.id AS disciplinaID, d.semestre AS disciplinaSemestre, d.sigla AS disciplinaSigla, c.sigla AS cursoSigla `+
                    `FROM `+
                        `disciplinas d `+
                    `INNER JOIN `+
                        `cursos c ON c.id = d.curso `+
                    `WHERE `+
                        `d.descricao `+
                    `ILIKE `+
                        `'${dados.txConsulta}' `+
                    `OR `+
                        `d.sigla `+
                    `ILIKE `+
                        `'${dados.txConsulta}' `+
                    `OR `+
                        `c.descricao `+
                    `ILIKE `+
                        `'${dados.txConsulta}' `+
                    `ORDER BY `+
                        `d.descricao ASC `+
                    `LIMIT `+
                        `${dados.limit} `+
                    `OFFSET `+
                        `${dados.offset};\n`+                        
                    `SELECT `+
                        `COUNT(d.id) `+
                    `FROM `+
                        `disciplinas d `+
                    `INNER JOIN `+
                        `cursos c ON c.id = d.curso `+
                    `WHERE `+
                        `d.descricao `+
                    `ILIKE `+
                        `'${dados.txConsulta}' `+
                    `OR `+
                        `d.sigla `+
                    `ILIKE `+
                        `'${dados.txConsulta}' `+
                    `OR `+
                        `c.descricao `+
                    `ILIKE `+
                        `'${dados.txConsulta}';`;

        // console.log(text);
        this._pool.query(text, callback);
    }

    /**
     * Recupera um intervalo de disciplinas ativas.
     * Busca por: disciplina.descricao, disciplina.sigla, cursos.descricao, cursos.sigla.
     * 
     * @param {Object} dados 
     * @param {String} dados.txConsulta
     * @param {Number} dados.offset
     * @param {Number} dados.limit
     * @param {function({error: Error}, {results: QueryResult})} callback 
     * @memberof DisciplinasDAO
     */
    buscaIntervaloAtivas(dados, callback)
    {
        const text = `SELECT `+
                        `d.ativo AS disciplinaAtivo, d.carga_horaria AS disciplinaCargaHoraria, d.curso AS cursoID, d.descricao AS disciplinaDescricao, `+
                        `d.id AS disciplinaID, d.semestre AS disciplinaSemestre, d.sigla AS disciplinaSigla, c.descricao AS cursoDescricao `+
                    `FROM `+
                        `disciplinas d `+
                    `INNER JOIN `+
                        `cursos c ON c.id = d.curso `+
                    `WHERE `+
                        `(`+
                            `d.descricao `+
                        `ILIKE `+
                            `'${dados.txConsulta}' `+
                        `OR `+
                            `d.sigla `+
                        `ILIKE `+
                            `'${dados.txConsulta}' `+
                        `OR `+
                            `c.descricao `+
                        `ILIKE `+
                            `'${dados.txConsulta}' `+
                        `OR `+
                            `c.sigla `+
                        `ILIKE `+
                            `'${dados.txConsulta}' `+
                        `) `+
                    `AND `+
                        `d.ativo = TRUE `+
                    `ORDER BY `+
                        `d.descricao ASC `+
                    `LIMIT `+
                        `${dados.limit} `+
                    `OFFSET `+
                        `${dados.offset};\n`+
                    `SELECT `+
                        `COUNT(d.id) `+
                    `FROM `+
                        `disciplinas d `+
                    `INNER JOIN `+
                        `cursos c ON c.id = d.curso `+
                    `WHERE `+
                        `(`+
                            `d.descricao `+
                        `ILIKE `+
                            `'${dados.txConsulta}' `+
                        `OR `+
                            `d.sigla `+
                        `ILIKE `+
                            `'${dados.txConsulta}' `+
                        `OR `+
                            `c.descricao `+
                        `ILIKE `+
                            `'${dados.txConsulta}' `+
                        `OR `+
                            `c.sigla `+
                        `ILIKE `+
                            `'${dados.txConsulta}' `+
                        `) `+
                    `AND `+
                        `d.ativo = TRUE;`;
                    
        // console.log(text);
        this._pool.query(text, callback);
    }

    /**
     * Recupera um intervalo definido de registros ativos não oferecidas de disciplinas do banco, para funções com assinatura "async".
     * Busca por: disciplina.descricao, disciplina.sigla, cursos.descricao.
     * 
     * @param {Object} dados 
     * @param {String} dados.txConsulta
     * @param {Number} dados.periodo
     * @param {Number} dados.offset
     * @param {Number} dados.limit
     * @returns {Promise(resolve, results)} Promise
     * @memberof DisciplinasDAO
     */
    buscaIntervaloAtivasNaoOferecidasAsync(dados, callback)
    {
        const filtragemPorCurso = dados.curso ? `AND c.id = ${dados.curso} ` : '';
        const subConsultaOferecimentos = `SELECT `+
                                            `COALESCE(disciplina, -1) `+
                                        `FROM `+
                                            `oferecimentos `+
                                        `INNER JOIN periodos per on per.id = oferecimentos.periodo `+
                                        `WHERE `+
                                            `oferecimentos.ativo = TRUE `+
                                        `AND `+
                                            `per.ativo = TRUE`;

        const text = `SELECT `+
                       `d.id AS disciplinaid, d.descricao AS disciplinadescricao, d.sigla AS disciplinasigla, d.carga_horaria AS disciplinacargahoraria, `+
                       `d.semestre AS disciplinasemestre, c.sigla AS cursosigla `+
                    `FROM `+
                        `disciplinas d `+
                    `INNER JOIN cursos c ON c.id = d.curso `+
                    `WHERE `+
                        `(`+
                            `d.descricao ILIKE '${dados.txConsulta}' `+
                        `OR `+
                            `d.sigla ILIKE '${dados.txConsulta}' `+
                        `OR `+
                            `c.descricao ILIKE '${dados.txConsulta}' `+
                        `OR `+
                            `c.sigla ILIKE '${dados.txConsulta}' `+
                        `) `+
                    `AND `+
                        `d.id NOT IN (${subConsultaOferecimentos}) `+
                    `AND `+
                        `d.ativo = TRUE `+
                    `${filtragemPorCurso}`+
                    `ORDER BY `+
                        `d.descricao ASC `+
                    `LIMIT `+
                        `${dados.limit} `+
                    `OFFSET `+
                        `${dados.offset};\n`+
                    `SELECT `+
                        `COUNT(d.id) `+
                    `FROM `+
                        `disciplinas d `+
                    `INNER JOIN `+
                        `cursos c `+
                    `ON `+
                        `c.id = d.curso `+
                    `WHERE `+
                        `(`+
                            `d.descricao `+
                        `ILIKE `+
                            `'${dados.txConsulta}' `+
                        `OR `+
                            `d.sigla `+
                        `ILIKE `+
                            `'${dados.txConsulta}' `+
                        `OR `+
                            `c.descricao `+
                        `ILIKE `+
                            `'${dados.txConsulta}' `+
                        `OR `+
                            `c.sigla `+
                        `ILIKE `+
                            `'${dados.txConsulta}' `+
                        `) `+
                    `AND `+
                        `d.id NOT IN (${subConsultaOferecimentos}) `+
                    `${filtragemPorCurso}`+
                    `AND `+
                        `d.ativo = TRUE;`;
        // console.log(text);

        return this._queryAsync(text, 'application.app.models.DisciplinasDAO.buscaIntervaloAtivasNaoOferecidasAsync');
    }

    /**
     * Recupera uma disciplinas do banco.
     * Busca por: disciplinas.descricao.
     * 
     * @param {Object} dados
     * @param {String} dados.descricao
     * @param {function({error: Error}, {results: QueryResult})} callback 
     * @memberof DisciplinasDAO
     */
    buscarPorDescricao(dados, callback)
    {
        const text = `SELECT id, descricao, sigla, curso, ativo, carga_horaria, semestre FROM disciplinas WHERE descricao ILIKE '${dados.descricao}' LIMIT 1;`;

        // console.log(text);
        this._pool.query(text, callback);
    }

    /**
     * Recupera uma disciplinas do banco para funções com assinatura "async".
     * Busca por: disciplinas.descricao.
     * 
     * @param {Object} dados
     * @param {String} dados.descricao
     * @memberof DisciplinasDAO
     * @returns {Promise(resolve, results)} Promise
     * @memberof DisciplinasDAO
     */
    buscarPorDescricaoAsync(dados)
    {
        const text = `SELECT id, descricao, sigla, curso, ativo, carga_horaria, semestre FROM disciplinas WHERE descricao ILIKE '${dados.descricao}' LIMIT 1;`;
        // console.log(text);

        return this._queryAsync(text, 'application.app.models.DisciplinasDAO.buscarPorDescricaoAsync');
    }

    /**
     * Recupera um registro de disciplinas do banco buscando por descrição e curso.
     * Busca por: disciplinas.descricao, curso.descricao.
     * 
     * @param {Object} dados 
     * @param {String} dados.descricao
     * @param {String} dados.curso
     * @param {function({error: Error}, {results: QueryResult})} callback 
     * @memberof DisciplinasDAO
     */
    buscarPorDescricaoECurso(dados, callback)
    {
        const text = `SELECT (SELECT COUNT(0) FROM disciplinas WHERE descricao ILIKE '${dados.descricao}' AND curso = ${dados.curso} LIMIT 1) > 0 AS existe;`;

        // console.log(text);
        this._pool.query(text, callback);
    }

    /**
     * Recupera todos os cursos banco.
     * 
     * @param {function({error: Error}, {results: QueryResult}} callback 
     * @memberof CursosDAO
     */
    buscarTodosCursos(callback)
    {
        const text = `SELECT id, descricao, sigla FROM cursos;`;

        this._pool.query(text, callback);
    }
    
    /**
     * Insere uma nova disciplina.
     * 
     * @param {Object} dados 
     * @param {String} dados.descricao
     * @param {String} dados.sigla
     * @param {Number} dados.curso
     * @param {Boolean} dados.ativo
     * @param {Number} dados.cargaHoraria
     * @param {Number} dados.semestre
     * @param {function({error: Error}, {results: QueryResult})} callback 
     * @memberof DisciplinasDAO
     */
    inserir(dados, callback)
    {
        const text = `INSERT INTO `+
                         `disciplinas (descricao, sigla, curso, ativo, carga_horaria, semestre) `+
                     `VALUES `+
                         `('${dados.descricao}', '${dados.sigla}', ${dados.curso}, ${dados.ativo}, ${dados.cargaHoraria}, ${dados.semestre});`;
        
        // console.log(text);
        this._pool.query(text, callback);
    }

    /**
     * Atualiza uma disciplina.
     * Busca por: disciplina.id.
     * 
     * @param {Object} dados 
     * @param {Number} dados.id
     * @param {String} dados.descricao
     * @param {String} dados.sigla
     * @param {Boolean} dados.ativo
     * @param {Number} dados.curso
     * @param {Number} dados.cargaHoraria
     * @param {Number} dados.semestre
     * @param {function({error: Error}, {results: QueryResult})} callback 
     * @memberof DisciplinasDAO
     */
    atualizar(dados, callback)
    {
        const text = `UPDATE `+
                        `disciplinas `+
                    `SET `+
                        `descricao = '${dados.descricao}', sigla = '${dados.sigla}', ativo = ${dados.ativo}, curso = ${dados.curso}, `+
                        `carga_horaria = ${dados.cargaHoraria}, semestre = ${dados.semestre} `+
                    `WHERE `+
                        `id = ${dados.id};`;

        // console.log(text);
        this._pool.query(text, callback);
    }

    /**
     * Atualiza uma disciplina para funções com assinatura "async".
     * Busca por: disciplina.id.
     * 
     * @param {Object} dados 
     * @param {Number} dados.id
     * @param {String} dados.descricao
     * @param {String} dados.sigla
     * @param {Boolean} dados.ativo
     * @param {Number} dados.curso
     * @param {Number} dados.cargaHoraria
     * @param {Number} dados.semestre
     * @returns {Promise(resolve, results)} Promise
     * @memberof DisciplinasDAO
     */
    atualizarAsync(dados, callback)
    {
        const text = `UPDATE `+
                        `disciplinas `+
                    `SET `+
                        `descricao = '${dados.descricao}', sigla = '${dados.sigla}', ativo = ${dados.ativo}, curso = ${dados.curso}, `+
                        `carga_horaria = ${dados.cargaHoraria}, semestre = ${dados.semestre} `+
                    `WHERE `+
                        `id = ${dados.id};`;
        // console.log(text);

        return this._queryAsync(text, 'application.app.models.DisciplinasDAO.atualizarAsync');
    }

    /**
     * Atualiza uma disciplina para funções com assinatura "async".
     * Busca por: disciplina.id.
     * 
     * @param {Object} dados 
     * @param {Number} dados.id
     * @param {String} dados.descricao
     * @param {String} dados.sigla
     * @param {Number} dados.curso
     * @param {Number} dados.cargaHoraria
     * @param {Number} dados.semestre
     * @returns {Promise(resolve, results)} Promise
     * @memberof DisciplinasDAO
     */
    desativacaoComAtualizacaoAsync(dados)
    {
        const text = `UPDATE `+
                        `disciplinas `+
                    `SET `+
                        `descricao = '${dados.descricao}', sigla = '${dados.sigla}', ativo = FALSE, curso = ${dados.curso}, `+
                        `carga_horaria = ${dados.cargaHoraria}, semestre = ${dados.semestre} `+
                    `WHERE `+
                        `id = ${dados.id};\n`+
                    `SELECT desativar_disciplina(${dados.id});`;
        // console.log(text);

        return this._queryAsync(text, 'application.app.models.DisciplinasDAO.desativacaoComAtualizacaoAsync');
    }

    /**
     * Metodo interno para execução da query, para funções com assinatura "async".
     * 
     * @param {Object} dados 
     * @param {String} dados.sql 
     * @param {String} dados.metodo
     * @returns {Promise(resolve, results)} Promise
     * @memberof DisciplinasDAO
     */
    _queryAsync(sql, metodo)
    {
        return new Promise((resolve, reject) =>
        {
            this._pool.query(sql, (error, results) =>
            {
                if (error)
                {
                    error.metodo = metodo;
                    error.sql = sql;
                    reject(error);
                } else
                    resolve(results.rows);
            });
        });
    }
}

module.exports = () => DisciplinasDAO;
