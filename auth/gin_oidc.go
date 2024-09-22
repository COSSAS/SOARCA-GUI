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

func (auth *Authenticator) OIDCRedirectToLogin(context *gin.Context) {
	state, err := randString(32)
	if err != nil {
		api.JSONErrorStatus(context, http.StatusInsufficientStorage, errors.New("failed to generate state"))
		return
	}
	nonce, err := randString(16)
	if err != nil {
		api.JSONErrorStatus(context, http.StatusInsufficientStorage, errors.New("failed to generate nonce"))
		return
	}
	auth.Cookiejar.SetCallBackState(context, CALLBACK_STATE, state)
	auth.Cookiejar.SetCallBackState(context, CALLBACK_NONCE, nonce)

	context.Redirect(http.StatusFound, auth.OauthConfig.AuthCodeURL(state, oidc.Nonce(nonce)))
}

func (auth *Authenticator) OIDCCallBack(context *gin.Context) {
	state, isNew := auth.Cookiejar.StateSession(context, CALLBACK_STATE)
	if isNew || state == "" {
		api.JSONErrorStatus(context, http.StatusInternalServerError, errors.New("state missing"))
		return
	}

	cookie, err := context.Request.Cookie(CALLBACK_STATE)
	if err != nil {
		api.JSONErrorStatus(context, http.StatusBadRequest, errors.New("state missing from client"))
		return
	}

	if cookie.Value != state {
		api.JSONErrorStatus(context, http.StatusUnauthorized, errors.New("state mismatch"))
		return
	}

	oauth2Token, err := auth.OauthConfig.Exchange(context, context.Query("code"))
	if err != nil {
		api.JSONErrorStatus(context, http.StatusBadRequest, errors.New("could not get code from URL"))
		return
	}
	rawIDtoken, ok := oauth2Token.Extra("id_token").(string)

	if !ok {
		api.JSONErrorStatus(context, http.StatusBadRequest, errors.New("could not obtain code from URL"))
		return
	}

	verifier := auth.GetTokenVerifier()
	verifiedIDToken, err := verifier.Verify(context, rawIDtoken)
	if err != nil {
		api.JSONErrorStatus(context, http.StatusInternalServerError, errors.New("failed to verify ID token"))
		return
	}

	nonce, err := context.Request.Cookie(CALLBACK_NONCE)
	if err != nil {
		api.JSONErrorStatus(context, http.StatusInternalServerError, errors.New("missing id token"))
		return
	}
	if verifiedIDToken.Nonce != nonce.Value {
		api.JSONErrorStatus(context, http.StatusBadRequest, errors.New("nonce for verified id token did not match"))
		return
	}
	context.Redirect(http.StatusOK, "/dashboard")
}
