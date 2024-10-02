package auth

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"
)

func (auth *Authenticator) VerifyClaims(gc *gin.Context, token string) (name string, role string, err error) {
	verifier := auth.GetTokenVerifier()
	accessToken, err := verifier.Verify(gc, token)
	if err != nil {
		return "", "", errors.New(fmt.Sprintf("could not obtain token from cookie: %w", err))
	}
	var claims map[string]any
	if err := accessToken.Claims(&claims); err != nil {
		return "", "", errors.New(fmt.Sprintf("could not map clains: %w", err))
	}
	if _, ok := claims["iss"]; !ok {
		return "", "", errors.New("no issues in claim")
	}

	return "", "", nil
}

func (auth *Authenticator) mapClaimsToUser(claims map[string]any) (*User, error) {
	user := &User{}

	if username, ok := claims[auth.userclaimConfig.OIDCClaimUsernameField].(string); ok {
		user.Username = username
	}
	if email, ok := claims[auth.userclaimConfig.OIDCClaimEmailField].(string); ok {
		user.Email = email
	}
	if name, ok := claims[auth.userclaimConfig.OIDCClaimNameField].(string); ok {
		user.Name = name
	}
	if groups, ok := claims[auth.userclaimConfig.OIDCClaimGroupsField].([]interface{}); ok {
		user.Groups = make([]string, len(groups))
		for i, g := range groups {
			user.Groups[i] = g.(string)
		}
	}

	return user, nil
}
