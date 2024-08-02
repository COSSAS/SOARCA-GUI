package reporter

import (
	"time"

	"soarca-gui/models/cacao"
)

type PlaybookExecutionReport struct {
	Type            string                         `bson:"type" json:"type"`
	ExecutionId     string                         `bson:"execution_id" json:"execution_id"`
	PlaybookId      string                         `bson:"playbook_id" json:"playbook_id"`
	Started         time.Time                      `bson:"started" json:"started"`
	Ended           time.Time                      `bson:"ended" json:"ended"`
	Status          string                         `bson:"status" json:"status"`
	StatusText      string                         `bson:"status_text" json:"status_text"`
	StepResults     map[string]StepExecutionReport `bson:"step_results" json:"step_results"`
	RequestInterval int                            `bson:"request_interval" json:"request_interval"`
}

type StepExecutionReport struct {
	ExecutionId        string                    `bson:"execution_id" json:"execution_id"`
	StepId             string                    `bson:"step_id" json:"step_id"`
	Started            time.Time                 `bson:"started" json:"started"`
	Ended              time.Time                 `bson:"ended" json:"ended"`
	Status             string                    `bson:"status" json:"status"`
	StatusText         string                    `bson:"status_text" json:"status_text"`
	ExecutedBy         string                    `bson:"executed_by" json:"executed_by"`
	CommandsB64        []string                  `bson:"commands_b64" json:"commands_b64"`
	Variables          map[string]cacao.Variable `bson:"variables" json:"variables"`
	AutomatedExecution bool                      `bson:"automated_execution" json:"automated_execution"`
	// Make sure we can have a playbookID for playbook actions, and also
	// the execution ID for the invoked playbook
}
