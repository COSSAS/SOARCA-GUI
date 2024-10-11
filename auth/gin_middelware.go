package auth

import (
	"errors"
	"net/http"
	"soarca-gui/auth/api"
	"soarca-gui/auth/cookies"
	"strings"

	"github.com/gin-gonic/gin"
)

func (auth *Authenticator) Middleware(permissions ...string) gin.HandlerFunc {
	return func(gc *gin.Context) {
		_, exists := GetUserFromContext(gc)
		if !exists {
			api.JSONErrorStatus(gc, http.StatusUnauthorized, errors.New("user not authenticated"))
			gc.Abort()
			return
		}

		userPermissions := GetUserPermissions(gc)
		if !hasRequiredPermissions(userPermissions, permissions) {
			api.JSONErrorStatus(gc, http.StatusForbidden, errors.New("Insufficient permissions"))
			gc.Abort()
			return
		}

		gc.Next()
	}
}

func hasRequiredPermissions(userPermissions []string, requiredPermissions []string) bool {
	if len(requiredPermissions) == 0 {
		return true
	}

	permissionSet := make(map[string]bool)
	for _, perm := range userPermissions {
		permissionSet[perm] = true
	}

	for _, perm := range requiredPermissions {
		if !permissionSet[perm] {
			return false
		}
	}

	return true
}

func (auth *Authenticator) LoadAuthContext() gin.HandlerFunc {
	return func(gc *gin.Context) {
		authToken := gc.Request.Header.Get("Authorization")

		switch {
		case authToken != "":
			auth.setBearerAuthContext()(gc)
		default:
			auth.setSessionAuthContext()(gc)
		}
		gc.Next()
	}
}

func (auth *Authenticator) setSessionAuthContext() gin.HandlerFunc {
	return func(gc *gin.Context) {
		tokenCookie, noCookie, err := auth.Cookiejar.Get(gc, cookies.Token)
		if noCookie {
			gc.Redirect(http.StatusFound, "/")
			gc.Abort()
			return
		}
		if err != nil {
			api.JSONErrorStatus(gc, http.StatusBadRequest, errors.New("could not get cookie"))
			gc.Abort()
			return
		}
		user, err := auth.VerifyClaims(gc, tokenCookie)
		if err != nil {
			api.JSONErrorStatus(gc, http.StatusUnauthorized, errors.New("could not map token claims"))
			gc.Abort()
			return
		}
		setContext(gc, *user)
		gc.Next()
	}
}

func (auth *Authenticator) setBearerAuthContext() gin.HandlerFunc {
	return func(gc *gin.Context) {
		authHeader := gc.Request.Header.Get("Authorization")
		if authHeader == "" {
			gc.Abort()
		}
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		if tokenString == authHeader {
			api.JSONErrorStatus(gc, http.StatusUnauthorized, errors.New("invalid authorization header format"))
			gc.Abort()
			return
		}

		user, err := auth.VerifyClaims(gc, tokenString)
		if err != nil {
			api.JSONErrorStatus(gc, http.StatusUnauthorized, errors.New("invalid bearer token"))
			gc.Abort()
			return
		}

		setContext(gc, *user)
		gc.Next()
	}
}
