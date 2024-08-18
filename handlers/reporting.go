package handlers

import (
	"errors"
	"net/http"

	"soarca-gui/backend"
	"soarca-gui/models/reporter"
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

func (r *reportingHandler) ReportingIndexHandler(context *gin.Context) {
	render := utils.NewTempl(context, http.StatusOK, reporting.ReportingIndex())
	context.Render(http.StatusOK, render)
}

func (r *reportingHandler) ReportingCardSectionHandler(context *gin.Context) {

	reports, _ := r.reporter.GetReports()
	succesCount := countStatusType("successfully_executed", reports)
	ongoingCount := countStatusType("ongoing", reports)
	failedCount := countStatusType("failed", reports)

	metrics := []cards.ReportingCardData{
		cards.ReportingCardData{Type: cards.Succes, Value: succesCount},
		cards.ReportingCardData{Type: cards.Ongoing, Value: ongoingCount},
		cards.ReportingCardData{Type: cards.Failed, Value: failedCount},
	}
	render := utils.NewTempl(context, http.StatusOK, cards.ReportingMetricCards(metrics))
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

	if len(rows) <= 0 {
		render := utils.NewTempl(context, http.StatusOK, table.EmptyRow())
		context.Render(http.StatusNotFound, render)
		return
	}

	render := utils.NewTempl(context, http.StatusOK, table.TableRows(rows))
	context.Render(http.StatusOK, render)
}

func (r *reportingHandler) ReportingDetailedView(context *gin.Context) {
	id := context.Param("id")
	errs := utils.Errors{}

	foundReport, err := r.reporter.GetReportsById(id)
	if foundReport.ExecutionId == "" {
		errs.Add("backend", errors.New("no report found for ID"))
	}
	if err != nil {
		errs.Add("backend", err)
	}

	if errs.Any() {
		render := utils.NewTempl(context, http.StatusOK, reporting.ReportingDetailedView404(errs))
		context.Render(http.StatusNotFound, render)
		return
	}
	render := utils.NewTempl(context, http.StatusOK, reporting.ReportingDetailedView(foundReport))
	context.Render(http.StatusOK, render)
}

func countStatusType(status string, reports []reporter.PlaybookExecutionReport) int {
	count := 0
	for _, report := range reports {
		if report.Status == status {
			count++
		}
	}
	return count
}
