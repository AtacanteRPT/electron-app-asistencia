/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

var SerialPort = require('serialport');
var rest = require('restler');
var moment = require('moment')
var baseidentificacion = ''
var actualIdentificacion = '0'
var pathing = __dirname;
var async = require('async');
var auxAlumno = {
    identificacion: 0,
    materno: 'materno',
    paterno: 'paterno',
    nombre: 'nombre',
    curso: 'predeterminado',
    turno: 'predeterminado',
    img: "",
}
const fileUpload = require('express-fileupload');
var cors = require('cors');
var express = require('express'),
    app = express(),
    http = require('http'),
    socketIo = require('socket.io');
var bodyParser = require('body-parser');
app.use(cors());


let ruta = __dirname.split("\\");
let long = ruta.length;
pathing = __dirname.substring(0, __dirname.length - ((ruta[long - 1].length + ruta[long - 2].length) + 2));
console.log("PATHING", pathing)
app.use(express.static(pathing));
app.use(fileUpload());
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
})); // support encoded bodies

// Include the node file module
var fs = require('fs');
var scanners = [];

var server = http.createServer(app);
var io = socketIo.listen(server);
var config;

console.log("Antes de verificar archivo");
console.log(fs.existsSync(pathing + '/config.json'));
console.log("Despues de verificar el archivos")
if (!fs.existsSync(pathing + '/config.json')) {
    let config = {
        'servidorUrl': 'http://192.168.0.107:1337',
        ports: []
    };
    fs.writeFileSync(pathing + '/config.json', JSON.stringify(config), 'utf-8');
} else {
    let data = fs.readFileSync(pathing + '/config.json', 'utf-8');
    config = JSON.parse(data);

    scanners = config.ports;
}
console.log(config);
// Post files

app.get('/fondo', function (req, res) {
    res.send({
        fondo: "http://127.0.0.1:1338/fondo.png"
    });
    res.end();
})

app.get('/seleccionados', function (req, res) {
    console.log(config.ports)
    res.send(config.ports);
});

app.get('/puertos', function (req, res) {
    SerialPort.list(function (err, ports) {
        res.send(ports);
    });
});

app.post('/puertos', function (req, res) {
    if (req.body) {
        let comname = req.body.comName;
        if (comname !== undefined) {
            config.ports.push(comname);
            fs.writeFileSync(pathing + '/config.json', JSON.stringify(config), 'utf-8');
            res.json({
                msg: 'PORT COM guardado'
            });
        } else {
            res.status(404);
        }
    }

    res.status(404);
    res.end();
});

app.delete('/seleccionados/:port', function (req, res) {
    console.log(req.params);
    if (req.params) {
        console.log(req.params);
        let comname = req.params.port;
        if (comname !== undefined) {
            let puertosActivados = []
            config.ports.forEach(element => {
                if (element !== comname) {
                    puertosActivados.push(element);
                }
            })
            config.ports = puertosActivados;
            fs.writeFileSync(pathing + '/config.json', JSON.stringify(config), 'utf-8');
            res.json({
                msg: 'PORT COM actualizado'
            });
        } else {
            res.status(404);
        }
    }

    res.status(404);
    res.end();
});


app.post('/server', function (req, res) {
    if (req.body) {
        let pathserver = req.body.pathserver;
        if (pathserver !== undefined) {
            // config.ports.push(pathserver);
            console.log(pathserver)
            config.servidorUrl = pathserver;
            fs.writeFileSync(pathing + '/config.json', JSON.stringify(config), 'utf-8');
            res.json({
                msg: 'Ruta del servidor guardada'
            });
        } else {
            res.status(404);
        }
    }

    res.status(404);
    res.end();
});

app.get('/server', function (req, res) {

    if (config.servidorUrl !== undefined) {
        res.json({
            pathserver: config.servidorUrl
        });
    }
    res.status(404);
    res.end();
});

// app.post('/upload',function(req,res){
//   if(!req.files)
//     return res.send('{"msg":"No se los subieron archivos"}');
//   let fondo = req.files.fondo;
//   fondo.mv('../../fondo.jpg', function(err) {
//     if (err){
//       return res.status(500).send(err);
//     }

//     res.send('{"fondo":"http://127.0.0.1:1340/fondo.jpg"}')
//     res.end();
//   });
// })
app.post('/upload', function (req, res) {
    // pathingImg();
    var newPath = pathing + "\\fondo.png";
    fs.writeFile(newPath, req.files.fondo.data, 'binary', function (err) {
        console.log(newPath);
        res.send({
            fondo: pathing,
            err: err,
            dir: __dirname
        });
        res.end();
    });
});



