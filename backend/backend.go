package backend

import "soarca-gui/models/reporting"

type Backend interface {
	GetReports() ([]reporting.PlaybookExecutionReport, error)
	GetReportsById(string) (reporting.PlaybookExecutionReport, error)
	GetPongFromStatus() (string, error)
}
