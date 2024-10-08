package auth

import (
	"errors"
	"fmt"
	"net/http"
	"soarca-gui/auth/api"

	"github.com/gin-gonic/gin"
)

func (auth *Authenticator) Middelware(permissions ...string) gin.HandlerFunc {
	return func(gc *gin.Context) {
		return
	}
}

func (auth *Authenticator) LoadAuthContext() gin.HandlerFunc {
	return auth.setSessionAuthContext()
}

func (auth *Authenticator) setSessionAuthContext() gin.HandlerFunc {
	return func(gc *gin.Context) {
		tokenCookie, noCookie := auth.Cookiejar.GetUserToken(gc)
		fmt.Println(tokenCookie)
		if noCookie {
			gc.Redirect(http.StatusFound, "/")
			gc.Abort()
			return
		}
		user, err := auth.VerifyClaims(gc, tokenCookie)
		if err != nil {
			api.JSONErrorStatus(gc, http.StatusUnauthorized, errors.New("could not map token claims"))
			gc.Abort()
			return
		}

		setContext(gc, *user)
		gc.Next()
	}
}
