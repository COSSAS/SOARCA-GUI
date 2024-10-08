package handlers

import (
	"net/http"
	"soarca-gui/utils"
	"soarca-gui/views/dashboards/home"
	"soarca-gui/views/layouts"

	"github.com/gin-gonic/gin"
)

func ErrorPage(context *gin.Context) {
	render := utils.NewTempl(context, http.StatusOK, layouts.Error404())
	context.Render(http.StatusOK, render)
}

func HomeDashboard(context *gin.Context) {
	render := utils.NewTempl(context, http.StatusOK, home.Home(nil))
	context.Render(http.StatusOK, render)
}
