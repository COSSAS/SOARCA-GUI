package handlers

import (
	"net/http"
	"soarca-gui/pkg/utils"

	authviews "soarca-gui/pkg/views/auth"

	"github.com/COSSAS/gauth"
	"github.com/gin-gonic/gin"
)

type OIDCAuthHandler struct {
	authenticator *gauth.Authenticator
}

func NewOIDCAuthHandler(authenticator *gauth.Authenticator) *OIDCAuthHandler {
	return &OIDCAuthHandler{authenticator: authenticator}
}

func (auth *OIDCAuthHandler) OIDCAuthPageHandler(context *gin.Context) {
	render := utils.NewTempl(context, http.StatusOK, authviews.OIDCLoginIndex())
	context.Render(http.StatusOK, render)
}

func (auth *OIDCAuthHandler) OIDCLoginHandler(context *gin.Context) {
	auth.authenticator.OIDCRedirectToLogin(context)
}

func (auth *OIDCAuthHandler) OIDCCallBackHandler(context *gin.Context) {
	auth.authenticator.OIDCCallBack(context, "/dashboard")
}

func (auth *OIDCAuthHandler) OIDCLogoutHandler(context *gin.Context) {
	auth.authenticator.Logout(context, "http://localhost:7331/")
}
