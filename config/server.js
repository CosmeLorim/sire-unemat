let     express = require('express'),
        helmet = require('helmet'),
        expressSession = require('express-session'),
        expressValidator = require('express-validator'),
        expressLoad = require('express-load'),
        bodyParser = require('body-parser');

const raizApplication = __dirname.slice(0, __dirname.length - 6);

let application = express();
application.use(helmet());

application.set('view engine', 'ejs');  //configura o motor de renderização
application.set('views', `${raizApplication}app/views`);//configura o diretório para uso do motor de renderização

application.use(bodyParser.json());
application.use(bodyParser.urlencoded({extended: true}));

application.use(expressValidator());

application.use(express.static(`${raizApplication}app/public`));//configura o diretório de arquivos estaticos

//configuração da sessão
application.use(expressSession(
    {
        secret: '24234t24tgwergGGSDFGQG23dasd',
        resave: false,
        saveUninitialized: false,
        cookie: {maxAge: 1000 * 60 * 60 * 5} //1000 (um segundo) * 60 (um minuto) * 60 (uma hora) * 5
    }
));

/*Collect and monitor custom metrics*/
let probe = require('pmx').probe();

let counter = 0;

let metric = probe.metric(
{
    name: 'Realtime user',
    value: function () {
    return counter;
}
});

setInterval(function () {
    counter++;
}, 100);

expressLoad(`app/models`, {verbose: false, cwd: `${raizApplication}`})
    .then(`config/dbConnection`, {verbose: false, cwd: `${raizApplication}`})
    .then(`app/controllers`, {verbose: false, cwd: `${raizApplication}`})
    .then(`app/routes`, {verbose: false, cwd: `${raizApplication}`})
    .into(application);

module.exports = application;
