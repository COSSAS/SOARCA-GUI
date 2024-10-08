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
	"github.com/gorilla/securecookie"
	"golang.org/x/oauth2"
)

const (
	OIDC_CALL_BACK_PATH          = "/oidc-callback"
	COOKIE_ENCRYPTION_KEY_LENGTH = 32
	COOKIE_SECRET_KEY_LENGHT     = 32
)

type User struct {
	Username string   `json:"username"`
	Email    string   `json:"email"`
	Name     string   `json:"name"`
	Groups   []string `json:"groups"`
}
type UserClaimsConfig struct {
	OIDCClaimUsernameField string
	OIDCClaimEmailField    string
	OIDCClaimNameField     string
	OIDCClaimGroupsField   string
}

type Authenticator struct {
	Cookiejar        cookies.ICookieJar
	OIDCconfig       *oidc.Config
	OauthConfig      *oauth2.Config
	verifierProvider *oidc.Provider
	userclaimConfig  *UserClaimsConfig
	skipTLSVerify    bool
}

func SetupOIDCAuthHandler() *Authenticator {
	env := struct {
		providerLink        string
		soarcaGUIDomain     string
		clientID            string
		clientSecret        string
		skipTLSVerify       string
		cookieJarSecret     string
		cookieEncryptionKey string
	}{
		providerLink:    utils.GetEnv("OIDC_PROVIDER", ""),
		soarcaGUIDomain: utils.GetEnv("SOARCA_GUI_URI", "http://localhost:8081"),
		clientID:        utils.GetEnv("OIDC_CLIENT_ID", ""),
		clientSecret:    utils.GetEnv("OIDC_CLIENT_SECRET", ""),
		skipTLSVerify:   utils.GetEnv("OIDC_SKIP_TLS_VERIFY", "false"),
		cookieJarSecret: utils.GetEnv("COOKIE_SECRET_KEY",
			string(securecookie.GenerateRandomKey(COOKIE_SECRET_KEY_LENGHT))),
		cookieEncryptionKey: utils.GetEnv("COOKIE_ENCRYPTION_KEY",
			string(securecookie.GenerateRandomKey(COOKIE_ENCRYPTION_KEY_LENGTH))),
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
		RedirectURL:  fmt.Sprintf("%s%s", env.soarcaGUIDomain, OIDC_CALL_BACK_PATH),
		Endpoint:     provider.Endpoint(),
		Scopes:       []string{oidc.ScopeOpenID, "profile", "email"},
	}
	userClaimsConfig := &UserClaimsConfig{
		OIDCClaimUsernameField: "preferred_username",
		OIDCClaimEmailField:    "email",
		OIDCClaimNameField:     "name",
		OIDCClaimGroupsField:   "groups",
	}

	cookieJar := cookies.NewCookieJar([]byte(env.cookieJarSecret), []byte(env.cookieEncryptionKey))

	return NewAuthenticator(
		cookieJar,
		oidcConfig,
		oauthConfig,
		provider,
		skipTLS,
		userClaimsConfig)
}

func validateEnvVariables(env struct {
	providerLink        string
	soarcaGUIDomain     string
	clientID            string
	clientSecret        string
	skipTLSVerify       string
	cookieJarSecret     string
	cookieEncryptionKey string
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

func NewAuthenticator(cj cookies.ICookieJar, OIDCconfig *oidc.Config, OauthConfig *oauth2.Config, verifierProvider *oidc.Provider, skipTLSVerify bool, userClaims *UserClaimsConfig) *Authenticator {
	return &Authenticator{
		Cookiejar:        cj,
		OIDCconfig:       OIDCconfig,
		OauthConfig:      OauthConfig,
		verifierProvider: verifierProvider,
		userclaimConfig:  userClaims,
		skipTLSVerify:    skipTLSVerify,
	}
}

func (auth *Authenticator) GetProvider() *oidc.Provider {
	return auth.verifierProvider
}

func (auth *Authenticator) GetTokenVerifier() *oidc.IDTokenVerifier {
	return auth.verifierProvider.Verifier(auth.OIDCconfig)
}
