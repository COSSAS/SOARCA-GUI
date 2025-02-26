package handlers

import (
	"net/http"
	"soarca-gui/pkg/backend"
	"soarca-gui/pkg/utils"
	"soarca-gui/pkg/views/components/indicators"

	gauth_context "github.com/COSSAS/gauth/context"
	"github.com/gin-gonic/gin"
)

type statusHandler struct {
	status        backend.Status
	authenticated bool
}

func NewStatusHandler(backend backend.Status, authenticated bool) statusHandler {
	return statusHandler{status: backend, authenticated: authenticated}
}

func (status *statusHandler) fetchStatus(context *gin.Context) (string, error) {
	if status.authenticated {
		bearerToken, _ := gauth_context.GetTokenFromContext(context)
		return status.status.GetPongFromStatus(bearerToken)
	}
	return status.status.GetPongFromStatus("")
}

func (status *statusHandler) HealthComponentHandler(context *gin.Context) {
	response, err := status.fetchStatus(context)
	indicatorData := indicators.HealthIndicatorData{Loaded: true}

	switch {
	case err != nil:
		indicatorData.Healthy = false
		indicatorData.Message = "error on backend call"
	case response == "pong":
		indicatorData.Healthy = true
		indicatorData.Message = "connected"
	default:
		indicatorData.Healthy = false
		indicatorData.Message = "wrong msg backend"
	}

	render := utils.NewTempl(context, http.StatusOK, indicators.HealthIndicator(indicatorData))
	context.Render(http.StatusOK, render)
}
