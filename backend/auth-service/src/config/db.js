import mongoose from "mongoose"

const db= async ()=>{
    try{
        const connectDB= await mongoose.connect(process.env.DATABASE_URL)
        console.log("database connected")
    }
        
    catch(err){
        console.log(err)
        process.exit(1);
    }
};
export default db;