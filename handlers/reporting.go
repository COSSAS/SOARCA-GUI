package handlers

import (
	"errors"
	"fmt"
	"net/http"

	"soarca-gui/backend"
	"soarca-gui/utils"
	"soarca-gui/views/components/cards"
	"soarca-gui/views/components/table"
	"soarca-gui/views/dashboards/reporting"

	"github.com/gin-gonic/gin"
)

type reportingHandler struct {
	reporter backend.Report
}

func NewReportingHandler(backend backend.Report) reportingHandler {
	return reportingHandler{reporter: backend}
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

	render := utils.NewTempl(context, http.StatusOK, cards.ReportingMetricCard(updatedCard))

	context.Render(http.StatusOK, render)
}

func (r *reportingHandler) ReportingIndexHandler(context *gin.Context) {
	render := utils.NewTempl(context, http.StatusOK,
		reporting.ReportingIndex())

	context.Render(http.StatusOK, render)
}

func (r *reportingHandler) ReportingTableCardHandler(context *gin.Context) {
	reports, _ := r.reporter.GetReports()
	var rows []table.ReportingDataTableRow

	for _, report := range reports {

		row := table.ReportingDataTableRow{
			ExecutionID: report.ExecutionId,
			StartTime:   report.Started,
			Duration:    report.Ended.Sub(report.Started),
			Status:      report.Status,
		}
		rows = append(rows, row)
	}
	formatedTable := table.ReportingTableMeta{
		Loaded:   true,
		DataRows: rows,
	}

	render := utils.NewTempl(context, http.StatusOK, table.LoadReportingTableBody(formatedTable))
	context.Render(http.StatusOK, render)
}

func (r *reportingHandler) ReportingDetailedView(context *gin.Context) {
	id := context.Param("id")
	errs := utils.Errors{}

	foundReport, err := r.reporter.GetReportsById(id)
	if err != nil {
		errs.Add("backend", err)
	}

	if foundReport.ExecutionId == "" {
		errs.Add("backend", errors.New("no Report found for ID"))
	}
	if errs.Any() {
		render := utils.NewTempl(context, http.StatusOK, reporting.ReportingDetailedView404(errs))
		context.Render(http.StatusNotFound, render)
		return
	}
	render := utils.NewTempl(context, http.StatusOK, reporting.ReportingDetailedView(foundReport))
	context.Render(http.StatusOK, render)
}
