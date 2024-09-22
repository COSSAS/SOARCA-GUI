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

func NewOIDCAuthHandler(authenticator *auth.Authenticator) *OIDCAuthHandler {
	return &OIDCAuthHandler{authenticator: authenticator}
}

func (auth *OIDCAuthHandler) OIDCAuthPageHandler(context *gin.Context) {
	// context.Header("HX-Redirect", "/dashboard")
	// context.String(http.StatusFound, "")
	render := utils.NewTempl(context, http.StatusOK, authviews.OIDCLoginIndex())
	context.Render(http.StatusOK, render)
}

func (auth *OIDCAuthHandler) OIDCLoginHandler(context *gin.Context) {
	auth.authenticator.OIDCRedirectToLogin(context)
}

func (auth *OIDCAuthHandler) OIDCCallBackHandler(context *gin.Context) {
	auth.authenticator.OIDCCallBack(context)
}
