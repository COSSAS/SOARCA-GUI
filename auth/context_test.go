package auth

import (
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestSetContext(t *testing.T) {
	gin.SetMode(gin.TestMode)
	c, _ := gin.CreateTestContext(nil)

	user := User{
		Username: "tester12",
		Name:     "tester",
		Email:    "tester@soarca.com",
		Groups:   []string{"admin", "user"},
	}

	err := setContext(c, user)
	assert.NoError(t, err)

	userJSON, exists := c.Get(userValueContextKey)
	assert.True(t, exists)
	assert.IsType(t, "", userJSON)

	permissions, exists := c.Get(permissionsContextKey)
	assert.True(t, exists)
	assert.Equal(t, user.Groups, permissions)
}

func TestGetUserFromContext(t *testing.T) {
	gin.SetMode(gin.TestMode)
	c, _ := gin.CreateTestContext(nil)

	user, exists := GetUserFromContext(c)
	assert.False(t, exists)
	assert.Empty(t, user)

	originalUser := User{
		Username: "tester12",
		Email:    "tester@soarca.com",
		Name:     "tester",
		Groups:   []string{"admin", "user"},
	}
	err := setContext(c, originalUser)
	assert.NoError(t, err)

	user, exists = GetUserFromContext(c)
	assert.True(t, exists)
	assert.Equal(t, originalUser, user)
}

func TestGetUserPermissions(t *testing.T) {
	gin.SetMode(gin.TestMode)
	c, _ := gin.CreateTestContext(nil)

	permissions := GetUserPermissions(c)
	assert.Empty(t, permissions)

	groups := []string{"admin", "user"}
	c.Set(permissionsContextKey, groups)

	permissions = GetUserPermissions(c)
	assert.Equal(t, groups, permissions)

	c.Set(permissionsContextKey, "invalid")
	permissions = GetUserPermissions(c)
	assert.Empty(t, permissions)
}
