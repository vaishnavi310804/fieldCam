import express from "express"
import db from "./src/config/db.js"
import cors from 'cors'
import errorHandler from "./src/middleware/error.middleware.js";

const app=express();

await db();

app.use(cors())
app.use(express.json());

app.use(errorHandler);

app.get("/",(req,res)=>{
   res.send("API running")
  }); 

const PORT = process.env.PORT || 5001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
