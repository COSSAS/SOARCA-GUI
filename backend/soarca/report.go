package soarca

import (
	"fmt"
	"net/http"

	"soarca-gui/models/reporter"
)

const (
	statusPingPath = "/status/ping"
	reporterPath   = "/reporter"
)

type Report struct {
	Host   string
	client *http.Client
}

func NewReport(host string, client *http.Client) *Report {
	return &Report{Host: host, client: client}
}

func (report *Report) GetReports() ([]reporter.PlaybookExecutionReport, error) {
	url := fmt.Sprintf("%s%s", report.Host, reporterPath)

	var reportings []reporter.PlaybookExecutionReport
	err := fetchToJson(report.client, url, &reportings)
	if err != nil {
		return nil, err
	}

	return reportings, nil
}

func (report *Report) GetReportsById(Id string) (reporter.PlaybookExecutionReport, error) {
	url := fmt.Sprintf("%s%s/%s", report.Host, reporterPath, Id)
	var returnReport reporter.PlaybookExecutionReport

	err := fetchToJson(report.client, url, &returnReport)
	if err != nil {
		return reporter.PlaybookExecutionReport{}, err
	}
	return returnReport, nil
}
