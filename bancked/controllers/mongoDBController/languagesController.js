import { fetchLanguages } from "../../services/languages.js";

const getAllLang = async (req, res, next) => {
  try {
   const langData = await fetchLanguages()
    res.status(200).json({ message: 'Fetch successfully', data: langData, statusCode: 200 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default getAllLang;