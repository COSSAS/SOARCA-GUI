package auth

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func CallBackHandler(g gin.Context) {
	state, err := context.Cookie("state")
	if err != nil {
		g.JSON(http.StatusInternalServerError, gin.H{"error:", "state missing"})
	}
}
