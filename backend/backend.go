package backend

import "soarca-gui/models/reporter"

type Report interface {
	GetReports(bearerToken string) ([]reporter.PlaybookExecutionReport, error)
	GetReportsById(id string, bearerToken string) (reporter.PlaybookExecutionReport, error)
}

type Status interface {
	GetPongFromStatus(bearerToken string) (string, error)
}
