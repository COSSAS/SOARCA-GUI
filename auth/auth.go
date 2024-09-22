package auth

import (
	"context"
	"crypto/tls"
	"fmt"
	"log"
	"net/http"
	"soarca-gui/auth/cookies"
	"soarca-gui/utils"
	"strconv"

	"github.com/coreos/go-oidc/v3/oidc"
	"golang.org/x/oauth2"
)

const (
	OIDC_REDIRECT_URL = "/oidc-login"
)

type Authenticator struct {
	Cookiejar        cookies.ICookieJar
	OIDCconfig       *oidc.Config
	OauthConfig      *oauth2.Config
	verifierProvider *oidc.Provider
}

func SetupOIDCAuthHandler() *Authenticator {
	providerLink := utils.GetEnv("OIDC_PROVIDER", "")
	soarcaGUIDomain := utils.GetEnv("SOARCA_GUI_URI", "http://localhost:8081")
	clientID := utils.GetEnv("OIDC_CLIENT_ID", "")
	clientSecret := utils.GetEnv("OIDC_CLIENT_SECRET", "")
	skipTLSVerify := utils.GetEnv("OIDC_SKIP_TLS_VERIFY", "false")
	cookieJarSecret := utils.GetEnv("COOKIE_SECRET_KEY", "")

	// Environment variable checks
	if providerLink == "" {
		log.Fatal("invalid provider link for the env: OIDC_PROVIDER")
	}

	if clientID == "" {
		log.Fatal("invalid oidc client ID for the env: OIDC_CLIENT_ID")
	}
	if clientSecret == "" {
		log.Fatal("invalid oidc client secret for the env: OIDC_CLIENT_SECRET")
	}
	if cookieJarSecret == "" || len(cookieJarSecret) < 32 {
		log.Fatal("invalid cookie secret key for the env: COOKIE_SECRET_KEY. Note: should be at least 33 characters")
	}

	skipTLS, err := strconv.ParseBool(skipTLSVerify)
	if err != nil {
		log.Printf("Invalid SKIP_TLS_VERIFY value. Defaulting to false. Error: %v", err)
		skipTLS = false
	}

	var client *http.Client
	if skipTLS {
		tr := &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		}
		client = &http.Client{Transport: tr}
		log.Println("Warning: TLS verification is disabled. This should not be used in production.")
	} else {
		client = http.DefaultClient
	}

	ctx := context.WithValue(context.Background(), oauth2.HTTPClient, client)

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
		RedirectURL:  fmt.Sprintf("%s%s", soarcaGUIDomain, OIDC_REDIRECT_URL),
		Endpoint:     provider.Endpoint(),
		Scopes:       []string{oidc.ScopeOpenID, "profile", "email"},
	}

	cookieJar := cookies.NewCookieJar([]byte(cookieJarSecret))

	return NewAuthenticator(cookieJar, oidcConfig, oauthConfig, provider)
}

func NewAuthenticator(cj cookies.ICookieJar, OIDCconfig *oidc.Config, OauthConfig *oauth2.Config, verifierProvider *oidc.Provider) *Authenticator {
	return &Authenticator{Cookiejar: cj, OIDCconfig: OIDCconfig, OauthConfig: OauthConfig, verifierProvider: verifierProvider}
}

func (auth *Authenticator) GetTokenVerifier() *oidc.IDTokenVerifier {
	return auth.verifierProvider.Verifier(auth.OIDCconfig)
}