server.listen(1338);
console.log('Server Sockets: el puerto 1338');

//  var socketIo = require('socket.io');

// var io = socketIo.listen(sails.hooks.http.server);

var port_1;
var port_2;
var port_3;
var port_4;
var port_5;
var port_6;

var horaActual = ''
var maxHoraLlegada = 9;
var minsLlegada = 0;
var minHoraSalida = 12;
var minsSalida = 0;
var hoy = new Date();


var auxiliar = [1, 2]

var IO;
var servidorURL = "";
var estaConectado = false;
var bandera = true;

var auxSocket = null;

function enviaQR(data, socket, servidorURL) {

    var hoy = new Date()
    baseidentificacion = '';
    var auxBase = data.toString();

    auxBase = auxBase.split("$");
    baseidentificacion = auxBase[0]

    var datos = {
        baseidentificacion: baseidentificacion
    }

    // console.log(servidorURL);
    rest.postJson(servidorURL + '/asistencia/mostrar', datos).on('complete', function (data, response) {

        // sails.log("AUXBASE :::", baseidentificacion);
        data.img = servidorURL + "/" + data.img;
        if (data.rol === 'tutor') {
            data.alumnos.forEach(element => {
                element.img = servidorURL + "/" + element.img;
            })
        }
        // console.log('baseindentificacion',data);
        socket.emit('asistencia', data);
        console.log("Emitido")
    });

}

function createListenPort(comName) {
    return (new SerialPort("COM10", {
        bounRate: 57600,
        autoOpen: true
    }))
}

function listenPort(objPort, socket) {

    if (!objPort.port.isOpen()) {
        console.log("PUESTRO ; CERRADO")
        objPort.port.open(function (err) {
            if (err) {
                console.log(err);
            }
        })

    } else {
        console.log("PUERTO ABIERTO")
        console.log("+++++++++++++++++++++++ objeto puerto abrir", objPort.port.path);
        estaConectado = false;
        if (bandera) {
            bandera = false;
            objPort.port.on('open', function () {
                console.log("****************puerto abierto")
                objPort.isActive = true;
                console.log(objPort.port.path)
                socket.emit('handlePorts', {
                    action: 'open',
                    name: objPort.port.path
                });
            });
            // objPort.port = null;

            objPort.port.on('data', function (data) {
                console.log("PORT.ON.DATA ");
                // console.log("code ", data.toString());
                // socket.emit('handlePorts',{action:'data',data:data.toString()});
                //descomentar para produccion
                estaConectado = false;
                enviaQR(data, socket, objPort.servidorURL)
            });

            objPort.port.on('error', function (err) {
                console.log("PORT.ERROR ");

                objPort.isActive = false;
                socket.emit('handlePorts', {
                    action: 'error',
                    name: objPort.port.path
                });
                console.log(' **** Error: ', err.message);
            });
            objPort.port.on('desconnect', function (err) {
                console.log("PORT.DESCONNECT ");

                objPort.isActive = false;
                console.log(' **** Desconnect: ', err.message);
            });
            objPort.port.on('close', function (err) {
                console.log("PORT.CLOSE ");

                objPort.isActive = false;

                console.log(objPort.port.path)
                // socket.emit('handlePorts', {
                //     action: "close",
                //     name: objPort.port.path
                // });
                // objPort=nullobj
                // objPort.port =  null;
                estaConectado = true;
                // listenPort(objPort,socket)
                // console.log(' **** close: ', err.message);
            });
        }



    }

}

console.log("antes de los sockects", config)
// servidorURL = datoConfig.servidorUrl
var portActives = [];




let ports = config.ports;
if (typeof config !== 'undefined') {
    console.log("iterandeo los puertos");
    // console.log("lista de puertos",ports);
    ports.forEach(element => {
        portActives.push({
            name: element,
            isActive: true,
            servidorURL: config.servidorUrl,
            port: new SerialPort(element, {
                baudRate: 57600,
                autoOpen: true
            })
        });
    });
    console.log("iteracion finalizada");
}
setInterval(abrirPuertos, 1000);

var auxHandlePortsData = null;

