package backend

import "soarca-gui/models/reporting"

type Backend interface {
	GetReportings() ([]reporting.PlaybookExecutionReport, error)
	GetReportingById(string) (reporting.PlaybookExecutionReport, error)
	GetPongFromStatus() (string, error)
}
