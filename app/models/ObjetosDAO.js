/**
 * Classe DAO referente ao controller "objetos".
 * 
 * @class ObjetosDAO
 */
class ObjetosDAO
{
    /**
     * Cria uma instância de CursosDAO.
     * 
     * @param {ConnectionConfig} connection 
     * @memberof ObjetosDAO
     */
    constructor(connection)
    {
        this._pool = connection;
    }

    /**
     * Busca o estado de um objeto.
     * Busca por: objetos.id
     * 
     * @param {Object} dados 
     * @param {Number} dados.id
     * @returns {Promise(resolve, results)} Promise
     * @memberof ObjetosDAO
     */
    buscarEstado(dados)
    {
        const text = `SELECT ativo FROM objetos WHERE id = ${dados.id} LIMIT 1;`
        // console.log(text);

        return this._query(text, 'application.app.models.ObjetosDAO.buscar');
    }

    /**
     * Recupera um intervalo definido de registros de cursos do banco.
     * Busca por: disciplinas.descricao, tipos_objeto.descricao.
     * 
     * @param {Object} dados 
     * @param {String} dados.txConsulta
     * @param {Number} dados.offset
     * @param {Number} dados.limit
     * @returns {Promise(resolve, results)} Promise
     * @memberof ObjetosDAO
     */
    buscaIntervalo(dados)
    {
        const text = `SELECT `+
                        `o.id AS objId, o.descricao AS objDescricao, o.ativo AS objAtivo, t.descricao AS tipObjDescricao, t.id AS tipObjId `+
                    `FROM `+
                        `objetos o `+
                    `INNER JOIN `+
                        `tipos_objeto t ON o.tipo_objeto = t.id `+
                    `WHERE `+
                    `(`+
                            `o.descricao ILIKE '${dados.txConsulta}' `+
                        `OR `+
                            ` t.descricao ILIKE '${dados.txConsulta}' `+
                    `)` +
                    `AND `+
                        `o.ativo = TRUE `+
                    `ORDER BY `+
                        `o.descricao ASC `+
                    `LIMIT `+
                        `${dados.limit} `+
                    `OFFSET `+
                        `${dados.offset};\n`+
                    `SELECT `+
                        `COUNT(o.id) `+
                    `FROM `+
                        `objetos o `+
                    `INNER JOIN `+
                        `tipos_objeto t `+
                    `ON `+
                        `o.tipo_objeto = t.id `+
                    `WHERE `+
                    `(`+
                            `o.descricao ILIKE '${dados.txConsulta}' `+
                        `OR `+
                            ` t.descricao ILIKE '${dados.txConsulta}' `+
                    `)` +
                    `AND `+
                        `o.ativo = TRUE;`;
        // console.log(text);

        return this._query(text, 'application.app.models.ObjetosDAO.buscaIntervalo');
    }

    /**
     * Recupera objetos ativos conforme os perfis ativos de um usuarios.
     * Busca por: usuario.usr
     * 
     * @param {Object} dados 
     * @param {String} dados.usr
     * @param {String} dados.txConsulta
     * @param {Number} dados.offset
     * @param {Number} dados.limit
     * @returns {Promise(resolve, results)} Promise
     * @memberof ObjetosDAO
     */
    buscaIntervaloPorPerfisDoUsuario(dados)
    {
        const text = `SELECT `+
                        `ob.id AS objetoId, ob.descricao AS objetoDescricao, ob.ativo AS objetoAtivo, t.descricao AS tipoObjetoDescricao, t.id AS tipoObjetoId `+
                    `FROM `+
                        `objetos ob `+
                    `INNER JOIN `+
                        `perfis p ON p.tipo_objeto = ob.tipo_objeto `+
                    `INNER JOIN `+
                        `tipos_objeto t ON ob.tipo_objeto = t.id `+
                    `INNER JOIN `+
                        `usuarios us ON us.id = p.usuario `+
                    `WHERE `+
                        `us.usr ilike '${dados.usr}' `+
                    `AND `+
                        `p.ativo = TRUE `+
                    `AND `+
                        `ob.ativo = TRUE `+
                    `AND `+
                        `ob.descricao ILIKE '${dados.txConsulta}' `+
                    `ORDER BY `+
                        `ob.descricao ASC `+
                    `LIMIT `+
                        `${dados.limit} `+
                    `OFFSET `+
                        `${dados.offset};\n`+
                    `SELECT `+
                        `COUNT(ob.id) AS count `+
                    `FROM `+
                        `objetos ob `+
                    `INNER JOIN `+
                        `perfis p ON p.tipo_objeto = ob.tipo_objeto `+
                    `INNER JOIN `+
                        `usuarios us ON us.id = p.usuario `+
                    `WHERE `+
                        `us.usr ilike '${dados.usr}' `+
                    `AND `+
                        `p.ativo = TRUE `+
                    `AND `+
                        `ob.ativo = TRUE `+
                    `AND `+
                        `ob.descricao ILIKE '${dados.txConsulta}';`;
        // console.log(text)

        return this._query(text, 'application.app.models.ObjetosDAO.buscaIntervaloPorPerfisDoUsuario');
    }
    
