const mongoose = require("mongoose");
//  const db = 'mongodb+srv://myorderslip:Vishant8474@cluster0.jtnidhy.mongodb.net/?retryWrites=true&w=majority';
const db = "mongodb://localhost:27017/spareware";

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connectiondb successfull");
  })
  .catch((e) => {
    console.log(`no connection ${e}`);
  });
