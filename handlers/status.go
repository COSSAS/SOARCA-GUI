package handlers

import (
	"fmt"
	"io"
	"net/http"
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

func HealthHandler() {
	// id := context.Param("id")
	// fmt.Println(id)
	// updatedCard := components.ReportingCardData{
	// 	Loaded: true,
	// 	ID:     fmt.Sprint(id),
	// 	Value:  10,
	// 	Name:   "Executed Playbooks",
	// }
	// render := utils.NewTempl(context, http.StatusOK, components.ReportingCard(updatedCard))

	// context.Render(http.StatusOK, render)
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
