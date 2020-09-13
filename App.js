const express = require('express')
const bp = require('body-parser')
const app = express()
const DbCon = require('./config')
const multer = require('multer')
const uuid4 = require('uuid4')
const path = require('path')
const http = require('http')

const server = http.createServer(app)

const UserRoutes = require('./Routes/user')
const ProductRoutes = require('./Routes/product')

const userModel = require('./Models/user')
const productModel = require('./Models/product')
const chatModel = require('./Models/chats')

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


app.use('/user', UserRoutes)
app.use('/product', ProductRoutes)

userModel.hasMany(productModel)
productModel.belongsTo(userModel, {
    onDelete: 'CASCADE'
})

DbCon.sync()
    .then(() => {
        server.listen(1234, () => {
            console.log("Server running...")
        })
    })
    .catch(err => console.log(err))

io.origins('*:*')

io.on('connection', (socket) => {

    socket.on('join_room', data => {
        socket.join(data.room_id)
    })

    socket.on('msg', data => {
        socket.broadcast.to(parseInt(data.receiver_id)).emit('msg_response', data)
    })

    socket.on('update_location', data => {
        socket.broadcast.to(parseInt(data.opposite_id)).emit('new_location', data)
    })

    socket.on("disconnect", () => {
        // If user or admin disconnected
    })
})