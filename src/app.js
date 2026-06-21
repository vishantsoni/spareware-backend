const express = require("express");
const fileupload = require("express-fileupload");
const path = require("path");
const Users = require("./models/users");

var cors = require("cors");

require("../src/db/conn");

const app = express();
const port = process.env.PORT || 3002;
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use(express.static(path.join(__dirname + "/website")));

app.use("/media", express.static("static"));
app.use(express.static(path.join(__dirname, "static")));
app.use(
  fileupload({
    useTempFiles: true,
    tempFileDir: "static/temp",
    limits: { fileSize: 5 * 1024 * 1024 },
  }),
);

// cors() already handles CORS headers; avoid duplicating middleware

app.route("/").get(function (req, res) {
  res.sendFile(path.join(__dirname, "website/index.html"));
});

app.route("/aboutus").get(function (req, res) {
  res.sendFile(path.join(__dirname, "website/aboutus.html"));
});

app.route("/privacypolicy").get(function (req, res) {
  res.sendFile(path.join(__dirname, "website/privacy.html"));
});

//app.route("/*").get(function(req, res){
//res.sendFile(path.join(__dirname, 'website/index.html'))
//})

// avaiable route
app.use("/api/auth", require("./router/Auth"));
app.use("/api/company", require("./router/Company"));
app.use("/api/customer", require("./router/Customer"));
app.use("/api/category", require("./router/Category"));
app.use("/api/staff", require("./router/Staff"));
app.use("/api/dash", require("./router/Dash"));

// app.use("/api/attr", require("./router/Attributes"));

app.use("/api/product", require("./router/Product"));
app.use("/api/catalog", require("./router/Catalog"));
app.use("/api/roles", require("./router/Role"));
app.use("/api/order", require("./router/Orders"));

// AdminRoute
app.use("/api/admin", require("./router/AdminAuth"));
app.use("/api/subscription", require("./router/Subscription"));

// customer routes
app.use("/api/customer/product", require("./router/Customer/Catalog"));

app.use("/api/customer/supplier", require("./router/Customer/GetSupplier"));
app.use("/api/payment/", require("./router/Payment"));
app.use("/notification/", require("./router/Notification/Notify"));
app.use("/api/inventory", require("./router/Inventory"));
app.use("/api/invite", require("./router/invite/Invite"));
// invoice api routes
app.use("/api/invoice/", require("./router/Invoice"));

// sms gateway is here
app.use("/api/sms/", require("./router/Notification/Sms"));

// settings
app.use("/api/settings/", require("./router/Settings/Settings"));

app.post("/mens", async (req, res) => {
  try {
    var response = {};
    console.log(req.body);
    const records = new Users(req.body);
    const insertMens = await records.save();
    response["status"] = "Success";
    response.push(insertMens);
    res.status(201).send(response);
  } catch (e) {
    // var response={};
    // response['status']  = "Failed";
    // if( "keyPattern" in e){
    //     //if( e.keyPattern.phone == 1){}
    //     response['msg']  = "Phone number is should be unique";
    // }
    // response['error']  = e;
    res.status(400).send(e);
  }
});

app.get("/mens", async (req, res) => {
  try {
    const getMens = await Users.find({});
    res.status(200).send(getMens);
  } catch (e) {
    res.status(400).send(e);
  }
});

// app.get("/mens/:id", async (req, res) => {
//   try {
//     const _id = req.params.id;
//     const getMen = await MenRanking.findById({ _id });
//     res.status(201).send(getMen);
//   } catch (e) {
//     res.status(400).send(e);
//   }
// });

app.listen(port, () => {
  console.log(`connection is live at port no, ${port}`);
});
