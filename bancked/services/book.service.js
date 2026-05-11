import BestBookCinema from "../models/mongodbModels/BestBookCinema.js";
import Book from "../models/mongodbModels/book.js";

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

      if (item && typeof item === "object" && "value" in item) return [item.value];
      return [];
    });
  }

  return [];
};

export const storeBookService = async ({ payload, userId }) => {
  if (payload.best_book_cinema_id && payload.best_book_cinema_id.trim() !== "") {
    const bestBookCinema = await BestBookCinema.findOne({
      _id: payload.best_book_cinema_id,
      client_id: userId,
    });

    if (!bestBookCinema) {
      return { message: "Records not found", statusCode: 203 };
    }
  }

  const book = new Book({
    client_id: userId,
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
  });

  if (!book) {
    return { message: "Book not created.!!", statusCode: 203 };
  }

  const result = await book.save();
  return {
    message: "Book created successfully.!!",
    statusCode: 200,
    data: result,
  };
};

export const updateBookService = async ({ payload, userId }) => {
  const book = await Book.findOne({ _id: payload.id, client_id: userId });
  if (!book) return { message: "book not found.!!", statusCode: 203 };

  const bestBookCinema = await BestBookCinema.findOne({
    _id: payload.best_book_cinema_id,
    client_id: userId,
  });

  if (!bestBookCinema) {
    return { message: "Related BestBookCinema not found!", statusCode: 203 };
  }

  const updatedData = {
    book_title_original: payload.book_title_original ?? book.book_title_original,
    book_title_english: payload.book_title_english ?? book.book_title_english,
    english_translation_book: payload.english_translation_book ?? book.english_translation_book,
    author_name: payload.author_name ?? book.author_name,
    page_count: payload.page_count ?? book.page_count,
    date_of_publication: payload.date_of_publication ?? book.date_of_publication,
    book_price: payload.book_price ?? book.book_price,
  };

  if (payload.language_id !== undefined) {
    updatedData.language_id = normalizeLanguageIds(payload.language_id);
  }

  await Book.findByIdAndUpdate(book._id, updatedData, { new: true });
  return { message: "Book updated successfully!", statusCode: 200 };
};

export const listBookService = async ({ payload, userId }) => {
  let whereTo = {};

  if (payload?.best_book_cinema_id != null) {
    const checkBestBook = await BestBookCinema.findOne({
      _id: payload.best_book_cinema_id,
      client_id: userId,
    });

    if (!checkBestBook) {
      return { message: "Please provide valid details.!!", statusCode: 203 };
    }

    whereTo = {
      best_book_cinemas_id: payload.best_book_cinema_id,
      client_id: userId,
    };
  }

  if (Object.keys(whereTo).length === 0) {
    return { message: "No valid identifier provided.", statusCode: 203 };
  }

  const allBook = await Book.find(whereTo);
  if (!allBook || allBook.length === 0) {
    return { message: "No result found.!!", statusCode: 203 };
  }

  return { message: "Success", statusCode: 200, data: allBook };
};

export const getBookService = async ({ id, userId }) => {
  const book = await Book.findOne({ _id: id, client_id: userId });
  if (!book) return { message: "No result found.!!", statusCode: 203 };

  return { message: "Success", statusCode: 200, data: book };
};

export const deleteBookService = async ({ id, userId }) => {
  const book = await Book.findOne({ _id: id, client_id: userId });
  if (!book) return { message: "book not found", statusCode: 203 };

  await Book.deleteOne({ _id: id });
  return { message: "book deleted successfully", statusCode: 200 };
};
