package handlers

import (
	"errors"
	"net/http"
	"soarca-gui/pkg/backend"
	"soarca-gui/pkg/models/reporter"
	"soarca-gui/pkg/utils"
	"soarca-gui/pkg/views/components/cards"
	"soarca-gui/pkg/views/components/table"
	reporting_dashboard "soarca-gui/pkg/views/dashboards/reporting"

	gauth_context "github.com/COSSAS/gauth/context"
	"github.com/gin-gonic/gin"
)

type reportingHandler struct {
	reporter      backend.Report
	authenticated bool
}

func NewReportingHandler(backend backend.Report, authenticated bool) reportingHandler {
	return reportingHandler{
		reporter:      backend,
		authenticated: authenticated,
	}
}

func (reporting *reportingHandler) fetchReports(context *gin.Context) ([]reporter.PlaybookExecutionReport, error) {
	if reporting.authenticated {
		bearerToken, _ := gauth_context.GetTokenFromContext(context)
		return reporting.reporter.GetReports(bearerToken)
	}
	return reporting.reporter.GetReports("")
}

func (reporting *reportingHandler) ReportingCardSectionHandler(context *gin.Context) {
	reports, err := reporting.fetchReports(context)
	if err != nil {
		reporting.renderCardSectionError(context)
		return
	}

	metrics := []cards.ReportingCardData{
		{Type: cards.Succes, Value: countStatusType("successfully_executed", reports)},
		{Type: cards.Ongoing, Value: countStatusType("ongoing", reports)},
		{Type: cards.Failed, Value: countStatusType("failed", reports)},
	}

	render := utils.NewTempl(context, http.StatusOK, cards.ReportingMetricCards(metrics))
	context.Render(http.StatusOK, render)
}

func (reporting *reportingHandler) renderCardSectionError(context *gin.Context) {
	metrics := []cards.ReportingCardData{
		{Type: cards.Unkown},
		{Type: cards.Unkown},
		{Type: cards.Unkown},
	}
	render := utils.NewTempl(context, http.StatusOK, cards.ReportingMetricCards(metrics))
	context.Render(http.StatusInternalServerError, render)
}

func (reporting *reportingHandler) ReportingTableCardHandler(context *gin.Context) {
	reports, err := reporting.fetchReports(context)
	if err != nil {
		reporting.renderEmptyTableRow(context)
		return
	}

	rows := reporting.convertReportsToTableRows(reports)
	if len(rows) <= 0 {
		reporting.renderEmptyTableRow(context)
		return
	}

	render := utils.NewTempl(context, http.StatusOK, table.TableRows(rows))
	context.Render(http.StatusOK, render)
}

func (r *reportingHandler) convertReportsToTableRows(reports []reporter.PlaybookExecutionReport) []table.ReportingDataTableRow {
	var rows []table.ReportingDataTableRow
	for _, report := range reports {
		rows = append(rows, table.ReportingDataTableRow{
			Name:        report.Name,
			ExecutionID: report.ExecutionId,
			StartTime:   report.Started,
			Duration:    report.Ended.Sub(report.Started),
			Status:      report.Status,
		})
	}
	return rows
}

func (reporting *reportingHandler) ReportingIndexHandler(context *gin.Context) {
	render := utils.NewTempl(context, http.StatusOK, reporting_dashboard.ReportingIndex())
	context.Render(http.StatusOK, render)
}

func (reporting *reportingHandler) renderEmptyTableRow(context *gin.Context) {
	render := utils.NewTempl(context, http.StatusOK, table.EmptyRow())
	context.Render(http.StatusNotFound, render)
}

func (reporting *reportingHandler) ReportingDetailedView(context *gin.Context) {
	id := context.Param("id")
	errs := utils.Errors{}

	foundReport, err := reporting.fetchReportById(context, id)

	if foundReport.ExecutionId == "" {
		errs.Add("backend", errors.New("no report found for ID"))
	}

	if err != nil {
		errs.Add("backend", err)
	}

	if errs.Any() {
		render := utils.NewTempl(context, http.StatusOK, reporting_dashboard.ReportingDetailedView404(errs))
		context.Render(http.StatusNotFound, render)
		return
	}

	render := utils.NewTempl(context, http.StatusOK, reporting_dashboard.ReportingDetailedView(foundReport))
	context.Render(http.StatusOK, render)
}

func (reporting *reportingHandler) fetchReportById(context *gin.Context, id string) (reporter.PlaybookExecutionReport, error) {
	if reporting.authenticated {
		bearerToken, _ := gauth_context.GetTokenFromContext(context)
		return reporting.reporter.GetReportsById(id, bearerToken)
	}
	return reporting.reporter.GetReportsById(id, "")
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
