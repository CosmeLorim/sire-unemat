/**
 * Classe DAO referente ao controller 'cursos'.
 * 
 * @class CursosDAO
 */
class CursosDAO
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
     * Recupera um intervalo definido de registros de cursos do banco.
     * Busca por: cursos.descricao, cursos.sigla.
     * 
     * @param {Object} dados
     * @param {String} dados.txConsulta
     * @param {Number} dados.offset
     * @param {Number} dados.limit
     * @returns {Promise(resolve, results)} Promise
     * @memberof CursosDAO
     */
    buscaIntervalo(dados)
    {
        const text = `SELECT `+
                        `id, descricao, sigla `+
                    `FROM `+
                        `cursos `+
                    `WHERE `+
                        `descricao ILIKE '${dados.txConsulta}' `+
                    `OR `+
                        `sigla ILIKE '${dados.txConsulta}' `+
                    `ORDER BY `+
                        `descricao ASC `+
                    `LIMIT `+
                        `${dados.limit} `+
                    `OFFSET `+
                        `${dados.offset};\n`+
                    `SELECT `+
                        `COUNT(0) `+
                    `FROM `+
                        `cursos `+
                    `WHERE `+
                        `descricao ILIKE '${dados.txConsulta}'`+
                    `OR `+
                        `sigla ILIKE '${dados.txConsulta}';`;
        // console.log(text);

        return this._query(text, 'application.app.models.buscaIntervalo');
    }

    /**
     * Verifica se existe um curso no banco.
     * Busca por: cursos.descricao.
     * 
     * @param {Object} dados
     * @param {Number} dados.id
     * @param {String} dados.descricao 
     * @returns {Promise(resolve, results)} Promise
     * @memberof CursosDAO
     */
    verificarConflitoDeNome(dados)
    {
        let text;
        if(typeof(dados.id) === 'undefined')
            text = `SELECT (SELECT COUNT(0) FROM cursos WHERE descricao ILIKE '${dados.descricao}' LIMIT 1) > 0 AS existe;`;
        else
            text = `SELECT (SELECT COUNT(0) FROM cursos WHERE descricao ILIKE '${dados.descricao}' AND id <> ${dados.id} LIMIT 1) > 0 AS existe;`;
        // console.log(text);

        return this._query(text, 'application.app.models.verificarConflitoDeNome');
    }

    /**
     * Insere um novo curso.
     * 
     * @param {Object} dados 
     * @param {String} dados.descricao
     * @param {String} dados.sigla
     * @returns {Promise(resolve, results)} Promise
     * @memberof CursosDAO
     */
    inserir(dados)
    {
        const text = `INSERT INTO cursos (descricao, sigla) VALUES ('${dados.descricao}', '${dados.sigla}');`;
        // console.log(text);

        return this._query(text, 'application.app.models.inserir');
    }

    /**
     * Atualiza atualiza um curso.
     * Busca por: cursos.id.
     * 
     * @param {Object} dados 
     * @param {Number} dados.id
     * @param {String} dados.descricao
     * @param {String} dados.sigla
     * @returns {Promise(resolve, results)} Promise
     * @memberof CursosDAO
     */
    atualizar(dados)
    {
        const text = `UPDATE cursos SET descricao = '${dados.descricao}', sigla = '${dados.sigla}' WHERE id = ${dados.id};`;
        // console.log(text);

        return this._query(text, 'application.app.models.atualizar');
    }

    /**
     * Metodo interno para execução da query.
     * 
     * @param {Object} dados 
     * @param {String} dados.sql 
     * @param {String} dados.metodo
     * @returns {Promise(resolve, results)} Promise
     * @memberof TiposObjetosDAO
     */
    _query(sql, metodo)
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

module.exports = () => CursosDAO;
