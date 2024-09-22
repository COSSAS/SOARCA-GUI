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
	Cookiejar        cookies.ICookieJar
	OIDCconfig       *oidc.Config
	OauthConfig      *oauth2.Config
	verifierProvider *oidc.Provider
}

func SetupOIDCAuthHandler() *Authenticator {
	providerLink := utils.GetEnv("OIDC_PROVIDER", "")
	clientID := utils.GetEnv("OIDC_CLIENT_ID", "")
	clientSecret := utils.GetEnv("OIDC_CLIENT_SECRET", "")
	redirectURL := utils.GetEnv("OIDC_REDIRECT_URL", "")
	cookieJarSecret := utils.GetEnv("COOKIE_SECRET_KEY", "")
	if providerLink == "" {
		log.Fatal("invalid provider link for the env: OIDC_PROVIDER")
	}
	if clientID == "" {
		log.Fatal("invalid oidc client ID for the env: OIDC_CLIENT_ID")
	}
	if clientSecret == "" {
		log.Fatal("invalid oidc client secret for the env: OIDC_CLIENT_SECRET")
	}
	if redirectURL == "" {
		log.Fatal("invalid redirect URL for the env: OIDC_REDIRECT_URL")
	}
	if cookieJarSecret == "" || len(cookieJarSecret) < 32 {
		log.Fatal("invalid cookie secret key for the env: COOKIE_SECRET_KEY. Note: should be at least 32 characters")
	}

	ctx := context.Background()
	provider, err := oidc.NewProvider(ctx, providerLink)
	if err != nil {
		log.Fatal(err)
	}

	oidcConfig := &oidc.Config{
		ClientID: clientID,
	}

	oauthConfig := &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		RedirectURL:  redirectURL,
		Endpoint:     provider.Endpoint(),
		Scopes:       []string{oidc.ScopeOpenID, "profile", "email"},
	}

	cookieJar := cookies.NewCookieJar([]byte(cookieJarSecret))
	return NewAuthenticator(cookieJar, oidcConfig, oauthConfig, provider)
}

func NewAuthenticator(cj cookies.ICookieJar, OIDCconfig *oidc.Config, OauthConfig *oauth2.Config, verifierProvider *oidc.Provider) *Authenticator {
	return &Authenticator{Cookiejar: cj, OIDCconfig: OIDCconfig, OauthConfig: OauthConfig, verifierProvider: verifierProvider}
}

func (auth *Authenticator) GetVerifier() *oidc.Provider {
	return auth.verifierProvider
}
