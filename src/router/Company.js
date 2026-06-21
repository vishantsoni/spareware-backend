const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchusertoken");

const { body, validationResult } = require("express-validator");
const { route } = require("./Auth");
const Company = require("../models/company");
const path = require("path");


router.get("/getCompanyList", fetchuser, async (req, res) => {
  try {
    const company = await Company.find({ userid: req.user.id });
    if (company.length === 0) {
      return res.json({
        status: "success",
        msg: "no data found",
        data: company,
      });
    }
    res.json({
      status: "success",
      data: company,
    });
  } catch (e) {
    res.status(204).json({
      status: "Failed",
      msg: "Something Went Wrong",
      err: e.message,
    });
  }
});

// create company endpointLogin required

router.post(
  "/createCompany",
  fetchuser,
  [
    body("com_name", "Enter a Company Name").isLength({ min: 3 }),
    body("bus_type", "Enter a business type").isLength({ min: 3 }),
    body("address", "Enter a Address").isLength({ min: 3 }),
    body("zipcode", "Enter a Valid Zipcode").isLength({ min: 6 }),
    body("state", "Enter a State Value").isLength({ min: 2 }),
  ],

  async (req, res) => {
	console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(205).json({
        status: "Failed",
        msg: "Please input all field",
        errors: errors.array(),
      });
    }

    const {
      com_name,
      bus_type,
      indus_type,
      gst_no,
      email,
      phone,
      address,
      state,
      zipcode,
      country,
      com_image,
    } = req.body;
    try {
      // check weather use exist already

      let user = await Company.findOne({ com_name: req.body.com_name });
      if (user) {
        return res
          .status(206)
          .json({ status: "Failed", msg: "Company already exists" });
      }

      userid = req.user.id;
      const com = new Company({
        userid,
        com_name,
        bus_type,
        indus_type,
        gst_no,
        email,
        com_phone:phone,
        address,
        state,
        zipcode,
        country,
        com_image,
      });


//const element = req.files.file;
//      let filename = "com_"+Date.now() + "_" + element.name;
//     let newpath = path.join(process.cwd(), "static/image", filename);
//      const imagePath =
//        req.protocol + "://" + req.get("host") + "/media/image/" + filename;
//      com.com_image = imagePath;
//      element.mv(newpath); 




      const saveCom = await com.save();
      res.status(201).json({
        status: "Success",
        msg: "Your Company has been created",
        data: saveCom,
      });

      //res.status(201).json({authtoken });
    } catch (error) {
      res.status(202).json({status:"Failed", msg:"Some internal error", err:error});
    }
  }
);

//if user want to update company data

router.put("/udpateCompany/:id", fetchuser, async (req, res) => {
  //const errors = validationResult(req);
try{
  const {
    com_name,
    bus_type,
    indus_type,
    gst_no,
    email,
    com_phone,
    address,
    state,
    zipcode,
    country,
    com_image,
  } = req.body;

  // create new object
  const newCompany = {};
  if (com_name) {
    newCompany.com_name = com_name;
  }
  if (email) {
    newCompany.email = email;
  }
  if (com_phone) {
    newCompany.com_phone = com_phone;
  }
  if (address) {
    newCompany.address = address;
  }
  if (state) {
    newCompany.state = state;
  }
  if (zipcode) {
    newCompany.zipcode = zipcode;
  }
  if (country) {
    newCompany.country = country;
  }
	if(indus_type){
		newCompany.indus_type = indus_type;
	}
if(gst_no){
	newCompany.gst_no = gst_no;
}


  let com = await Company.findById(req.params.id);

  if (!com) {
    return res.status(205).json({status:"Failed", errors: "not found" });
  }

  console.log(com.userid.toString());
  if (com.userid.toString() !== req.user.id) {
    return res.status(208).json({ status: "Failed", errors: "Not Allowed" });
  }

  com = await Company.findByIdAndUpdate(
    req.params.id,
    { $set: newCompany },
    { new: true }
  );
  res.status(200).json({status:"Success", msg:"Company updated", data:com});
}catch(err){
	res.status(209).json({status:"Failed", msg:"Server internal error", err});
}
});

// if user want to delete company

router.delete("/deleteCompany/:id", fetchuser, async (req, res) => {
  try {
    let com = await Company.findById(req.params.id);
    if (!com) {
      return res.status(404).json({ status: "Failed", errors: "not found" });
    }

    if (com.userid.toString() !== req.user.id) {
      return res.status(401).json({ status: "Failed", errors: "Not Allowed" });
    }

    com = await Company.findByIdAndDelete(req.params.id);
    res.json({ status: "Success", msg: "deteled" });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Some internal error");
  }
});

router.get("/getCompanyById/:id",  async (req, res) => {
  try {
    let com = await Company.findOne({ userid:req.params.id });

    if (!com) {
      return res.status(201).json({ status: "Failed", errors: "not found" });
    }

    res.status(200).json({ status: "Success", msg: "Found", data: com });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Some internal error");
  }
});


//update company image

router.post("/uploa_image/:id", fetchuser, async (req, res) => {  
  try {
    console.log(req.files.file);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(201).json({ status: "Failed", errors: errors.array() });
    }

    let com = await Company.findById(req.params.id);

    if (!com) {
      return res
        .status(204)
        .json({ status: "Failed", msg: "com not found" });
    }


      const element = req.files.file;
      let filename = "com_"+Date.now() + "_" + element.name;
      let newpath = path.join(process.cwd(), "static/image", filename);
      const imagePath =
        req.protocol + "://" + req.get("host") + "/media/image/" + filename;
      com.com_image = imagePath;
      element.mv(newpath);


    let updateProduct = await Company.findByIdAndUpdate(
      req.params.id,
      { $set: com },
      { new: true }
    );

    return res.status(200).json({
        status: "Sucess",
        msg: "Updated",
        data: updateProduct,
      });

  } catch (e) {
    console.log(req.files);
    console.log(e.message);
    if (req.files === null) {
      res.status(205).json({ status: "Failed", msg: "Invalid Image", error: e.message });
      return;
    } else {
      res.status(205).json({ status: "Failed", msg: "Server Error", error: e.message });
      return;
    }
  }
});



module.exports = router;
