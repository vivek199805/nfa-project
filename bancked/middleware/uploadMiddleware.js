import multer from 'multer';

const storage = multer.memoryStorage(); // or use diskStorage for file uploads
const upload = multer({ storage });

export default upload;