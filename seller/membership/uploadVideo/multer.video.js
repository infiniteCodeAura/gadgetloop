import multer from "multer";

const readFile = multer.memoryStorage()

export const readVideo = multer({storage: readFile,
    limits:{files:3}
})


// Move storage config outside so it can be reused
