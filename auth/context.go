package auth

import "github.com/gin-gonic/gin"

const (
	userValueContextKey   = "user-context"
	permissionsContextKey = "user-permissions"
)

func setContext(gc *gin.Context, user User) {
	gc.Set(permissionsContextKey, user.Groups)
	gc.Set(userValueContextKey, user)
}

func getUserFromContext(gc *gin.Context) (*User, bool) {
	userValue, exists := gc.Get(userValueContextKey)
	if !exists {
		return nil, false
	}

	user, ok := userValue.(*User)
	if !ok {
		return nil, false
	}

	return user, true
}

func getUserPermissions(gc *gin.Context) []string {
	permissions, exists := gc.Get(permissionsContextKey)
	if !exists {
		return []string{}
	}
	return permissions.([]string)
}
