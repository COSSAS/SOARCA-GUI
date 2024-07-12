package handlers

import (
	"fmt"
	"net/http"

	"soarca-gui/utils"
	"soarca-gui/views/components"
	dashboard "soarca-gui/views/dashboard/home"
	"soarca-gui/views/dashboard/reporting"
	"soarca-gui/views/layouts"

	"github.com/gin-gonic/gin"
)

func ErrorPage(context *gin.Context) {
	render := utils.NewTempl(context, http.StatusOK, layouts.Error404())
	context.Render(http.StatusOK, render)
}

func HomeDashboard(context *gin.Context) {
	render := utils.NewTempl(context, http.StatusOK, dashboard.Home(nil))
	context.Render(http.StatusOK, render)
}

func ReportingDashboard(context *gin.Context) {
	render := utils.NewTempl(context, http.StatusOK,
		reporting.ReportingIndex())

	context.Render(http.StatusOK, render)
}

func ReportingCard(context *gin.Context) {
	id := context.Param("id")
	fmt.Println(id)
	updatedCard := components.ReportingCardData{
		Loaded: true,
		ID:     fmt.Sprint(id),
		Value:  10,
		Name:   "Executed Playbooks",
	}

	render := utils.NewTempl(context, http.StatusOK, components.ReportingCard(updatedCard))

	context.Render(http.StatusOK, render)
}
