package handlers

import (
	"fmt"
	"io"
	"net/http"

	"soarca-gui/utils"
	"soarca-gui/views/components/miscellaneous"

	"github.com/gin-gonic/gin"
)

const (
	statusPingPath = "/status/ping"
)

type statusHandler struct {
	Host string
}

func NewStatusHandler(host string) statusHandler {
	return statusHandler{Host: host}
}

func (s *statusHandler) HealthComponentHandler(context *gin.Context) {
	response, err := s.getPongFromStatus()
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

func (s *statusHandler) getPongFromStatus() (string, error) {
	response, err := http.Get(fmt.Sprintf("%s%s", s.Host, statusPingPath))
	if err != nil {
		return "", fmt.Errorf("failed to make GET request: %w", err)
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		return "", fmt.Errorf("unexpected status code: %d", response.StatusCode)
	}
	body, err := io.ReadAll(response.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response body: %w", err)
	}

	return string(body), nil
}
