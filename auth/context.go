package auth

import (
	"encoding/json"

	"github.com/gin-gonic/gin"
)

const (
	userValueContextKey  = "user-context"
	userGroupsContextKey = "user-groups"
)

func setContext(gc *gin.Context, user User) error {
	userJSON, err := json.Marshal(user)
	if err != nil {
		return err
	}
	gc.Set(userValueContextKey, string(userJSON))
	gc.Set(userGroupsContextKey, user.Groups)
	return nil
}

func GetUserFromContext(gc *gin.Context) (User, bool) {
	userJSON, exists := gc.Get(userValueContextKey)
	if !exists {
		return User{}, false
	}
	userString, ok := userJSON.(string)
	if !ok {
		return User{}, false
	}
	var user User
	err := json.Unmarshal([]byte(userString), &user)
	if err != nil {
		return User{}, false
	}
	return user, true
}

func GetUserAssignedGroups(gc *gin.Context) []string {
	groups, exists := gc.Get(userGroupsContextKey)
	if !exists {
		return []string{}
	}
	assignedGroups, ok := groups.([]string)
	if !ok {
		return []string{}
	}
	return assignedGroups
}
