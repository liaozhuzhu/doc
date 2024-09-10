const Document = require('./Document');
require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;
mongoose.connect(uri, {}).then(() => console.log("Connected to MongoDB")).catch(err => console.log(err));

const io = require('socket.io')(3001, {
	cors: {
		origin: 'http://localhost:5173',
		methods: ['GET', 'POST']
	},
})

io.on("connection", socket => {
	socket.on('get-id', async document => {
		const doc = await getDocument(document.id);
		socket.join(document.id);
		socket.emit('load-document', doc.data);
		socket.on("send-changes", delta => {
			socket.broadcast.to(document.id).emit("receive-changes", delta);
		})

		socket.on("save-document", async data => {
			await Document.findByIdAndUpdate(document.id, { data });
		})
	})
	console.log("connected")
})

async function getDocument(id) {
	if (id == null) return;
	const doc = await Document.findById(id);
	if (doc) return doc
	return await Document.create({ _id: id, data: "" });
}