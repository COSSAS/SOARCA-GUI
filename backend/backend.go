package backend

import "soarca-gui/models"

type Backend interface {
	GetReportings() ([]models.PlaybookExecutionReport, error)
	GetPongFromStatus() (string, error)
}
