import express from "express";
import cors from "cors"

const app = express()

app.use(express.json());

app.use(cors())

app.use((err,req,res,next)=>{
    console.log(err);
})


const port = process.env.port || 8888;
app.listen(port ,()=>{
    console.log(`server is running on port : ${port}`);
})


