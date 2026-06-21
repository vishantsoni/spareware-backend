const  mongoose  = require("mongoose");
const {Schema} = mongoose;

const subSchema=new Schema({
    planName:{
        type:String,
        required:true,
        trim:true        
    },
    duration:{
        type:String,
        required:true,
        trim:true
    },
    perday:{
        type:String,
        required:true
    },
    price:{
        type:String,
        required:true
    },
    features:[
        {
            feature_values:{
                type: String                
            }
        }
    ],    
    createAt:{
        type:Date,
        default:Date.now,
        required:true
    }
    
    
})
// we are createing new collection
const Subscription =new mongoose.model("subscription", subSchema);
module.exports = Subscription;