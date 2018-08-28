UsuariosDAO = function (connection)
{
    this._pool = connection;
    this._tabela = 'usuarios';
    
    /*
     * Faz busca de um intervalo de usuários e retorna a row deles no banco
     * @param {txConsulta: char[], limit: integer, offset: integer} dados
     * @param {function} callback
     * @returns {undefined}
     */
    this.buscaIntervalo = (dados, callback) =>
    {
        const text =
                `SELECT 
                    u.id AS id, u.nome AS nome, u.usr AS usr, u.ativo AS ativo, u.admin AS admin
                FROM
                    ${this._tabela} u
                WHERE
                    nome ILIKE \'${dados.txConsulta}\'
                ORDER BY
                    nome
                LIMIT
                    ${dados.limit}
                OFFSET
                    ${dados.offset};
                SELECT 
                    COUNT(u.id)
                FROM
                    ${this._tabela} u
                WHERE
                    nome ILIKE \'${dados.txConsulta}\';`;
//        console.log(text);
        this._pool.query(text, callback);
    };
    /*
     * Faz busca de usuário por 'usr' e retorna um a row dele no banco
     * @param {integer} id
     * @param {function} callback
     * @returns {undefined}
     */
    this.buscarPorUsr = (usr, callback) =>
    {
        const text = `SELECT
                        *
                    FROM
                        ${this._tabela}
                    WHERE
                        usr ILIKE \'${usr}\'
                    LIMIT
                        1;`;
        this._pool.query(text, callback);
    };
    
    /*
     * Faz busca de usuário por ID e retorna um a row dele no banco
     * @param {integer} id
     * @param {function} callback
     * @returns {undefined}
     */
    this.buscarPorId = (id, callback) =>
    {
        const text = `SELECT
                        *
                    FROM
                        ${this._tabela}
                    WHERE
                        usr ILIKE \'${id}\'
                    LIMIT
                        1;`;
        this._pool.query(text, callback);
    };

    /*
     * Faz busca de todos os usuários ativos no banco e retorna um a row dele no banco 
     * @param {function} callback
     * @returns {undefined}
     */
    this.buscaTodosAtivo = (callback) =>
    {
        const text =
                `SELECT 
                    u.id AS id, u.nome AS nome, u.usr AS usr, u.ativo AS ativo, u.admin AS admin
                FROM
                    ${this._tabela} u
                WHERE
                    ativo = true
                ORDER BY
                    nome;`;

        this._pool.query(text, callback);
    };
    
    /*         FUNÇÃO PARA INSERIR UM NOVO OBJETO NO BANCO                      */
    /*  A FUNÇÃO ESPERA UM ARRAY COM TRÊS VALORES: DESCRICAO COM 30 CARACTERES  */
    /*       NO MÁXIMO, UM BOOLEAN PARA ATIVO E A REFERENCIA                    */
    /*                   PARA O TIPO DO OBJETO                                  */
    /*          ['DESCRICAO', 'ATIVO', 'TIPO_OBJETO']                           */
    this.inserir = (values, callback) =>
    {
        const text = `INSERT INTO ${this._tabela} (nome, usr, passwd, admin, ativo) VALUES ($1, $2, $3, $4, $5);`;
        this._pool.query(text, values, callback);
    };

    /*
     * Atualiza um usuário com base no ID
     * @param {boolean} admin
     * @param {boolean} ativo
     * @param {integer} id
     * @param {char} nome
     * @param {char} passwd
     * @param {char} usr
     * @param {function} callback
     * @returns {undefined}
     */
    this.atualizarTudo = (admin, ativo, id, nome, passwd, usr, callback) =>
    {
        const text = `UPDATE 
                        ${this._tabela}
                      SET  
                        admin = ${admin}, ativo = ${ativo}, nome = \'${nome}\', passwd = \'${passwd}\', usr = \'${usr}\'
                      WHERE
                        ID = ${id};`;
//        console.log(text);
        this._pool.query(text, callback);
    };
    
        /*
     * Atualiza Usuário com base no ID
     * @param {boolean} admin
     * @param {boolean} ativo
     * @param {integer} id
     * @param {char} nome
     * @param {char} passwd
     * @param {char} usr
     * @param {function} callback
     * @returns {undefined}
     */
    this.atualizarSemSenha = (admin, ativo, id, nome, usr, callback) =>
    {
        const text = `UPDATE 
                        ${this._tabela}
                      SET  
                        admin = ${admin}, ativo = ${ativo}, nome = \'${nome}\', usr = \'${usr}\'
                      WHERE
                        ID = ${id};`;
//        console.log(text);
        this._pool.query(text, callback);
    };
};
module.exports = () => UsuariosDAO;
