package auth

import (
	"context"
	"log"
	"soarca-gui/auth/cookies"
	"soarca-gui/utils"

	"github.com/coreos/go-oidc/v3/oidc"
	"golang.org/x/oauth2"
)

type Authenticator struct {
	Cookiejar   *cookies.CookieJar
	OIDCconfig  *oidc.Config
	OauthConfig *oauth2.Config
	provider    *oidc.Provider
}

func SetupAuthHanlder() *Authenticator {
	providerLink := utils.GetEnv("OIDC_PROVIDER", "")
	clientID := utils.GetEnv("OIDC_CLIENT_ID", "")
	clientSecret := utils.GetEnv("OIDC_CLIENT_SECRET", "")

	if providerLink == "" {
		log.Fatal("invalid provider link for the env: OIDC_PROVIDER")
		return nil
	}
	if clientID == "" {
		log.Fatal("invalid oidc client ID for the env: OIDC_CLIENT_ID")
		return nil
	}
	if clientSecret == "" {
		log.Fatal("invalid oidc client secret for the env: OIDC_CLIENT_secret")
		return nil
	}
	context := context.Background()

	provider, err := oidc.NewProvider(context, providerLink)
	if err != nil {
		log.Fatal(err)
	}
	return nil
}

func NewAuthenticator(cj *cookies.CookieJar, OIDCconfig *oidc.Config) *Authenticator {
	return &Authenticator{Cookiejar: cj, OIDCconfig: OIDCconfig}
}

func (auth *Authenticator) GetVerifier() *oidc.Provider {
	return auth.provider
}
