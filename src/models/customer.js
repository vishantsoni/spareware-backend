const  mongoose  = require("mongoose");
const {Schema} = mongoose;

const customershcema=new Schema({
    userid:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true,
        trim:true,
        unique:true
    },    
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,        
        trim:true
    },
    
    address:{
        type:String,
        
        trim:true
    },
    cus_image:{
        type:String,        
    },
    com_name:{
        type:String,
        
        trim:true
    },
    gst_no:{
        type:String,
        
        trim:true
    },
    bus_type:{
        type:String,
        
        trim:true
    }    
})
// we are createing new collection
const CustomerShcema =new mongoose.model("customer", customershcema);
module.exports = CustomerShcema;