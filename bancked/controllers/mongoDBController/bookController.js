import BestBookCinema from "../../models/mongodbModels/BestBookCinema.js";
import Book from "../../models/mongodbModels/book.js";
import BookSchemaHelper from "../../helpers/bookSchemaHelper.js";
import { errorResponse, sendJsonResponse, sendValidationError } from "../../helpers/responseHelper.js";

const normalizeLanguageIds = (languageIds) => {
  if (typeof languageIds === "string") {
    return languageIds.split(",").map((item) => item.trim()).filter(Boolean);
  }

  if (Array.isArray(languageIds)) {
    return languageIds.flatMap((item) => {
      if (typeof item === "string") {
        return item.includes(",")
          ? item.split(",").map((value) => value.trim()).filter(Boolean)
          : [item];
      }

      if (item && typeof item === "object" && "value" in item) {
        return [item.value];
      }

      return [];
    });
  }

  return [];
};

const storeBook = async (req, res) => {
  const { isValid, errors } = BookSchemaHelper.validateStore(req.body);
  if (!isValid) {
    return sendValidationError(res, errors);
  }

  try {
    const payload = {
      ...req.body,
      user: req.user,
    };

    if (
      payload.best_book_cinema_id &&
      payload.best_book_cinema_id.trim() !== ""
    ) {
      const bestBookCinema = await BestBookCinema.findOne({
        _id: payload.best_book_cinema_id,
        client_id: payload.user.id || payload.user._id,
      });

      if (!bestBookCinema) {
        return res
          .status(200)
          .json({ message: "Records not found", statusCode: 203 });
      }
    }

    let arrayToInsert = {
      client_id: payload.user.id || payload.user._id,
      best_book_cinemas_id: payload.best_book_cinema_id ?? null,
      book_title_original: payload.book_title_original ?? null,
      book_title_english: payload.book_title_english,
      english_translation_book: payload.english_translation_book ?? null,
      receive_producer_award: payload.receive_producer_award ?? null,
      language_id: normalizeLanguageIds(payload.language_id),
      author_name: payload.author_name,
      page_count: payload.page_count ?? null,
      date_of_publication: payload.date_of_publication,
      book_price: payload.book_price,
    };

    const book = new Book(arrayToInsert);

    if (!book) {
      return sendJsonResponse(res, 200, {
        message: "Book not created.!!",
        statusCode: 203,
      });
    }
    const result = await book.save();

    return sendJsonResponse(res, 200, {
      message: "Book created successfully.!!",
      statusCode: 200,
      data: result,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

const updateBook = async (req, res) => {
  const { isValid, errors } = BookSchemaHelper.validateUpdate(req.body);
  if (!isValid) {
    return sendValidationError(res, errors);
  }

  try {
    const payload = {
      ...req.body,
      user: req.user,
    };

    const book = await Book.findOne({
      _id: payload.id,
      client_id: payload.user.id || payload.user._id,
    });

    if (!book) {
      return sendJsonResponse(res, 200, {
        message: "book not found.!!",
        statusCode: 203,
      });
    }

    const bestBookCinema = await BestBookCinema.findOne({
      _id: payload.best_book_cinema_id,
      client_id: payload.user.id || payload.user._id,
    });

    if (!bestBookCinema) {
      return sendJsonResponse(res, 200, {
        message: "Related BestBookCinema not found!",
        statusCode: 203,
      });
    }

    const updatedData = {
      book_title_original:
        payload.book_title_original ?? book.book_title_original,
      book_title_english: payload.book_title_english ?? book.book_title_english,
      english_translation_book:
        payload.english_translation_book ?? book.english_translation_book,
      author_name: payload.author_name ?? book.author_name,
      page_count: payload.page_count ?? book.page_count,
      date_of_publication:
        payload.date_of_publication ?? book.date_of_publication,
      book_price: payload.book_price ?? book.book_price,
    };

    if (payload.language_id !== undefined) {
      updatedData.language_id = normalizeLanguageIds(payload.language_id);
    }

    await Book.findByIdAndUpdate(book._id, updatedData, { new: true });

    return sendJsonResponse(res, 200, {
      message: "Book updated successfully!",
      statusCode: 200,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

const listBook = async (req, res) => {
  const { isValid, errors } = BookSchemaHelper.validateList(req.body);
  if (!isValid) {
    return sendValidationError(res, errors);
  }

  try {
    const payload = {
      ...req.body,
      user: req.user,
    };

    let allBook;
    let whereTo = {};

    if (payload?.best_book_cinema_id != null) {
      const checkBestBook = await BestBookCinema.findOne({
        _id: payload.best_book_cinema_id,
        client_id: payload.user.id || payload.user._id,
      });

      if (!checkBestBook) {
        return sendJsonResponse(res, 200, {
          message: "Please provide valid details.!!",
          statusCode: 203,
        });
      }

      whereTo = {
        best_book_cinemas_id: payload.best_book_cinema_id,
        client_id: payload.user.id || payload.user._id,
      };
    }

    if (Object.keys(whereTo).length === 0) {
      return sendJsonResponse(res, 200, {
        message: "No valid identifier provided.",
        statusCode: 203,
      });
    }

    allBook = await Book.find(whereTo);

    if (!allBook || allBook.length === 0) {
      return sendJsonResponse(res, 200, {
        message: "No result found.!!",
        statusCode: 203,
      });
    }
    return sendJsonResponse(res, 200, {
      message: "Success",
      statusCode: 200,
      data: allBook,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

const getBook = async (req, res) => {
  try {
    const payload = {
      ...req.params,
      user: req.user,
    };
    const book = await Book.findOne({
      _id: payload.id,
      client_id: payload.user.id || payload.user._id,
    });
    if (!book) {
      return sendJsonResponse(res, 200, {
        message: "No result found.!!",
        statusCode: 203,
      });
    }
    return sendJsonResponse(res, 200, {
      message: "Success",
      statusCode: 200,
      data: book,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

const deleteBook = async (req, res) => {
  try {
    const payload = {
      ...req.params,
      user: req.user,
    };
    const book = await Book.findOne({
      _id: payload.id,
      client_id: payload.user.id || payload.user._id,
    });

    if (!book) {
      return sendJsonResponse(res, 200, {
        message: "book not found",
        statusCode: 203,
      });
    }

    // Delete the document
    await Book.deleteOne({ _id: payload.id });
    return sendJsonResponse(res, 200, {
      message: "book deleted successfully",
      statusCode: 200,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

export default {
  storeBook,
  updateBook,
  listBook,
  getBook,
  deleteBook,
};
