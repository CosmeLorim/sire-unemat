/**
 * Classe DAO referente ao controller "tiposObjetos".
 * 
 * @class TiposObjetosDAO
 */
class TiposObjetosDAO
{
    /**
     * Cria uma instância de TiposObjetosDAO.
     * 
     * @param {ConnectionConfig} connection 
     * @memberof TiposObjetosDAO
     */
    constructor(connection)
    {
        this._pool = connection;
    }

    /**
     * Recupera um intervalo definido de tipos de objeto do banco.
     * Busca por: tipos_objeto.descricao.
     * 
     * @param {Object} dados 
     * @param {String} dados.txConsulta
     * @param {Number} dados.offset
     * @param {Number} dados.limit
     * @returns {Promise(resolve, results)} Promise
     * @memberof TiposObjetosDAO
     */
    buscaIntervalo(dados)
    {
        const text = `SELECT `+
                        `* `+
                    `FROM `+
                        `tipos_objeto `+
                    `WHERE `+
                        `descricao ILIKE '${dados.txConsulta}' `+
                    `ORDER BY `+
                        `descricao ASC `+
                    `LIMIT `+
                        `${dados.limit} `+
                    `OFFSET `+
                        `${dados.offset}; `+
                    `SELECT `+
                        `COUNT(id) `+
                    `FROM `+
                        `tipos_objeto `+
                    `WHERE `+
                        `descricao ILIKE '${dados.txConsulta}';`;
        // console.log(text);

        return this._query(text, 'application.app.model.buscaIntervalo');
    }
    
    /**
     * Verifica se existe um tipo de objeto no banco.
     * Busca por: tipos_objeto.descricao.
     * 
     * @param {Object} dados
     * @param {String} dados.descricao
     * @returns {Promise(resolve, results)} Promise
     * @memberof TiposObjetosDAO
     */
    verificarSeExiste(dados)
    {
        const text = `SELECT (SELECT COUNT(0) FROM tipos_objeto WHERE descricao ILIKE '${dados.descricao}' LIMIT 1) > 0 AS existe;`;
        // console.log(text);

        return this._query(text, 'application.app.model.verificarSeExiste');
    }

    /**
     * Verifica se existe um tipo de objeto no banco.
     * Busca por: tipos_objeto.descricao.
     * 
     * @param {Object} dados
     * @param {Number} dados.id
     * @param {String} dados.descricao
     * @returns {Promise(resolve, results)} Promise
     * @memberof TiposObjetosDAO
     */
    verificaConflitoDeNome(dados)
    {
        const text = `SELECT (SELECT COUNT(0) FROM tipos_objeto WHERE descricao ILIKE '${dados.descricao}' AND id <> ${dados.id} LIMIT 1) > 0 AS existe;`;
        // console.log(text);

        return this._query(text, 'application.app.model.verificaConflitoDeNome');
    }
    
    /**
     * Insere um novo tipo de objeto no banco.
     * 
     * @param {Object} dados 
     * @param {String} dados.descricao
     * @returns {Promise(resolve, results)} Promise
     * @memberof TiposObjetosDAO
     */
    inserir(dados)
    {
        const text = `INSERT INTO tipos_objeto (descricao) VALUES ('${dados.descricao}')`;
        // console.log(text);

        return this._query(text, 'application.app.model.inserir');
    }

    /**
     * Atualiza um tipo de objeto no banco.
     * 
     * @param {Object} dados 
     * @param {String} dados.descricao 
     * @returns {Promise(resolve, results)} Promise
     * @memberof TiposObjetosDAO
     */
    atualizar(dados)
    {
        const text = `UPDATE tipos_objeto SET descricao = '${dados.descricao}' WHERE id = ${dados.id};`;
        // console.log(text);

        return this._query(text, 'application.app.models.TiposObjetosDAO.atualizar');
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

module.exports = () => TiposObjetosDAO;
