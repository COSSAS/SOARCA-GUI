package cookies

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/sessions"
)

type ICookieJar interface {
	SetCallBackCookie(*gin.Context, string, string)
}
type CookieJar struct {
	store sessions.Store
}

func NewCookieJar(secret []byte) *CookieJar {
	return &CookieJar{store: sessions.NewCookieStore(secret)}
}

func (cj *CookieJar) SetCallBackCookie(g *gin.Context, name string, stateValue string) {
	session := sessions.NewSession(cj.store, name)
	session.Values["state"] = stateValue
	session.Options.MaxAge = 60 * 5
	session.Options.Path = "/"
	session.Options.Secure = g.Request.TLS != nil

	if err := cj.store.Save(g.Request, g.Writer, session); err != nil {
		fmt.Println("[error] failed to store session")
		return
	}
}
