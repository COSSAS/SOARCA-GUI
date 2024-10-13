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
	groups, exists := c.Get(userGroupsContextKey)
	assert.True(t, exists)
	assert.Equal(t, user.Groups, groups)
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

func TestGetUserAssignedGroups(t *testing.T) {
	gin.SetMode(gin.TestMode)
	c, _ := gin.CreateTestContext(nil)
	groups := GetUserAssignedGroups(c)
	assert.Empty(t, groups)
	assignedGroups := []string{"admin", "user"}
	c.Set(userGroupsContextKey, assignedGroups)
	groups = GetUserAssignedGroups(c)
	assert.Equal(t, assignedGroups, groups)
	c.Set(userGroupsContextKey, "invalid")
	groups = GetUserAssignedGroups(c)
	assert.Empty(t, groups)
}
