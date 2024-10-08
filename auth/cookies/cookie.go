package cookies

import (
	"github.com/gin-gonic/gin"
	"github.com/gorilla/sessions"
)

const (
	CALLBACK_STATE = "soarca_gui_state"
	CALLBACK_NONCE = "soarca_gui_nonce"
	USER_TOKEN     = "soarca_token"
)

type ICookieJar interface {
	SetCallBackNonce(context *gin.Context, stateValue string) error
	SetCallBackState(context *gin.Context, stateValue string) error
	GetStateSession(context *gin.Context) (value string, isNew bool)
	GetNonceSession(context *gin.Context) (value string, isNew bool)
	GetUserToken(context *gin.Context) (value string, isNew bool)
	SetUserToken(context *gin.Context, token string) error
	DeleteStateSession(context *gin.Context) error
	DeleteNonceSession(context *gin.Context) error
}

type CookieJar struct {
	store sessions.Store
}

func NewCookieJar(secret []byte, encryptionKey []byte) *CookieJar {
	return &CookieJar{store: sessions.NewCookieStore(secret, encryptionKey)}
}

func (cj *CookieJar) SetCallBackState(context *gin.Context, stateValue string) error {
	return cj.setCallBackSession(context, CALLBACK_STATE, stateValue)
}

func (cj *CookieJar) SetCallBackNonce(context *gin.Context, stateValue string) error {
	return cj.setCallBackSession(context, CALLBACK_NONCE, stateValue)
}

func (cj *CookieJar) GetStateSession(context *gin.Context) (value string, isNew bool) {
	return cj.getSession(context, CALLBACK_STATE)
}

func (cj *CookieJar) GetNonceSession(context *gin.Context) (value string, isNew bool) {
	return cj.getSession(context, CALLBACK_NONCE)
}

func (cj *CookieJar) GetUserToken(context *gin.Context) (value string, isNew bool) {
	return cj.getSession(context, USER_TOKEN)
}

func (cj *CookieJar) SetUserToken(context *gin.Context, token string) error {
	session, _ := cj.store.Get(context.Request, USER_TOKEN)
	session.Values["token"] = token
	session.Options.MaxAge = 60 * 60 * 8
	session.Options.Path = "/"
	session.Options.Secure = context.Request.TLS != nil
	return session.Save(context.Request, context.Writer)
}

func (cj *CookieJar) DeleteStateSession(context *gin.Context) error {
	return cj.deleteSession(context, CALLBACK_STATE)
}

func (cj *CookieJar) DeleteNonceSession(context *gin.Context) error {
	return cj.deleteSession(context, CALLBACK_NONCE)
}

func (cj *CookieJar) setCallBackSession(context *gin.Context, name string, stateValue string) error {
	session, _ := cj.store.Get(context.Request, name)
	session.Values["state"] = stateValue
	session.Options.MaxAge = 60 * 5
	session.Options.Path = "/"
	session.Options.Secure = context.Request.TLS != nil
	return session.Save(context.Request, context.Writer)
}

func (cj *CookieJar) getSession(context *gin.Context, name string) (value string, isNew bool) {
	session, _ := cj.store.Get(context.Request, name)
	if session.IsNew {
		return "", true
	}
	value, ok := session.Values["state"].(string)
	if !ok {
		value, ok = session.Values["token"].(string)
		if !ok {
			return "", true
		}
	}
	return value, false
}

func (cj *CookieJar) deleteSession(gc *gin.Context, name string) error {
	session, _ := cj.store.Get(gc.Request, name)
	session.Options.MaxAge = -1
	return session.Save(gc.Request, gc.Writer)
}
