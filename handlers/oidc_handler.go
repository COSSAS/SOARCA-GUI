package handlers

import (
	"net/http"
	"soarca-gui/auth"
	"soarca-gui/utils"

	authviews "soarca-gui/views/auth"

	"github.com/gin-gonic/gin"
)

type OIDCAuthHandler struct {
	authenticator *auth.Authenticator
}

func NewOIDCAuthHanlder(authenticator *auth.Authenticator) *OIDCAuthHandler {
	return &OIDCAuthHandler{authenticator: authenticator}
}

func (a *OIDCAuthHandler) OIDCAuthPageHandler(context *gin.Context) {
	// context.Header("HX-Redirect", "/dashboard")
	// context.String(http.StatusFound, "")
	render := utils.NewTempl(context, http.StatusOK, authviews.OIDCLoginIndex())
	context.Render(http.StatusOK, render)
}

func (a *OIDCAuthHandler) OIDCLoginHandler(context *gin.Context) {
	a.authenticator.RedirectToOIDCLogin(context)
}
