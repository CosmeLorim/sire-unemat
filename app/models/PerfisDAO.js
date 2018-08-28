class PerfisDAO
{
    /*
     * Construtor da classe
     * @param {function} connection
     * @returns {nm$_PerfisDAO.PerfisDAO}
     */
    constructor(connection)
    {
        this._pool = connection;
        this._tabela = 'perfis';
    }

    /*
     * Busca perfis com base no USR
     * @param {char[]} txBusca
     * @param {function} callback
     * @returns {undefined}
     */
    buscarPorUsuario(id, callback)
    {
        const text = `SELECT * FROM ${this._tabela} WHERE usuario = ${id};`;
        this._pool.query(text, callback);
    }

    /*
     * Insere novos perfis
     * @param {integer[]} tipo_objeto
     * @param {integer} usuario
     * @param {function} callback
     * @returns {undefined}
     */
    inserir(tipo_objeto, usuario, callback)
    {
        let text = '';
        tipo_objeto.forEach((item) =>
        {
            text += `INSERT INTO ${this._tabela} (tipo_objeto, usuario) VALUES (${item}, ${usuario});\n`;
        });
        this._pool.query(text, callback);
    }
    
    /*
     * 
     * @param {integer} usuario
     * @param {function} callback
     * @returns {undefined}
     */
    verificar(usuario, callback)
    {
        const text = `SELECT * FROM ${this._tabela} WHERE usuario = ${usuario};`;
        this._pool.query(text, callback);
    }
    
    /*
     * 
     * @param {usuario[], tipo_objeto[], ativo[]} perfil
     * @param {function} callback
     * @returns {undefined}
     */
    atualizar(perfil, callback)
    {
        let text = '';
        perfil.forEach((perf)=>
        {
            text += `UPDATE 
                        ${this._tabela}
                      SET  
                        usuario = ${perf.usuario}, tipo_objeto= ${perf.tipo_objeto}, ativo = ${perf.ativo}
                      WHERE
                        ID = ${perf.id};\n`;
        });
        this._pool.query(text, callback);
    }
}

module.exports = () => PerfisDAO;