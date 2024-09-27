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
	return cj.getStateSession(context, CALLBACK_STATE)
}

func (cj *CookieJar) GetNonceSession(context *gin.Context) (value string, isNew bool) {
	return cj.getStateSession(context, CALLBACK_NONCE)
}

func (cj *CookieJar) SetUserToken(context *gin.Context, token string) error {
	session := sessions.NewSession(cj.store, USER_TOKEN)
	session.Values["token"] = token
	session.Options.MaxAge = 60 * 60 * 8
	session.Options.Path = "/"
	session.Options.Secure = context.Request.TLS != nil

	if err := cj.store.Save(context.Request, context.Writer, session); err != nil {
		return err
	}
	return nil
}

func (cj *CookieJar) DeleteStateSession(context *gin.Context) error {
	return cj.deleteSession(context, CALLBACK_STATE)
}

func (cj *CookieJar) DeleteNonceSession(context *gin.Context) error {
	return cj.deleteSession(context, CALLBACK_NONCE)
}

func (cj *CookieJar) setCallBackSession(context *gin.Context, name string, stateValue string) error {
	session := sessions.NewSession(cj.store, name)
	session.Values["state"] = stateValue
	session.Options.MaxAge = 60 * 5
	session.Options.Path = "/"
	session.Options.Secure = context.Request.TLS != nil

	if err := cj.store.Save(context.Request, context.Writer, session); err != nil {
		return err
	}
	return nil
}

func (cj *CookieJar) getStateSession(context *gin.Context, stateValue string) (value string, isNew bool) {
	session, _ := cj.store.Get(context.Request, stateValue)

	if session.IsNew {
		return "", true
	}

	state, ok := session.Values["state"].(string)
	if ok {
		return state, false
	}

	return "", true
}

func (cj *CookieJar) deleteSession(gc *gin.Context, name string) error {
	session, err := cj.store.Get(gc.Request, name)
	if err != nil {
		return err
	}
	session.Options.MaxAge = -1
	err = cj.store.Save(gc.Request, gc.Writer, session)
	if err != nil {
		return err
	}
	return nil
}
