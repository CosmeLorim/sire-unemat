require('dotenv-safe').load();
const raizApplication = __dirname.slice(0, __dirname.length - 6);

let express = require('express'),
    helmet = require('helmet'),
    expressSession = require('express-session'),
    expressLoad = require('express-load'),
    bodyParser = require('body-parser')
    pgSession = require('connect-pg-simple')(expressSession)
    connection = require(`${raizApplication}config/dbConnection`);

let application = express();
application.use(helmet());

application.set('view engine', 'ejs');  //configura o motor de renderização
application.set('views', `${raizApplication}app/views`);//configura o diretório para uso do motor de renderização

application.use(bodyParser.json());
application.use(bodyParser.urlencoded({extended: true}));

application.use(express.static(`${raizApplication}app/public`));//configura o diretório de arquivos estaticos

//configuração da sessão
application.use(expressSession(
    {
        store: new pgSession(
            {
                pool: connection(),
                tableName: 'session'
            }),
        secret: process.env.EXPRESS_SECRET,
        rolling: true,
        resave: true,
        saveUninitialized: false,
        cookie: { maxAge: parseInt(process.env.EXPRESS_COOKIE_MAXAGE) }
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
    .then(`config/dbConnectionV2`, {verbose: false, cwd: `${raizApplication}`})
    .then(`config/dbConnectionProducao`, {verbose: false, cwd: `${raizApplication}`})
    .then(`app/modules`, {verbose: false, cwd: `${raizApplication}`})
    .then(`app/controllers`, {verbose: false, cwd: `${raizApplication}`})
    .then(`app/routes`, {verbose: false, cwd: `${raizApplication}`})
    .into(application);

module.exports = application;
