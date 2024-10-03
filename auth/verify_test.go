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
		"preferred_username": "johndoe",
		"email":              "john@example.com",
		"name":               "John Doe",
		"groups":             []interface{}{"users", "admins"},
	}
	expectedUser := &User{
		Username: "johndoe",
		Email:    "john@example.com",
		Name:     "John Doe",
		Groups:   []string{"users", "admins"},
	}

	auth := &Authenticator{
		userclaimConfig: &config,
	}

	user, err := auth.mapClaimsToUser(claims)

	assert.NoError(t, err)
	assert.Equal(t, expectedUser, user)
}
