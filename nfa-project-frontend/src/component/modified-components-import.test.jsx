import { describe, expect, it } from "vitest";

import BestBookPage from "../pages/best-book";
import BestFilmCriticPage from "../pages/best-filmCritic";
import FeatureFilmPage from "../pages/feature-film";
import NonFeatureFilmPage from "../pages/non-feature-film";

import AuthorSection from "./best-book-component/author-component";
import BestBookCinemaSection from "./best-book-component/book-cinema-component";
import BookDeclarationSection from "./best-book-component/declaration-component";
import PreviewPaymentSection from "./best-book-component/preview-payment";
import PublisherBookSection from "./best-book-component/punlisher-book-component";

import BestFilmSection from "./best-filmCritic-component/best-film-critic-component";
import CriticSection from "./best-filmCritic-component/critic-component";
import FilmCriticDeclarationSection from "./best-filmCritic-component/declaration-component";
import PublisherNewspaperSection from "./best-filmCritic-component/publisher-component";
import FilmCriticViewSection from "./best-filmCritic-component/view-component";

import FeatureDeclarationSection from "./feature-component/Declaration-component";
import FilmSubmissionView from "./feature-component/FilmSubmissionView";
import PaymentSection from "./feature-component/PaymentSection-component";
import ActorSection from "./feature-component/actor-component";
import AudiographerSection from "./feature-component/audiographer";
import CensorSection from "./feature-component/censor-component";
import CompanyRegistrationSection from "./feature-component/company-component";
import DirectorDetailsSection from "./feature-component/director-component";
import FilmDetailsSection from "./feature-component/film-details-component";
import ProducerDetailsSection from "./feature-component/producer-component";
import ReturnSection from "./feature-component/return-component";
import ScreenPlaySection from "./feature-component/screenplay-component";
import SongsFormSection from "./feature-component/songs-component";

import OtherSection from "./non-feature-component/other-component";
import NonFeatureViewSection from "./non-feature-component/view-section";

const modifiedComponentModules = [
  ["BestBookPage", BestBookPage],
  ["BestFilmCriticPage", BestFilmCriticPage],
  ["FeatureFilmPage", FeatureFilmPage],
  ["NonFeatureFilmPage", NonFeatureFilmPage],
  ["AuthorSection", AuthorSection],
  ["BestBookCinemaSection", BestBookCinemaSection],
  ["BookDeclarationSection", BookDeclarationSection],
  ["PreviewPaymentSection", PreviewPaymentSection],
  ["PublisherBookSection", PublisherBookSection],
  ["BestFilmSection", BestFilmSection],
  ["CriticSection", CriticSection],
  ["FilmCriticDeclarationSection", FilmCriticDeclarationSection],
  ["PublisherNewspaperSection", PublisherNewspaperSection],
  ["FilmCriticViewSection", FilmCriticViewSection],
  ["FeatureDeclarationSection", FeatureDeclarationSection],
  ["FilmSubmissionView", FilmSubmissionView],
  ["PaymentSection", PaymentSection],
  ["ActorSection", ActorSection],
  ["AudiographerSection", AudiographerSection],
  ["CensorSection", CensorSection],
  ["CompanyRegistrationSection", CompanyRegistrationSection],
  ["DirectorDetailsSection", DirectorDetailsSection],
  ["FilmDetailsSection", FilmDetailsSection],
  ["ProducerDetailsSection", ProducerDetailsSection],
  ["ReturnSection", ReturnSection],
  ["ScreenPlaySection", ScreenPlaySection],
  ["SongsFormSection", SongsFormSection],
  ["OtherSection", OtherSection],
  ["NonFeatureViewSection", NonFeatureViewSection],
];

describe("modified frontend component modules", () => {
  it.each(modifiedComponentModules)("%s exports a React component", (_name, Component) => {
    expect(typeof Component).toBe("function");
  });
});
