package auth

import (
	"context"
	"crypto/tls"
	"errors"
	"net/http"
	"soarca-gui/auth/api"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2"
)

const (
	CALLBACK_STATE = "soarca_gui_state"
	CALLBACK_NONCE = "soarca_gui_nonce"
)

func (auth *Authenticator) OIDCRedirectToLogin(gin *gin.Context) {
	state, err := randString(16)
	if err != nil {
		api.JSONErrorStatus(gin, http.StatusInsufficientStorage, errors.New("failed to generate state"))
		return
	}
	nonce, err := randString(16)
	if err != nil {
		api.JSONErrorStatus(gin, http.StatusInsufficientStorage, errors.New("failed to generate nonce"))
		return
	}
	auth.Cookiejar.SetCallBackState(gin, CALLBACK_STATE, state)
	auth.Cookiejar.SetCallBackState(gin, CALLBACK_NONCE, nonce)

	gin.Redirect(http.StatusFound, auth.OauthConfig.AuthCodeURL(state, oidc.Nonce(nonce)))
}

func (auth *Authenticator) OIDCCallBack(gin *gin.Context) {
	state, isNew := auth.Cookiejar.StateSession(gin, CALLBACK_STATE)
	if isNew || state == "" {
		api.JSONErrorStatus(gin, http.StatusInternalServerError, errors.New("state missing"))
		return
	}
	if state != gin.Query("state") {
		api.JSONErrorStatus(gin, http.StatusUnauthorized, errors.New("state mismatch"))
		return
	}

	localContext := gin.Request.Context()
	if auth.skipTLSVerify {
		tr := &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		}
		client := &http.Client{Transport: tr}
		localContext = context.WithValue(localContext, oauth2.HTTPClient, client)
	}

	oauth2Token, err := auth.OauthConfig.Exchange(localContext, gin.Query("code"))
	if err != nil {
		api.JSONErrorStatus(gin, http.StatusBadRequest, errors.New("could not get code from URL"))
		return
	}
	rawIDtoken, ok := oauth2Token.Extra("id_token").(string)
	if !ok {
		api.JSONErrorStatus(gin, http.StatusBadRequest, errors.New("could not parse id_token"))
		return
	}
	verifier := auth.GetTokenVerifier()
	verifiedIDToken, err := verifier.Verify(localContext, rawIDtoken)
	if err != nil {
		api.JSONErrorStatus(gin, http.StatusInternalServerError, errors.New("failed to verify ID token"))
		return
	}
	nonce, isNewNonce := auth.Cookiejar.StateSession(gin, CALLBACK_NONCE)
	if isNewNonce || state == "" {
		api.JSONErrorStatus(gin, http.StatusBadRequest, errors.New("state or invalid nonce"))
		return
	}
	if err != nil {
		api.JSONErrorStatus(gin, http.StatusInternalServerError, errors.New("missing id token"))
		return
	}
	if verifiedIDToken.Nonce != nonce {
		api.JSONErrorStatus(gin, http.StatusBadRequest, errors.New("nonce for verified id token did not match"))
		return
	}
	auth.Cookiejar.DeleteSession(gin, CALLBACK_NONCE)
	gin.Redirect(http.StatusFound, "/dashboard")
}
