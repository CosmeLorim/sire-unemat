/**
 * Classe DAO referente ao controller "usuarios".
 * 
 * @class UsuariosDAO
 */
class UsuariosDAO
{
    /**
     * Cria uma instância de UsuariosDAO.
     * 
     * @param {ConnectionConfig} connection 
     * @memberof UsuariosDAO
     */
    constructor(connection)
    {
        this._pool = connection;
    }

    /**
     * Recupera um intervalo de usuários.
     * 
     * @param {Object} dados 
     * @param {String} dados.txConsulta
     * @param {Number} dados.offset
     * @param {Number} dados.limit
     * @returns {Promise(resolve, results)} Promise
     * @memberof UsuariosDAO
     */
    buscaIntervalo(dados)
    {
        const text = `SELECT  `+
                        `id, nome, usr, admin `+
                    `FROM `+
                        `usuarios u `+
                    `WHERE `+
                        `nome ILIKE '${dados.txConsulta}' `+
                    `OR `+
                        `usr ILIKE '${dados.txConsulta}' `+
                    `ORDER BY `+
                        `nome `+
                    `LIMIT `+
                        `${dados.limit} `+
                    `OFFSET `+
                        `${dados.offset}; `+
                    `SELECT  `+
                        `COUNT(0) `+
                    `FROM `+
                        `usuarios u `+
                    `WHERE `+
                        `nome ILIKE '${dados.txConsulta}';`;
        // console.log(text);

        return this._query(text, 'application.app.models.UsuariosDAO.buscaIntervalo');
    }

    /**
     * Recupera perfis de um usuarios.
     * Busca por: usuario.usuario.
     * 
     * @param {Object} dados 
     * @param {Number} dados.id
     * @returns {Promise(resolve, results)} Promise
     * @memberof UsuariosDAO
     */
    buscarPerfisPorUsuario(dados)
    {
        const text = `SELECT id, ativo, tipo_objeto, usuario FROM perfis WHERE usuario = ${dados.id};`;
        // console.log(text);

        return this._query(text, 'application.app.models.UsuariosDAO.buscarPerfisPorUsuario');
    }

    /**
     * Verifica conflito de usr.
     * Busca por: usuario.usr.
     * 
     * @param {Object} dados
     * @param {Number} dados.id
     * @param {String} dados.usr
     * @returns {Promise(resolve, results)} Promise
     * @memberof UsuariosDAO
     */
    verificarSeExiste(dados)
    {
        const text = typeof(dados.id) === 'undefined' ?
        `SELECT (SELECT COUNT(0) FROM usuarios WHERE usr ILIKE '${dados.usr}' LIMIT 1) > 0 AS existe;`
        : `SELECT (SELECT COUNT(0) FROM usuarios WHERE usr ILIKE '${dados.usr}' AND id <> ${dados.id} LIMIT 1) > 0 AS existe;`;
        // console.log(text);
        
        return this._query(text, 'application.app.models.UsuariosDAO.verificarSeExiste');
    }

    /**
     * Busca dos dados necessários do usuário para autenticação e criação da sessão.
     * Busca por: usuarios.usr
     * 
     * @param {Object} dados 
     * @param {String} dados.usr
     * @returns {Promise(resolve, results)} Promise
     * @memberof UsuariosDAO
     */
    buscarUsuarioPorUsr(dados, callback)
    {
        const text = `SELECT id, nome, usr, passwd, admin, primeiro_login FROM usuarios WHERE usr ILIKE '${dados.usr}' LIMIT 1;`;
        // console.log(text);
        
        return this._query(text, 'application.app.models.AutenticacaoDAO.buscarUsuarioPorUsr');
    }

    /**
     * Recupera perfis.
     * Busca por: perfis.usuario.
     * 
     * @param {Number} dados.usuario
     * @returns {Promise(resolve, results)} Promise
     * @memberof UsuariosDAO
     */
    buscaPerfis(dados)
    {
        const text = `SELECT * FROM perfis WHERE usuario = ${dados.usuario};`;
        // console.log(text);

        return this._query(text, 'application.app.models.UsuariosDAO.buscaPerfis');
    }

    /**
     * Recupera todos os tipos_objeto do banco.
     * 
     * @returns {Promise(resolve, results)} Promise
     * @memberof UsuariosDAO
     */
    buscarTodosTiposObjetos()
    {
        const text = `SELECT id, descricao FROM tipos_objeto;`;

        return this._query(text, 'application.app.models.UsuariosDAO.buscarTodosTiposObjetos');
    }

    /**
     * Insere um novo usuario no banco.
     * 
     * @param {Object} dados 
     * @param {String} dados.nome 
     * @param {String} dados.usr 
     * @param {Number} dados.passwd 
     * @param {Boolean} dados.admin 
     * @returns {Promise(resolve, results)} Promise
     * @memberof UsuariosDAO
     */
    inserir(dados)
    {
        const text = `INSERT INTO `+
                        `usuarios (nome, usr, passwd, admin) `+
                    `VALUES `+
                        `('${dados.nome}', '${dados.usr}', '${dados.passwd}', ${dados.admin}) `+
                    `RETURNING id;`;
        // console.log(text);

        return this._query(text, 'application.app.models.UsuariosDAO.inserir');
    }

    /**
     * Insere novos perfis.
     * 
     * @param {Object} dados 
     * @param {Number[]} dados.tiposObjetos
     * @param {Number} dados.usuario
     * @returns {Promise(resolve, results)} Promise
     * @memberof UsuariosDAO
     */
    inserirPerfis(dados)
    {
        const text = dados.tiposObjetos.map(tipoObjeto => `INSERT INTO perfis (tipo_objeto, usuario) VALUES (${tipoObjeto}, ${dados.usuario});\n`).join('');
        // console.log(text);

        return this._query(text, 'application.app.models.UsuariosDAO.inserirPerfis');
    }

    /**
     * Atualiza todos os atritutos de um usuário.
     * Busca por: usuario.id.
     * 
     * @param {Object} dados 
     * @param {Object[]} dados.atributos
     * @param {String} dados.atributos.chave
     * @param {String} dados.atributos.valor
     * @param {Number} dados.id
     * @param {Boolean} dados.admin
     * @returns {Promise(resolve, results)} Promise
     * @memberof UsuariosDAO
     */
    atualizar(dados)
    {
        const atributos = dados.atributos.map(atb => `${atb.chave} = ${typeof atb.valor === 'string' ? `'${atb.valor}'` : atb.valor}`).join(', ');

        const text = `UPDATE `+
                        `usuarios `+
                    `SET `+
                        `${atributos} `+
                    `WHERE `+
                        `id = ${dados.id};`;
        // console.log(text);

        return this._query(text, 'application.app.models.UsuariosDAO.atualizar');
    }

    /**
     * Reativa perfis.
     * Busca por: perfis.id.
     * 
     * @param {Object} dados 
     * @param {Object[]} dados.perfis
     * @param {Number} dados.perfis.id
     * @returns {Promise(resolve, results)} Promise
     * @memberof UsuariosDAO
     */
    alternarPerfis(dados)
    {
        const text = dados.perfis.map(perfil => `UPDATE perfis SET ativo = ${perfil.ativo} WHERE id = ${perfil.id};\n`).join('');
        // console.log(text);

        return this._query(text, 'application.app.models.UsuariosDAO.alternarPerfis');
    } 

    /**
     * Metodo interno para execução da query.
     * 
     * @param {Object} dados 
     * @param {String} dados.sql 
     * @param {String} dados.metodo
     * @returns {Promise(resolve, results)} Promise
     * @memberof UsuariosDAO
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

module.exports = () => UsuariosDAO;
