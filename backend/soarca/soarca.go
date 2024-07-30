package soarca

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"soarca-gui/models"
)

const (
	statusPingPath = "/status/ping"
	reportingPath  = "/reporter"
)

type SoarcaBackend struct {
	Host string
}

func NewSoarcaBackend(host string) *SoarcaBackend {
	return &SoarcaBackend{Host: host}
}

func (s *SoarcaBackend) GetPongFromStatus() (string, error) {
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

func (s *SoarcaBackend) GetReportings() ([]models.PlaybookExecutionReport, error) {
	response, err := http.Get(fmt.Sprintf("%s%s", s.Host, reportingPath))
	if err != nil {
		return []models.PlaybookExecutionReport{}, fmt.Errorf("failed to make GET request: %w", err)
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		return []models.PlaybookExecutionReport{}, fmt.Errorf("unexpected status code: %d", response.StatusCode)
	}
	body, err := io.ReadAll(response.Body)
	if err != nil {
		return []models.PlaybookExecutionReport{}, fmt.Errorf("failed to read response body: %w", err)
	}
	var reportings []models.PlaybookExecutionReport
	err = json.Unmarshal(body, &reportings)
	if err != nil {
		return []models.PlaybookExecutionReport{}, fmt.Errorf("failed to marshall json object: %w", err)
	}
	return reportings, nil
}

func (s *SoarcaBackend) GetReportingById(Id string) (models.PlaybookExecutionReport, error) {
	response, err := http.Get(fmt.Sprintf("%s%s/%s", s.Host, reportingPath, Id))
	if err != nil {
		return models.PlaybookExecutionReport{}, fmt.Errorf("failed to make GET request: %w", err)
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		return models.PlaybookExecutionReport{}, fmt.Errorf("unexpected status code: %d", response.StatusCode)
	}
	body, err := io.ReadAll(response.Body)
	if err != nil {
		return models.PlaybookExecutionReport{}, fmt.Errorf("failed to read response body: %w", err)
	}
	var reporting models.PlaybookExecutionReport

	err = json.Unmarshal(body, &reporting)
	if err != nil {
		return models.PlaybookExecutionReport{}, fmt.Errorf("failed to marshall json object: %w", err)
	}
	return reporting, nil
}
