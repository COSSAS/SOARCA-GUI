package cookies

import (
	"github.com/gin-gonic/gin"
	"github.com/gorilla/sessions"
)

const (
	stateSession = "soarca_gui_state"
)

type CookieJar struct {
	store sessions.Store
}

func NewCookieJar(secret []byte) *CookieJar {
	return &CookieJar{store: sessions.NewCookieStore(secret)}
}

func (cj *CookieJar) setCallBackCookie(g *gin.Context, name string, stateValue string) {
	session := sessions.NewSession(cj.store, stateSession)
	session.Values["state"] = stateValue
	session.Options.MaxAge = 60 * 5
	session.Options.Path = "/"
	session.Options.Secure = g.Request.TLS != nil

	if err := session.Save(); err != nil {
	}
}
