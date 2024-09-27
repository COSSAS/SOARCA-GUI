package auth

import "github.com/gin-gonic/gin"

func (auth *Authenticator) Middelware(permissions ...string) gin.HandlerFunc {
	return func(gc *gin.Context) {
		return
	}
}
