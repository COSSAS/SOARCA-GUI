package handlers

import (
	"fmt"
	"net/http"

	"soarca-gui/backend"
	"soarca-gui/utils"
	"soarca-gui/views/components/cards"
	"soarca-gui/views/dashboard/reporting"

	"github.com/gin-gonic/gin"
)

const (
	reportingApiPath   = "/reporter"
	reportingApiPathId = "/reporter/:id"
)

type reportingHandler struct {
	backend backend.Backend
}

func NewReportingHandler(backend backend.Backend) reportingHandler {
	return reportingHandler{backend: backend}
}

func ReportingDashboardHandler(context *gin.Context) {
	render := utils.NewTempl(context, http.StatusOK, reporting.ReportingIndex())

	context.Render(http.StatusOK, render)
}

func (r *reportingHandler) ReportingCardHandler(context *gin.Context) {
	id := context.Param("id")
	updatedCard := cards.ReportingCardData{
		Loaded: true,
		ID:     fmt.Sprint(id),
		Value:  10,
		Name:   "Executed Playbooks",
	}

	render := utils.NewTempl(context, http.StatusOK, cards.LoadReportingCard(updatedCard))

	context.Render(http.StatusOK, render)
}

func (r *reportingHandler) ReportingIndexHandler(context *gin.Context) {
	render := utils.NewTempl(context, http.StatusOK,
		reporting.ReportingIndex())

	context.Render(http.StatusOK, render)
}

// func (r *reportingHandler) GetReportsHandler() ([]reporting.PlaybookExecutionReport, error) {
// 	return []reporting.PlaybookExecutionReport{}, nil
// }
