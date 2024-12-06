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

func (r *reportingHandler) fetchReports(context *gin.Context) ([]reporter.PlaybookExecutionReport, error) {
	if r.authenticated {
		bearerToken, exists := gauth_context.GetTokenFromContext(context)
		if exists {
			return r.reporter.GetReports(bearerToken)
		}
	}
	return r.reporter.GetReports("")
}

func (r *reportingHandler) ReportingCardSectionHandler(context *gin.Context) {
	reports, err := r.fetchReports(context)
	if err != nil {
		r.renderCardSectionError(context)
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

func (r *reportingHandler) renderCardSectionError(context *gin.Context) {
	metrics := []cards.ReportingCardData{
		{Type: cards.Unkown},
		{Type: cards.Unkown},
		{Type: cards.Unkown},
	}
	render := utils.NewTempl(context, http.StatusOK, cards.ReportingMetricCards(metrics))
	context.Render(http.StatusInternalServerError, render)
}

func (r *reportingHandler) ReportingTableCardHandler(context *gin.Context) {
	reports, err := r.fetchReports(context)
	if err != nil {
		r.renderEmptyTableRow(context)
		return
	}

	rows := r.convertReportsToTableRows(reports)
	if len(rows) <= 0 {
		r.renderEmptyTableRow(context)
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

func (r *reportingHandler) ReportingIndexHandler(context *gin.Context) {
	render := utils.NewTempl(context, http.StatusOK, reporting.ReportingIndex())
	context.Render(http.StatusOK, render)
}

func (r *reportingHandler) renderEmptyTableRow(context *gin.Context) {
	render := utils.NewTempl(context, http.StatusOK, table.EmptyRow())
	context.Render(http.StatusNotFound, render)
}

func (r *reportingHandler) ReportingDetailedView(context *gin.Context) {
	id := context.Param("id")
	errs := utils.Errors{}

	foundReport, err := r.fetchReportById(context, id)

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

func (r *reportingHandler) fetchReportById(context *gin.Context, id string) (reporter.PlaybookExecutionReport, error) {
	if r.authenticated {
		bearerToken, _ := gauth_context.GetTokenFromContext(context)
		return r.reporter.GetReportsById(id, bearerToken)
	}
	return r.reporter.GetReportsById(id, "")
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
