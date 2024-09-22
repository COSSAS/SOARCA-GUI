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
	OIDC_CALL_BACK = "/oidc-callback"
)

type Authenticator struct {
	Cookiejar        cookies.ICookieJar
	OIDCconfig       *oidc.Config
	OauthConfig      *oauth2.Config
	verifierProvider *oidc.Provider
	skipTLSVerify    bool
}

func SetupOIDCAuthHandler() *Authenticator {
	env := struct {
		providerLink    string
		soarcaGUIDomain string
		clientID        string
		clientSecret    string
		skipTLSVerify   string
		cookieJarSecret string
	}{
		providerLink:    utils.GetEnv("OIDC_PROVIDER", ""),
		soarcaGUIDomain: utils.GetEnv("SOARCA_GUI_URI", "http://localhost:8081"),
		clientID:        utils.GetEnv("OIDC_CLIENT_ID", ""),
		clientSecret:    utils.GetEnv("OIDC_CLIENT_SECRET", ""),
		skipTLSVerify:   utils.GetEnv("OIDC_SKIP_TLS_VERIFY", "false"),
		cookieJarSecret: utils.GetEnv("COOKIE_SECRET_KEY", ""),
	}

	validateEnvVariables(env)
	skipTLS, err := strconv.ParseBool(env.skipTLSVerify)
	if err != nil {
		log.Printf("Invalid SKIP_TLS_VERIFY value. Defaulting to false. Error: %v", err)
		skipTLS = false
	}

	client := setupHTTPClient(skipTLS)
	ctx := context.WithValue(context.Background(), oauth2.HTTPClient, client)
	provider, err := oidc.NewProvider(ctx, env.providerLink)
	if err != nil {
		log.Fatalf("Failed to create OIDC provider: %v", err)
	}

	oidcConfig := &oidc.Config{ClientID: env.clientID}
	oauthConfig := &oauth2.Config{
		ClientID:     env.clientID,
		ClientSecret: env.clientSecret,
		RedirectURL:  fmt.Sprintf("%s%s", env.soarcaGUIDomain, OIDC_CALL_BACK),
		Endpoint:     provider.Endpoint(),
		Scopes:       []string{oidc.ScopeOpenID, "profile", "email"},
	}

	cookieJar := cookies.NewCookieJar([]byte(env.cookieJarSecret))

	return NewAuthenticator(cookieJar, oidcConfig, oauthConfig, provider, skipTLS)
}

func validateEnvVariables(env struct {
	providerLink    string
	soarcaGUIDomain string
	clientID        string
	clientSecret    string
	skipTLSVerify   string
	cookieJarSecret string
},
) {
	if env.providerLink == "" {
		log.Fatal("invalid provider link for the env: OIDC_PROVIDER")
	}
	if env.clientID == "" {
		log.Fatal("invalid oidc client ID for the env: OIDC_CLIENT_ID")
	}
	if env.clientSecret == "" {
		log.Fatal("invalid oidc client secret for the env: OIDC_CLIENT_SECRET")
	}
	if env.cookieJarSecret == "" || len(env.cookieJarSecret) < 32 {
		log.Fatal("invalid cookie secret key for the env: COOKIE_SECRET_KEY. Note: should be at least 33 characters")
	}
}

func setupHTTPClient(skipTLS bool) *http.Client {
	if skipTLS {
		tr := &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		}
		client := &http.Client{Transport: tr}
		log.Println("Warning: TLS verification is disabled. This should not be used in production.")
		return client
	}
	return http.DefaultClient
}

func NewAuthenticator(cj cookies.ICookieJar, OIDCconfig *oidc.Config, OauthConfig *oauth2.Config, verifierProvider *oidc.Provider, skipTLSVerify bool) *Authenticator {
	return &Authenticator{
		Cookiejar:        cj,
		OIDCconfig:       OIDCconfig,
		OauthConfig:      OauthConfig,
		verifierProvider: verifierProvider,
		skipTLSVerify:    skipTLSVerify,
	}
}

func (auth *Authenticator) GetTokenVerifier() *oidc.IDTokenVerifier {
	return auth.verifierProvider.Verifier(auth.OIDCconfig)
}
