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

func (auth *Authenticator) OIDCRedirectToLogin(gc *gin.Context) {
	state, err := randString(16)
	if err != nil {
		api.JSONErrorStatus(gc, http.StatusInsufficientStorage, errors.New("failed to generate state"))
		return
	}
	nonce, err := randString(16)
	if err != nil {
		api.JSONErrorStatus(gc, http.StatusInsufficientStorage, errors.New("failed to generate nonce"))
		return
	}
	auth.Cookiejar.SetCallBackNonce(gc, nonce)
	auth.Cookiejar.SetCallBackState(gc, state)
	gc.Redirect(http.StatusFound, auth.OauthConfig.AuthCodeURL(state, oidc.Nonce(nonce)))
}

func (auth *Authenticator) OIDCCallBack(gc *gin.Context) {
	state, isNew := auth.Cookiejar.GetStateSession(gc)
	if isNew || state == "" {
		api.JSONErrorStatus(gc, http.StatusInternalServerError, errors.New("state missing"))
		return
	}
	if state != gc.Query("state") {
		api.JSONErrorStatus(gc, http.StatusUnauthorized, errors.New("state mismatch"))
		return
	}

	localContext := gc.Request.Context()
	if auth.skipTLSVerify {
		tr := &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		}
		client := &http.Client{Transport: tr}
		localContext = context.WithValue(localContext, oauth2.HTTPClient, client)
	}

	oauth2Token, err := auth.OauthConfig.Exchange(localContext, gc.Query("code"))
	if err != nil {
		api.JSONErrorStatus(gc, http.StatusBadRequest, errors.New("could not get code from URL"))
		return
	}
	rawIDtoken, ok := oauth2Token.Extra("id_token").(string)
	if !ok {
		api.JSONErrorStatus(gc, http.StatusBadRequest, errors.New("could not parse id_token"))
		return
	}
	verifier := auth.GetTokenVerifier()
	verifiedIDToken, err := verifier.Verify(localContext, rawIDtoken)
	if err != nil {
		api.JSONErrorStatus(gc, http.StatusInternalServerError, errors.New("failed to verify ID token"))
		return
	}
	nonce, isNewNonce := auth.Cookiejar.GetNonceSession(gc)
	if isNewNonce || state == "" {
		api.JSONErrorStatus(gc, http.StatusBadRequest, errors.New("state or invalid nonce"))
		return
	}
	if err != nil {
		api.JSONErrorStatus(gc, http.StatusInternalServerError, errors.New("missing id token"))
		return
	}
	if verifiedIDToken.Nonce != nonce {
		api.JSONErrorStatus(gc, http.StatusBadRequest, errors.New("nonce for verified id token did not match"))
		return
	}
	auth.Cookiejar.DeleteNonceSession(gc)
	gc.Redirect(http.StatusFound, "/dashboard")
}

func (auth *Authenticator) sessionAuth(gc *gin.Context) gin.HandlerFunc {
	return func(gc *gin.Context) {
		return
	}
}
