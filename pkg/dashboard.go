package handlers

import (
	"net/http"
	"soarca-gui/utils"
	"soarca-gui/views/dashboards/home"
	"soarca-gui/views/layouts"

	auth_context "github.com/COSSAS/gauth/context"
	"github.com/gin-gonic/gin"
)

func ErrorPage(context *gin.Context) {
	render := utils.NewTempl(context, http.StatusOK, layouts.Error404())
	context.Render(http.StatusOK, render)
}

func HomeDashboard(context *gin.Context) {
	var username string
	user, ok := auth_context.GetUserFromContext(context)

	if ok {
		if len(user.Username) > 20 {
			username = user.Username[:20] + "..."
		} else {
			username = user.Username
		}
	} else {
		username = "Unknown"
	}

	render := utils.NewTempl(context, http.StatusOK, home.Home(nil, username))
	context.Render(http.StatusOK, render)
}
