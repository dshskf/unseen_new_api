const express = require('express')
const bp = require('body-parser')
const app = express()
const DbCon = require('./config/sequelize')
const multer = require('multer')
const uuid4 = require('uuid4')
const path = require('path')
const http = require('http')

const fillDB = require('./generate-data')

const userRoutes = require('./Routes/user')
const agencyRoutes = require('./Routes/agency')
const guidesRoutes = require('./Routes/guides')
const authenticationRoutes = require('./Routes/authentication')
const toursRoutes = require('./Routes/tours')
const managementRoutes = require('./Routes/management')
const featuresRoutes = require('./Routes/features')

const userModel = require('./Models/user')
const agencyModel = require('./Models/agency')
const guidesModel = require('./Models/guides')
const toursAgency = require('./Models/tours-agency')
const toursGuides = require('./Models/tours-guides')
const requestModel = require('./Models/request')
const commentModel = require('./Models/comment')
const boookingModel = require('./Models/booking')
const chatModel = require('./Models/chats')
const destinationModel = require('./Models/destination')
const lastChatModel= require('./Models/chats_last')


// Start Code

const server = http.createServer(app)

const io = require('socket.io')(server, {
    handlePreflightRequest: (req, res) => {
        const headers = {
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
            "Access-Control-Allow-Credentials": true
        };
        res.writeHead(200, headers);
        res.end();
    }
})


const filestorage = multer.diskStorage({
    destination: (req, file, cb) => {        
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, uuid4() + '.' + file.mimetype.split('/')[1])
    }
})

const filefilter = (req, file, cb) => {    
    const ext = file.mimetype.split('/')[1]
    if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

app.use(bp.json({ limit: '10mb' }));
app.use(bp.urlencoded({ limit: '10mb', extended: true }));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(multer({ storage: filestorage, fileFilter: filefilter }).any())

app.use((req, res, next) => { //To allow cors(different domain)
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Methods', "GET, POST, PUT, PATCH, DELETE");
    res.setHeader('Access-Control-Allow-Headers', "Content-Type,Authorization");
    next()
})


app.use('/user', userRoutes)
app.use('/guides', guidesRoutes)
app.use('/agency', agencyRoutes)
app.use('/auth', authenticationRoutes)
app.use('/tours', toursRoutes)
app.use('/management', managementRoutes)
app.use('/features', featuresRoutes)
app.use('/fill', fillDB)

// DATABASE RELATIONS

guidesModel.hasMany(toursGuides)
toursGuides.belongsTo(guidesModel, {
    onDelete: 'CASCADE'
})

agencyModel.hasMany(toursAgency)
toursAgency.belongsTo(agencyModel, {
    onDelete: 'CASCADE'
})


DbCon.sync()
    .then(() => {
        server.listen(1234, () => {
            console.log("Server running...")
        })
    })
    .catch(err => console.log(err))


// ANCHOR IO Connections
io.origins('*:*')

io.on('connection', (socket) => {
    socket.on('join_room', data => {
        socket.join(data.room_id)
    })

    socket.on('msg', data => {
        let receiver = data.receiver_id + "-" + data.receiver_type
        socket.broadcast.to(receiver).emit('msg_response', data)
    })

    socket.on('update_location', data => {                
        socket.broadcast.to(data.opposite_id).emit('new_location', data)
    })

    socket.on('update_booking', data => {        
        socket.broadcast.to(data.opposite_room).emit('new_booking', data)
    })

    socket.on('update_request', data => {        
        socket.broadcast.to(data.opposite_room).emit('new_request', data)
    })


    socket.on("disconnect", () => {
        // If user or admin disconnected
    })
})