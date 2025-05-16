package backend

import (
	"soarca-gui/models/manual"
	"soarca-gui/models/reporter"
)

type Report interface {
	GetReports(bearerToken string) ([]reporter.PlaybookExecutionReport, error)
	GetReportsById(id string, bearerToken string) (reporter.PlaybookExecutionReport, error)
}

type Status interface {
	GetPongFromStatus(bearerToken string) (string, error)
}

type Manual interface {
	GetManualActions() ([]manual.ManualAction, error)
	GetManualActionsByIDs(executionID, stepID string) (*manual.ManualAction, error)
	ContinueManualAction(request manual.ManualContinueRequest) error
}