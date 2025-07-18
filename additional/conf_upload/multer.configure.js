import multer from "multer"
import express from "express"

const upload = multer.memoryStorage()

export const file = multer({
    storage: upload,
        // limits:{files:5}

})

// export const file = (req,res,next)=>{
//     const files = multer({
//         storage: upload,
//         // limits:{files: 5}
//     })
//     return files
// }
