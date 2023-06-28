class Api {
  constructor(url, headers) {
    this.url = url;
    this.headers = headers;
  }

  _handleResponse(res) {
    if (res.ok) {
      return res.json();
    } else {
      return Promise.reject(`Ошибка: ${res.status}`);
    }
  }

//----------Карточки----------------

//Базовые карточки 
  getInitialCards() {
    return fetch(`${this.url}cards`, {
      metod: "GET",
      headers: this.headers,
    })
    .then((res) => this._handleResponse(res))
  }

//Добавить новую карточка
  postNewCard(data) {
    return fetch(`${this.url}cards`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        name: data.name,
        link: data.link,
      }),
    }).then((res) => this._handleResponse(res))
  }

//Удалить карточку
deleteCard(cardId) {
    return fetch(`${this.url}cards/${cardId} `, {
      method: "DELETE",
      headers: this.headers
    })
    .then((res) => this._handleResponse(res))
  }

//--------Данные пользователя------------------

//Актуальные данные о пользователе
  getInitialUserInfo() {
    return fetch(`${this.url}users/me`, {
      metod: "GET",
      headers: this.headers,
    }).then((res) => this._handleResponse(res))
  }

//Изменить даные о пользователе
  changeValuesUserInfo(data) {
    return fetch(`${this.url}users/me`, {
      method: "PATCH",
      headers: this.headers,
      body: JSON.stringify({ 
        name: data.name, 
        about: data.about 
      }),
    })
    .then((res) => this._handleResponse(res))
  }


//---------Аватарка-------------------

//Изменить аватар
  changeAvatar(data) {
    return fetch(`${this.url}users/me/avatar`, {
      method: "PATCH",
      headers: this.headers,
      body: JSON.stringify(
        { avatar: data.avatar }
        ),
      })
    .then((res) => this._handleResponse(res))
  }


//------------Лайки------------------

changeLikeCardStatus(cardId, isLiked) {
  return fetch(`${this.url}cards/${cardId}/likes`, {
    method: `${!isLiked ? 'DELETE' : 'PUT'}`,
    headers: this.headers,
  })
    .then((res) => this._handleResponse(res))
}

}

const api = new Api("https://mesto.nomoreparties.co/v1/cohort-65/", {
  authorization: "96facf9d-e199-4449-9f73-b185bc2a61b7",
  "Content-Type": "application/json",
});

export default api;
