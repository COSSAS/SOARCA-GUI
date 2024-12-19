package soarca

import (
	"encoding/json"
	"fmt"
	"net/http"
	models "soarca-gui/models/manual"
)

const (
	manualPath = "/manual"
)

type Manual struct {
	Host   string
	client *http.Client
}

func NewManual(host string, client *http.Client) *Manual {
	return &Manual{Host: host, client: client}
}

func (m *Manual) GetManualActions() ([]models.ManualAction, error) {
	url := fmt.Sprintf("%s%s", m.Host, manualPath)
	var actions []models.ManualAction
	err := fetchToJson(m.client, url, &actions)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch manual actions: %w", err)
	}
	return actions, nil
}

func (m *Manual) GetManualActionByIDs(executionID, stepID string) (*models.ManualAction, error) {
	url := fmt.Sprintf("%s%s/%s/%s", m.Host, manualPath, executionID, stepID)
	var action models.ManualAction
	err := fetchToJson(m.client, url, &action)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch manual action: %w", err)
	}
	return &action, nil
}

func (m *Manual) ContinueManualAction(request models.ManualContinueRequest) error {
	url := fmt.Sprintf("%s%s/continue", m.Host, manualPath)

	jsonData, err := json.Marshal(request)
	if err != nil {
		return fmt.Errorf("failed to marshal continue request: %w", err)
	}

	err = postJson(url, &request)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch manual action: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	return nil
}
