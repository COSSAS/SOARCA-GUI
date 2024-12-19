package manual

type ManualAction struct {
	ExecutionStatus string                 `json:"execution-status"`
	ExecutionID     string                 `json:"execution_id"`
	PlaybookID      string                 `json:"playbook_id"`
	StepID          string                 `json:"step_id"`
	Description     string                 `json:"description"`
	Command         string                 `json:"command"`
	CommandIsBase64 bool                   `json:"command_is_base64"`
	Targets         map[string]interface{} `json:"targets"`
	OutArgs         map[string]interface{} `json:"out_args"`
}

type ManualContinueRequest struct {
	ExecutionStatus string                 `json:"execution-status"`
	ExecutionID     string                 `json:"execution_id"`
	PlaybookID      string                 `json:"playbook_id"`
	StepID          string                 `json:"step_id"`
	ResponseStatus  string                 `json:"response_status"`
	ResponseOutArgs map[string]interface{} `json:"response_out_args"`
}
