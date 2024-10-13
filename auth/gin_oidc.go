package auth

import (
	"context"
	"crypto/tls"
	"errors"
	"fmt"
	"net/http"
	"soarca-gui/auth/api"
	"soarca-gui/auth/cookies"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2"
)

func (auth *Authenticator) OIDCRedirectToLogin(gc *gin.Context) {
	state, err := randString(16)
	if err != nil {
		api.JSONErrorStatus(gc, http.StatusInternalServerError, errors.New("failed to generate state"))
		return
	}
	nonce, err := randString(16)
	if err != nil {
		api.JSONErrorStatus(gc, http.StatusInternalServerError, errors.New("failed to generate nonce"))
		return
	}
	nonceCookie, err := cookies.NewCookie(cookies.Nonce, nonce)
	err = auth.Cookiejar.Store(gc, nonceCookie)
	if err != nil {
		api.JSONErrorStatus(gc, http.StatusInternalServerError, errors.New("failed to set nonce"))
		return
	}
	stateCookie, err := cookies.NewCookie(cookies.State, state)
	err = auth.Cookiejar.Store(gc, stateCookie)
	if err != nil {
		api.JSONErrorStatus(gc, http.StatusInternalServerError, errors.New("failed to set state"))
		return
	}
	gc.Redirect(http.StatusFound, auth.OauthConfig.AuthCodeURL(state, oidc.Nonce(nonce)))
}

func (auth *Authenticator) OIDCCallBack(gc *gin.Context) {
	state, isNew, err := auth.Cookiejar.Get(gc, cookies.State)

	if isNew || state == "" || err != nil {
		api.JSONErrorStatus(gc, http.StatusBadRequest, errors.New("state missing"))
		return
	}
	if state != gc.Query("state") {
		api.JSONErrorStatus(gc, http.StatusBadRequest, errors.New("state mismatch"))
		return
	}
	localContext := gc.Request.Context()
	if auth.skipTLSValidation {
		tr := &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		}
		client := &http.Client{Transport: tr}
		localContext = context.WithValue(localContext, oauth2.HTTPClient, client)
	}
	oauth2Token, err := auth.OauthConfig.Exchange(localContext, gc.Query("code"))
	fmt.Println(err)
	if err != nil {
		api.JSONErrorStatus(gc, http.StatusUnauthorized, errors.New("could not exchange code for token"))
		return
	}
	rawIDtoken, ok := oauth2Token.Extra("id_token").(string)
	if !ok {
		api.JSONErrorStatus(gc, http.StatusUnauthorized, errors.New("could not parse id_token"))
		return
	}
	verifier := auth.GetTokenVerifier()
	verifiedIDToken, err := verifier.Verify(localContext, rawIDtoken)
	if err != nil {
		api.JSONErrorStatus(gc, http.StatusUnauthorized, errors.New("failed to verify ID token"))
		return
	}
	nonce, isNewNonce, err := auth.Cookiejar.Get(gc, cookies.Nonce)
	if isNewNonce || nonce == "" {
		api.JSONErrorStatus(gc, http.StatusBadRequest, errors.New("invalid or missing nonce"))
		return
	}
	if verifiedIDToken.Nonce != nonce {
		api.JSONErrorStatus(gc, http.StatusUnauthorized, errors.New("nonce for verified id token did not match"))
		return
	}
	auth.Cookiejar.Delete(gc, cookies.Nonce)
	accessToken := oauth2Token.AccessToken

	userInfo, err := auth.GetProvider().UserInfo(localContext, oauth2.StaticTokenSource(oauth2Token))
	if err != nil {
		api.JSONErrorStatus(gc, http.StatusUnauthorized, errors.New("failed to get user info of access token"))
		return
	}

	if userInfo.Subject != verifiedIDToken.Subject {
		// authentik does not support at_hash so we can use the verifacess token.
		api.JSONErrorStatus(gc, http.StatusUnauthorized, errors.New("user info subject does not match ID token subject"))
		return
	}
	tokenCookie, err := cookies.NewCookie(cookies.Token, accessToken)
	if err != nil {
		api.JSONErrorStatus(gc, http.StatusInternalServerError, errors.New("failed to set access cookie token"))
		return
	}
	auth.Cookiejar.Store(gc, tokenCookie)
	auth.Cookiejar.Delete(gc, cookies.Nonce)
	auth.Cookiejar.Delete(gc, cookies.State)

	gc.Redirect(http.StatusFound, "/dashboard")
}
