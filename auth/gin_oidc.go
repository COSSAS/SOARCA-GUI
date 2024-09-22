package auth

import (
	"errors"
	"net/http"
	"soarca-gui/auth/api"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/gin-gonic/gin"
)

const (
	CALLBACK_STATE = "soarca_gui_state"
	CALLBACK_NONCE = "soarca_gui_nonce"
)

func (auth *Authenticator) RedirectToOIDCLogin(context *gin.Context) {
	state, err := randString(32)
	if err != nil {
		api.JSONErrorStatus(context, http.StatusInsufficientStorage, errors.New("failed to generate state"))
		return
	}
	nonce, err := randString(32)
	if err != nil {
		api.JSONErrorStatus(context, http.StatusInsufficientStorage, errors.New("failed to generate nonce"))
		return
	}
	auth.Cookiejar.SetCallBackCookie(context, CALLBACK_STATE, state)
	auth.Cookiejar.SetCallBackCookie(context, CALLBACK_NONCE, nonce)

	context.Redirect(http.StatusFound, auth.OauthConfig.AuthCodeURL(state, oidc.Nonce(nonce)))
}
