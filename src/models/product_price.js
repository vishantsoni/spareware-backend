const  mongoose  = require("mongoose");
const {Schema} = mongoose;

const productShcema=new Schema({
    p_id:{
        type:String,
        required:true        
    },
    atr_id:{ // color, weight,size
        type:String,
        required:true         
    },
    mrp:{
        type:Array,
        required:true
    },
    sale_price:{
        type:Number,
        required:true
    },
    price_type:{
        type:Boolean,
        required:true
    }
    // name, slug
    // 5Kg, 5lug
    // 10Kg, 5lug

    
})
// we are createing new collection
const ProductShcema =new mongoose.model("customer", productShcema);
module.exports = ProductShcema;