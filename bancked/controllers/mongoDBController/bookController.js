import BestBookCinema from "../../models/mongodbModels/BestBookCinema.js";
import Book from "../../models/mongodbModels/book.js";

const storeBook = async (req, res) => {
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
          .json({ message: "Records not found", statusCode: 201 });
      }
    }

    let arrayToInsert = {
      client_id: payload.user.id || payload.user._id,
      best_book_cinemas_id: payload.best_book_cinemas_id ?? null,
      book_title_original: payload.book_title_original ?? null,
      book_title_english: payload.book_title_english,
      english_translation_book: payload.english_translation_book ?? null,
      receive_producer_award: payload.receive_producer_award ?? null,
      language_id: JSON.stringify(payload.language_id),
      author_name: payload.author_name,
      page_count: payload.page_count ?? null,
      date_of_publication: payload.date_of_publication,
      book_price: payload.book_price,
    };

    const book = new Book(arrayToInsert);

    if (!book) {
      return res.status(200).json({
        message: "Book not created.!!",
        statusCode: 201,
      });
    }
    const result = await book.save();

    return res.status(200).json({
      message: "Book created successfully.!!",
      statusCode: 200,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch producers",
      message: error.message,
    });
  }
};

const updateBook = async (req, res) => {
  //   const { isValid, errors } = EditorSchema.validateUpdate(req.body);

  //   if (!isValid) {
  //     return responseHelper(res, "validatorerrors", { errors });
  //   }

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
      return res.status(200).json({
        message: "book not found.!!",
        statusCode: 203,
      });
    }

    const bestBookCinema = await BestBookCinema.findOne({
      _id: payload.best_book_cinema_id,
      client_id: payload.user.id,
    });

    if (!bestBookCinema) {
      return res.status(200).json({
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

    if (typeof payload.language_id === "object") {
      updatedData.language_id = JSON.stringify(payload.language_id);
    }

     await Book.findByIdAndUpdate(book._id, updatedData, { new: true });

    return res.status(200).json({
      message: "Book updated successfully!",
      statusCode: 200,
    });
    // if (!bookUpdate) {
    //   return res.status(200).json({
    //     message: "noresult.!!",
    //     statusCode: 203,
    //   });
    // }
    // return res.status(200).json({
    //   message: "Updated successfully.!!",
    //   statusCode: 200,
    // });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const listBook = async (req, res) => {
  //   const { isValid, errors } = EditorSchema.validateList(req.body);
  //   if (!isValid) {
  //     return responseHelper(res, "validatorerrors", { errors });
  //   }

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
        return res.status(200).json({
          message: "Please provide valid details.!!",
          statusCode: 203,
        });
      }

      whereTo = {
        best_book_cinema_id: payload.best_book_cinema_id,
        client_id: payload.user.id || payload.user._id,
      };
    }

    if (Object.keys(whereTo).length === 0) {
      return res.status(200).json({
        message: "No valid identifier provided.",
        statusCode: 201,
      });
    }

    allBook = await Book.find(whereTo);

    if (!allBook) {
      return res.status(200).json({
        message: "No result found.!!",
        statusCode: 203,
      });
    }
    return res.status(200).json({
      message: "Success",
      statusCode: 200,
      data: allBook,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch producers",
      message: error.message,
    });
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
      return res.status(200).json({
        message: "No result found.!!",
        statusCode: 201,
      });
    }
    return res.status(200).json({
      message: "Success",
      statusCode: 200,
      data: book,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
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
      res.status(200).json({
        message: "book not found",
        statusCode: 203,
      });
    }

    // Delete the document
    await Book.deleteOne({ _id: payload.id });
    res.status(200).json({
      message: "book deleted successfully",
      statusCode: 200,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export default {
  storeBook,
  updateBook,
  listBook,
  getBook,
  deleteBook,
};
