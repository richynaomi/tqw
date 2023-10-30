const mongoose = require("mongoose");

mongoose
    .connect('mongodb+srv://richynaomi30:Required1234@cluster0.uewqabx.mongodb.net/onlinebanking', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log(`Connected to DB`))
    .catch((err) => console.error(err));