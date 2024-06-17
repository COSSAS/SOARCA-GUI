package handlers

import (
	"fmt"
	"net/http"

	"soarca-gui/utils"
	"soarca-gui/views"
	"soarca-gui/views/components"
	"soarca-gui/views/dashboard/reporting"

	"github.com/gin-gonic/gin"
)

func HomeDashboard(context *gin.Context) {
	render := utils.NewTempl(context, http.StatusOK, views.Home(nil))
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
	updatedCard := components.ReportingCardData{Loaded: true,
		ID:    fmt.Sprint(id),
		Value: 10,
		Name:  "Executed Playbooks"}
	render := utils.NewTempl(context, http.StatusOK, components.ReportingCard(updatedCard))

	context.Render(http.StatusOK, render)
}
