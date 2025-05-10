import express from "express";

const app = express()

app.use(express.json());


app.use((err,req,res,next)=>{
    err = err? err.toString():"Something went wrong."
    return res.status(400).json({message: err})
})




const port = process.env.port || 8888;
app.listen(port ,()=>{
    console.log(`server is running on port : ${port}`);
})