function abrirPuertos() {
    console.log("verificando")
    if (estaConectado) {

        // let objMsg = JSON.parse(auxHandlePortsData);
        // if (objMsg.msg === 'activados') {
        //     socket.emit('handlePorts', {
        //         action: "list",
        //         portActives
        //     });
        //     console.log("port activados")
        //     // socket.emit('handlePorts',portActives);      
        // }
        // if (objMsg.msg === 'abrir') {
        portActives.forEach(element => {
            // console.log(objMsg.port, "  ", element.name)
            // if (objMsg.port === element.name) {
            listenPort(element, auxSocket);
            // }
            auxSocket.emit('handlePorts', {
                action: "list",
                portActives
            });
        })

        // estaConectado=false
        console.log("port activados")
        // socket.emit('handlePorts',portActives);      
        // }
    } 
}
// console.log("portActives despues de iterar",portActives )
var numConection = 0;
IO = io.on('connection', function (socket) {
    auxSocket = socket;
    if (numConection === 0) {
        portActives.forEach(element => {
            bandera=true;
            listenPort(element, socket);
        });
    }

    numConection++;
    console.log(numConection);
    socket.on('asistencia', function (data) {
        console.log('****asistencia', data);
        socket.emit('asistencia', "conectado");

    });
    socket.on('handlePorts', function (data) {
        console.log('****handlePorts', data);
        auxHandlePortsData = data;
        let objMsg = JSON.parse(data);
        if (objMsg.msg === 'activados') {
            socket.emit('handlePorts', {
                action: "list",
                portActives
            });
            console.log("port activados")
            // socket.emit('handlePorts',portActives);      
        }

        if (objMsg.msg === 'abrir') {

            portActives.forEach(element => {
                console.log(objMsg.port, "  ", element.name)
                if (objMsg.port === element.name) {
                    listenPort(element, socket);
                }

                socket.emit('handlePorts', {
                    action: "list",
                    portActives
                });
            })
            console.log("port activados")
            // socket.emit('handlePorts',portActives);      
        }

    });

    sails.log("CONNECTION")


});


console.log("BOOSTRAP 1")

module.exports.bootstrap = function (done) {
    console.log("BOOSTRAP 1")

    // // It's very important to trigger this callback method when you are finished
    // // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
    // console.log("BOOSTRAP 2")

    // var config = Configuracion.findOne(1).exec(function(err, datoConfig) {

    //     if (datoConfig != undefined) {
    //         console.log(datoConfig)
    //         servidorURL = datoConfig.servidorUrl
    //         let ports=config.ports;
    //         var portActives=[];
    //         ports.forEach(element => {
    //             portActives.push({name:element,port:new SerialPort(element,{baudRate: 57600})});
    //         });
    //         console.log(portActives);

    //         port_1 = new SerialPort("COM10", {
    //              baudRate: 57600
    //         });
    //         port_2 = new SerialPort(datoConfig.puertoCom_2, {
    //              baudRate: 57600
    //         });

    //         // port_3 = new SerialPort(datoConfig.puertoCom_3, {
    //         //     baudRate: 57600
    //         // });
    //         // port_4 = new SerialPort(datoConfig.puertoCom_4, {
    //         //     baudRate: 57600
    //         // });
    //         // port_5 = new SerialPort(datoConfig.puertoCom_5, {
    //         //     baudRate: 57600
    //         // });
    //         // port_6 = new SerialPort(datoConfig.puertoCom_6, {
    //         //     baudRate: 57600
    //         // });

    //         IO = io.on('connection', function(socket) {


    //             socket.on('openPort',function(){

    //             })
    //             sails.log("CONNECTION")

    //             port_1.on('data', function(data) {
    //                 // var hoy = new Date()
    //                 // baseidentificacion = '';
    //                 // var auxBase = data.toString();

    //                 // auxBase = auxBase.split("$");
    //                 // baseidentificacion = auxBase[0]

    //                 // sails.log("AUXBASE :::", baseidentificacion);

    //                 // console.log('baseindentificacion', baseidentificacion);

    //                 // socket.emit('message', baseidentificacion);
    //                 enviaQR(data, socket)

    //             });
    //             port_1.on('close',function(){
    //                 console.log("port10 closed")
    //             });
    //             port_1.on('disconnect',function(){
    //                 console.log("port10 desconectado")
    //             });
    //             port_1.on('error',function(error){
    //                 console.log("error",error)
    //             })

    //             port_2.on('data', function(data) {

    //                 enviaQR(data, socket)

    //             });
    //             port_1.on('error', function(err) {
    //                 console.log('********************************************************************* Error: ', err.message);
    //               })
    //             port_2.on('error', function(err) {
    //                 console.log('********************************************************************* Error: ', err.message);
    //             })
    //             // port_3.on('data', function(data) {

    //             //     enviaQR(data, socket)

    //             // });
    //             // port_4.on('data', function(data) {

    //             //     enviaQR(data, socket)

    //             // });
    //             // port_5.on('data', function(data) {

    //             //     enviaQR(data, socket)

    //             // });
    //             // port_6.on('data', function(data) {

    //             //     enviaQR(data, socket)

    //             // });

    //         });
    //     }

    done();

    // });

};