    /**
     * Verifica se existe um objeto no banco.
     * Busca por: objetos.descricao.
     * 
     * @param {Object} dados 
     * @param {String} dados.descricao
     * @returns {Promise(resolve, results)} Promise
     * @memberof ObjetosDAO
     */
    verificarSeExiste(dados)
    {
        const text = `SELECT (SELECT COUNT(0) FROM objetos WHERE descricao ILIKE '${dados.descricao}' LIMIT 1) > 0 AS existe;`;
        // console.log(text);

        return this._query(text, 'application.app.models.ObjetosDAO.verificarSeExiste');
    }

    /**
     * Verifica se existe um objeto com a mesma descrição.
     * Busca por: objetos.descricao.
     * 
     * @param {Object} dados 
     * @param {String} dados.descricao
     * @returns {Promise(resolve, results)} Promise
     * @memberof ObjetosDAO
     */
    verificaConflitoDeNome(dados)
    {
        const text = `SELECT (SELECT COUNT(0) FROM objetos WHERE descricao ILIKE '${dados.descricao}' AND id <> ${dados.id} LIMIT 1) > 0 AS existe;`;

        // console.log(text);
        return this._query(text, 'application.app.models.ObjetosDAO.verificaConflitoDeNome');
    }
    
    /**
     * Recupera todos os tipos de objeto do banco.
     * 
     * @returns {Promise(resolve, results)} Promise
     * @memberof TiposObjetosDAO
     */
    buscarTodosTiposObjetos()
    {
        const text = `SELECT id, descricao FROM tipos_objeto;`;

        return this._query(text, 'application.app.models.ObjetosDAO.buscarTodosTiposObjetos');
    }

    /**
     * Insere um novo objeto no banco.
     * 
     * @param {Object} dados 
     * @param {String} dados.descricao
     * @param {Boolean} dados.ativo
     * @param {Number} dados.tipoObjeto
     * @returns {Promise(resolve, results)} Promise
     * @memberof ObjetosDAO
     */
    inserir(dados)
    {
        const text = `INSERT INTO objetos (descricao, ativo, tipo_objeto) VALUES ('${dados.descricao}', ${dados.ativo}, ${dados.tipoObjeto})`;
        // console.log(text);

        return this._query(text, 'application.app.models.ObjetosDAO.inserir');
    }
    
    /**
     * Atualiza um objeto.
     * 
     * @param {Object} dados 
     * @param {Number} dados.id
     * @param {String} dados.descricao
     * @param {Boolean} dados.ativo
     * @param {Number} dados.tipoObjeto
     * @returns {Promise(resolve, results)} Promise
     * @memberof ObjetosDAO
     */
    atualizar(dados)
    {
        const text = `UPDATE objetos SET descricao = '${dados.descricao}', ativo = ${dados.ativo}, tipo_objeto = ${dados.tipoObjeto} WHERE id = ${dados.id};`;
        // console.log(text);

        return this._query(text, 'application.app.models.ObjetosDAO.atualizar');
    }

    /**
     * Atualiza um objeto.
     * 
     * @param {Object} dados 
     * @param {Number} dados.id
     * @param {String} dados.descricao
     * @param {Boolean} dados.ativo
     * @param {Number} dados.tipoObjeto
     * @returns {Promise(resolve, results)} Promise
     * @memberof ObjetosDAO
     */
    atualizar(dados)
    {
        const text = `UPDATE objetos SET descricao = '${dados.descricao}', ativo = ${dados.ativo}, tipo_objeto = ${dados.tipoObjeto} WHERE id = ${dados.id};`;
        // console.log(text);

        return this._query(text, 'application.app.models.ObjetosDAO.atualizar');
    }

    /**
     * Desativa reservas e operações envolvendo o objeto.
     * Busca por: objetos.objeto
     * 
     * @param {Object} dados 
     * @param {Number} dados.objeto
     * @returns {Promise(resolve, results)} Promise
     * @memberof ObjetosDAO
     */
    desativacao(dados)
    {
        const text = `SELECT desativar_objeto(${dados.objeto});`;
        // console.log(text);

        return this._query(text, 'application.app.models.ObjetosDAO.desativacao');
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

module.exports = () => ObjetosDAO;
