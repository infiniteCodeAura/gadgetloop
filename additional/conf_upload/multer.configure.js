import multer from "multer"

const upload = multer.memoryStorage()

export const file = multer({
    storage: upload,
})