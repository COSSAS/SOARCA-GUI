package auth

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestMapClaimsToUserAllFieldsMappedCorrectly(t *testing.T) {
	config := UserClaimsConfig{
		OIDCClaimUsernameField: "preferred_username",
		OIDCClaimEmailField:    "email",
		OIDCClaimNameField:     "name",
		OIDCClaimGroupsField:   "groups",
	}
	claims := map[string]interface{}{
		"preferred_username": "soarca-gui",
		"email":              "soarca@soarca.com",
		"name":               "soarca",
		"groups":             []interface{}{"users", "admins"},
	}
	expectedUser := &User{
		Username: "soarca-gui",
		Email:    "soarca@soarca.com",
		Name:     "soarca",
		Groups:   []string{"users", "admins"},
	}

	auth := &Authenticator{
		userclaimConfig: &config,
	}

	user, err := auth.mapClaimsToUser(claims)

	assert.NoError(t, err)
	assert.Equal(t, expectedUser, user)
}
