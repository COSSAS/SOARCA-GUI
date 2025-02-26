package soarca

import (
	"fmt"
	"net/http"
	"soarca-gui/pkg/models/reporter"
)

const (
	reporterPath = "/reporter"
)

type Report struct {
	Host           string
	client         *http.Client
	authentication bool
}

func NewReport(host string, client *http.Client, authentication bool) *Report {
	return &Report{Host: host, client: client, authentication: authentication}
}

func (report *Report) GetReports(bearerToken string) ([]reporter.PlaybookExecutionReport, error) {
	url := fmt.Sprintf("%s%s", report.Host, reporterPath)
	var reportings []reporter.PlaybookExecutionReport

	err := fetchToJson(report.client, url, &reportings, func(req *http.Request) {
		if bearerToken != "" {
			req.Header.Add("Authorization", "Bearer "+bearerToken)
		}
	})
	if err != nil {
		return nil, err
	}
	return reportings, nil
}

func (report *Report) GetReportsById(Id, bearerToken string) (reporter.PlaybookExecutionReport, error) {
	url := fmt.Sprintf("%s%s/%s", report.Host, reporterPath, Id)
	var returnReport reporter.PlaybookExecutionReport

	err := fetchToJson(report.client, url, &returnReport, func(req *http.Request) {
		if bearerToken != "" {
			req.Header.Add("Authorization", "Bearer "+bearerToken)
		}
	})
	if err != nil {
		return reporter.PlaybookExecutionReport{}, err
	}
	return returnReport, nil
}
