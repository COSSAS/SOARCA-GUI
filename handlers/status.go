package handlers

import (
	"net/http"
	"soarca-gui/backend"
	"soarca-gui/utils"
	"soarca-gui/views/components/indicators"

	"github.com/gin-gonic/gin"
)

type statusHandler struct {
	status        backend.Status
	authenticated bool
}

func NewStatusHandler(backend backend.Status, authenticated bool) statusHandler {
	return statusHandler{status: backend, authenticated: authenticated}
}

func (s *statusHandler) HealthComponentHandler(context *gin.Context) {
	response, err := s.status.GetPongFromStatus("")
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
