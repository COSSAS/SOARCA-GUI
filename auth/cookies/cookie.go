package cookies

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/sessions"
)

type ICookieJar interface {
	SetCallBackState(context *gin.Context, name string, stateValue string)
	StateSession(contex *gin.Context, name string) (value string, isNew bool)
	DeleteSession(context *gin.Context, name string) error
}
type CookieJar struct {
	store sessions.Store
}

func NewCookieJar(secret []byte, encryptionKey []byte) *CookieJar {
	return &CookieJar{store: sessions.NewCookieStore(secret, encryptionKey)}
}

func (cj *CookieJar) SetCallBackState(context *gin.Context, name string, stateValue string) {
	session := sessions.NewSession(cj.store, name)
	session.Values["state"] = stateValue
	session.Options.MaxAge = 60 * 5
	session.Options.Path = "/"
	session.Options.Secure = context.Request.TLS != nil

	if err := cj.store.Save(context.Request, context.Writer, session); err != nil {
		fmt.Println("[error] failed to store session")
		return
	}
}

func (cj *CookieJar) StateSession(context *gin.Context, stateValue string) (value string, isNew bool) {
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

func (cj *CookieJar) DeleteSession(context *gin.Context, name string) error {
	session, err := cj.store.Get(context.Request, name)
	if err != nil {
		return err
	}
	session.Options.MaxAge = -1
	err = cj.store.Save(context.Request, context.Writer, session)
	if err != nil {
		return err
	}
	return nil
}
