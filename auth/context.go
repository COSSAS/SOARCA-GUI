package auth

import (
	"encoding/json"

	"github.com/gin-gonic/gin"
)

const (
	userValueContextKey   = "user-context"
	permissionsContextKey = "user-permissions"
)

func setContext(gc *gin.Context, user User) error {
	userJSON, err := json.Marshal(user)
	if err != nil {
		return err
	}
	gc.Set(userValueContextKey, string(userJSON))
	gc.Set(permissionsContextKey, user.Groups)
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

func GetUserPermissions(gc *gin.Context) []string {
	permissions, exists := gc.Get(permissionsContextKey)
	if !exists {
		return []string{}
	}
	groups, ok := permissions.([]string)
	if !ok {
		return []string{}
	}
	return groups
}
