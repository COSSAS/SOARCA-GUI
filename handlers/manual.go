package handlers

import (
	"net/http"
	"soarca-gui/backend"
	"soarca-gui/models/manual"

	"github.com/gin-gonic/gin"
)

type manualHandler struct {
	manual			backend.Manual
	authenticated	bool
}

func NewManualHandler(backend backend.Manual, authenticated bool) manualHandler {
	return manualHandler{
		manual:			backend,
		authenticated: 	authenticated,
	}
}

func (h *manualHandler) ManualActionsHandler(ctx *gin.Context) {
	_, err := h.manual.GetManualActions()
	if err != nil {
		return
	}
}

func (h *manualHandler) ManualContinueHandler(ctx *gin.Context) {
	var request struct {
		ExecutionID		string				`json:"execution_id"`
		PlaybookID		string				`json:"playbook_id"`
		StepID			string				`json:"step_id"`
		ResponseStatus	string				`json:"response_status"`
		ResponseOutArgs	map[string]interface{} `json:"response_out_args"`
	}

	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Convert to ManualContinueRequest
	continueRequest := manual.ManualContinueRequest{
		ExecutionID:			request.ExecutionID,
		PlaybookID:				request.PlaybookID,
		StepID:					request.StepID,
		ResponseStatus:			request.ResponseStatus,
		ResponseOutArgs:		make(map[string]interface{}),
	}

	err := h.manual.ContinueManualAction(continueRequest)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"status": "success"})
}