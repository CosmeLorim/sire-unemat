/**
 * Fomata dia ou mês para o formato correto para o "Date.parse" interpretar.
 * 
 * @param {Number} dia 
 */
const formatarDiaOuMes = (dia) => parseInt(dia) < 10 ? `0${parseInt(dia)}` : dia;

/**
 * Método para conversão de data para timesTamp.
 * 
 * @param {Object} data
 * @param {Number} data.dia
 * @param {Number} data.mes
 * @param {Number} data.ano
 * @returns {Number}
 */
module.exports.dataParaTimesTamp = (data) => Date.parse(`${data.ano}-${formatarDiaOuMes(data.mes)}-${formatarDiaOuMes(data.dia)}T00:00:00`) / 1000;

/**
 * Método para pegar o Time Stamp do dia atual.
 * 
 * @returns {Number}
 */
module.exports.timeStampDiaAtual = () =>
{
    const hoje = new Date();
    
    return Date.parse(`${hoje.getFullYear()}-${formatarDiaOuMes((hoje.getMonth() + 1))}-${formatarDiaOuMes(hoje.getDate())}T00:00:00`) / 1000;
}

/**
 * @typedef {Object} DataEHora
 * @property {string} data
 * @property {string} hora
 */

/**
 * Método para pegar data e hora atual.
 * 
 * @returns {DataEHora}
 */
module.exports.dataEHoraAtual = () =>
{
    const agora = new Date();

    const data = `${agora.getDate()}/${agora.getMonth() + 1}/${agora.getFullYear()}`;
    const hora = `${agora.getHours()}:${agora.getMinutes()}:${agora.getSeconds()}`;
    
    return { data, hora };
}
