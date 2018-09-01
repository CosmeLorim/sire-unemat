/**
 * Classe DAO referente ao controller "inicio".
 * 
 * @class InicioDAO
 */
class InicioDAO
{
    /**
     * Cria uma instância de InicioDAO.
     * 
     * @param {ConnectionConfig} connection 
     * @memberof InicioDAO
     */
    constructor(connection)
    {
        this._pool = connection;
    }

    /**
     * Recupera os tipos de objetos ativos.
     * 
     * @param {function({error: Error}, {results: QueryResult})} callback 
     * @memberof DisciplinasDAO
     */
    buscaTiposObjetos(callback)
    {
        const text = `SELECT id, descricao FROM tipos_objeto;`;

        // console.log(text);
        this._pool.query(text, callback);
    }
}

module.exports = () => InicioDAO;