const  mongoose  = require("mongoose");
const {Schema} = mongoose;

const staffSchema=new Schema({
    userid:{
        type:String,
        required:true        
    },
    com_id:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true         
    },
    phone:{
        type:Number,
        required:true,
        default:null
    },
    email:{
        type:String,
        default:""
    },
    staff_id:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role_id:{
        type:String,   // administration, employee(Manager), sales man, dispatcher, stock manager,
        required:true
    },    
    ip:{
        type:String,
        default:null
    },
    device:{
        type:String,
        default:null
    },
    last_login:{
        type:String,
        default:null
    },
    created_at:{
        type:Date,
        default:Date.now        
    }


    
})
// we are createing new collection
const StaffSchema =new mongoose.model("staff", staffSchema);
module.exports = StaffSchema;