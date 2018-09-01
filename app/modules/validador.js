/**
 * Expressão regular para hash md5
 */
const expressaoRegularMD5 = /^[a-f0-9]{32}$/;

/**
 * Valida se a string é um hash md5.
 * 
 * @param {String} str 
 */
const md5 = str => expressaoRegularMD5.test(str);