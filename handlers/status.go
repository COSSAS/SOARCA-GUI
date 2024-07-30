package handlers

import (
	"net/http"

	"soarca-gui/backend"
	"soarca-gui/utils"
	"soarca-gui/views/components/miscellaneous"

	"github.com/gin-gonic/gin"
)

type statusHandler struct {
	backend backend.Backend
}

func NewStatusHandler(backend backend.Backend) statusHandler {
	return statusHandler{backend: backend}
}

func (s *statusHandler) HealthComponentHandler(context *gin.Context) {
	response, err := s.backend.GetPongFromStatus()
	indicatorData := miscellaneous.HealthIndicatorData{Loaded: true}

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

	render := utils.NewTempl(context, http.StatusOK, miscellaneous.HealthIndicator(indicatorData))
	context.Render(http.StatusOK, render)
}
