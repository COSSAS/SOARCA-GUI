package handlers

import (
	"net/http"

	"soarca-gui/pkg/utils"
	"soarca-gui/pkg/views/dashboards/settings"

	"github.com/gin-gonic/gin"
)

func SettingsDashboard(context *gin.Context) {
	render := utils.NewTempl(context, http.StatusOK, settings.SettingsIndex())
	context.Render(http.StatusOK, render)
}
