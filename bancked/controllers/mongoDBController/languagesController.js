import { fetchLanguages } from "../../services/languages.js";

const getAllLang = async (req, res, next) => {
  try {
   const langData = await fetchLanguages()
    res.status(200).json({ message: 'User registered successfully', data: langData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default getAllLang;