package reporting

import (
	"fmt"
	"net/http"

	"soarca-gui/models/reporting"
	utils "soarca-gui/utils"
)

const (
	reportingApiPath   = "/reporter"
	reportingApiPathId = "/reporter/:id"
)

type reportingHandler struct {
	Host string
}

func NewReportingHandler(host string) reportingHandler {
	return reportingHandler{Host: host}
}

func (r *reportingHandler) getReports() ([]reporting.PlaybookExecutionReport, error) {
	var response []reporting.PlaybookExecutionReport
	url := fmt.Sprintf("%s%s", r.Host, reportingApiPath)

	reports, err := utils.MakeJsonRequest(url, http.MethodGet, nil, response)
	if err != nil {
		return nil, err
	}
	return reports, nil
}
