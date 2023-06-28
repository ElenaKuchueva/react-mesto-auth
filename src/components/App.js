import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import css from "../index.css";

import Header from "./Header.js";
import Login from "./Login.js";
import Register from "./Register.js";
import Main from "./Main.js";
import EditProfilePopup from "./EditProfilePopup.js";
import EditAvatarPopup from "./EditAvatarPopup.js";
import AddPlacePopup from "./AddPlacePopup.js";
import ImagePopup from "./ImagePopup.js";
import { CurrentUserContext } from "../contexts/CurrentUserContext.js";
import ProtectedRoute from "./ProtectedRoute.js";
import api from "./../utils/api.js";
import * as mestoAuth from "../utils/mestoAuth";

function App() {
  const [isEditProfilePopupOpen, setEditProfilePopupOpen] =
    React.useState(false);
  const [isAddPlacePopupOpen, setAddPlacePopupOpen] = React.useState(false);
  const [isEditAvatarPopupOpen, setEditAvatarPopupOpen] = React.useState(false);
  const [selectedCard, setSelectedCard] = React.useState({});
  const [currentUser, setCurrentUser] = React.useState({});
  const [cards, setCards] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [userEmail, setUserEmail] = React.useState("");
  const navigate = useNavigate();

  React.useEffect(() => {
    Promise.all([api.getInitialCards(), api.getInitialUserInfo()])
      .then(([cardData, userInfoData]) => {
        setCurrentUser(userInfoData);
        setCards(
          cardData.map((data) => ({
            likes: data.likes,
            name: data.name,
            link: data.link,
            _id: data._id,
            owner: data.owner,
          }))
        );
      })
      .catch((err) => console.log(err));
  }, []);

  const checkJwt = () => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      mestoAuth
        .getJwt(jwt)
        .then((res) => {
          if (res) {
            setIsLoggedIn(true);
            navigate("/", { replace: true });
            setUserEmail(res.data.email);
          }
          return;
        })
        .catch((err) => {
          console.log(err);
          setIsLoggedIn(false);
        });
    }
  };

  React.useEffect(() => {
    checkJwt();
  }, []);

  function closeAllPopups() {
    setEditProfilePopupOpen(false);
    setAddPlacePopupOpen(false);
    setEditAvatarPopupOpen(false);
    setSelectedCard({});
  }

  function handleLikeClick(card) {
    const isLiked = card.likes.some((i) => i._id === currentUser._id);
    api
      .changeLikeCardStatus(card._id, !isLiked)
      .then((newCard) => {
        setCards((state) =>
          state.map((c) => (c._id === card._id ? newCard : c))
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function handleCardDelete(card) {
    if (card.owner._id === currentUser._id) {
      api
        .deleteCard(card._id)
        .then(setCards((cards) => cards.filter((c) => c._id !== card._id)))
        .catch((err) => {
          console.log(err);
        });
    }
  }

  function handleInitialUserInfo(userInfo) {
    setIsLoading(true);
    api
      .changeValuesUserInfo(userInfo)
      .then((userInfo) => {
        setCurrentUser(userInfo);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }

  function handleUpdateAvatar(infoAboutAvatar) {
    setIsLoading(true);
    api
      .changeAvatar(infoAboutAvatar)
      .then((infoAboutAvatar) => {
        setCurrentUser(infoAboutAvatar);
        closeAllPopups();
      })
      .catch((error) => {
        console.log(`Ошибка: ${error}`);
      })
      .finally(() => setIsLoading(false));
  }

  function handleAddPlaceSubmit(cardData) {
    setIsLoading(true);
    api
      .postNewCard(cardData)
      .then((newCard) => {
        setCards([newCard, ...cards]);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page">
        <Header userEmail={userEmail} />

        <Routes>
          <Route path="/signup" element={<Register />} />

          <Route
            path="/signin"
            element={
              <Login
                OnLogin={() => {
                  setIsLoggedIn(true);
                }}
                userEmail={setUserEmail}
              />
            }
          />

          <Route
            path="/"
            element={
              <ProtectedRoute
                element={Main}
                cards={cards}
                onEditProfile={setEditProfilePopupOpen}
                onAddPlace={setAddPlacePopupOpen}
                onEditAvatar={setEditAvatarPopupOpen}
                onCardClick={setSelectedCard}
                onLikeClick={handleLikeClick}
                onDeleteClick={handleCardDelete}
                loggedIn={isLoggedIn}
              />
            }
          />
        </Routes>

        {/* Поп ап: изменить аватар */}
        <EditAvatarPopup
          isOpen={isEditAvatarPopupOpen}
          onClose={closeAllPopups}
          onUpdateAvatar={handleUpdateAvatar}
          onLoading={isLoading}
        />

        {/* //Поп ап: изменить профиль */}
        <EditProfilePopup
          isOpen={isEditProfilePopupOpen}
          onClose={closeAllPopups}
          onChangeUserInfo={handleInitialUserInfo}
          onLoading={isLoading}
        />

        {/* Поп ап: добавить новую карточку */}
        <AddPlacePopup
          isOpen={isAddPlacePopupOpen}
          onClose={closeAllPopups}
          onAddPlace={handleAddPlaceSubmit}
          onLoading={isLoading}
        />

        {/* Поп ап: открыть картинку поверх остальных карточек */}
        <ImagePopup card={selectedCard} onClose={closeAllPopups} />
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;
