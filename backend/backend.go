package backend

import "soarca-gui/models/reporter"

type Report interface {
	GetReports() ([]reporter.PlaybookExecutionReport, error)
	GetReportsById(string) (reporter.PlaybookExecutionReport, error)
}

type Status interface {
	GetPongFromStatus() (string, error)
}
