package handlers

import (
	"net/http"

	"soarca-gui/utils"
	"soarca-gui/views/dashboard/settings"

	"github.com/gin-gonic/gin"
)

func SettingsDashboard(context *gin.Context) {
	render := utils.NewTempl(context, http.StatusOK, settings.SettingsIndex())
	context.Render(http.StatusOK, render)
}
