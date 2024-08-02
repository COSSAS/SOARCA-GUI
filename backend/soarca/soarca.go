package soarca

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"soarca-gui/models/reporting"
)

const (
	statusPingPath    = "/status/ping"
	reporterPath      = "/reporter"
	reporterApiPathId = "/reporter/:id"
)

type Soarca struct {
	Host   string
	client http.Client
}

func New(host string, client http.Client) *Soarca {
	return &Soarca{Host: host, client: client}
}

func (soarca *Soarca) GetPongFromStatus() (string, error) {
	url := fmt.Sprintf("%s%s", soarca.Host, statusPingPath)

	body, err := soarca.fetch(url)
	if err != nil {
		return "", fmt.Errorf("failed to read response body: %w", err)
	}

	return string(body), nil
}

func (soarca *Soarca) GetReports() ([]reporting.PlaybookExecutionReport, error) {
	url := fmt.Sprintf("%s%s", soarca.Host, reporterPath)

	var reportings []reporting.PlaybookExecutionReport
	err := soarca.fetchToJson(url, &reportings)
	if err != nil {
		return nil, err
	}

	return reportings, nil
}

func (soarca *Soarca) GetReportsById(Id string) (reporting.PlaybookExecutionReport, error) {
	url := fmt.Sprintf("%s%s/%s", soarca.Host, reporterApiPathId, Id)
	var report reporting.PlaybookExecutionReport

	err := soarca.fetchToJson(url, &report)
	if err != nil {
		return reporting.PlaybookExecutionReport{}, err
	}
	return report, nil
}

func (soarca *Soarca) fetchToJson(url string, target interface{}) error {
	body, err := soarca.fetch(url)
	if err != nil {
		return err
	}
	err = json.Unmarshal(body, target)
	if err != nil {
		return fmt.Errorf("failed to unmarshal JSON object: %w", err)
	}
	return nil
}

func (soarca *Soarca) fetch(url string) ([]byte, error) {
	response, err := soarca.client.Get(url)
	if err != nil {
		return []byte{}, fmt.Errorf("failed to make GET request: %w", err)
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		return []byte{}, fmt.Errorf("unexpected status code: %d", response.StatusCode)
	}

	body, err := io.ReadAll(response.Body)
	if err != nil {
		return []byte{}, fmt.Errorf("failed to read response body: %w", err)
	}

	if len(body) == 0 {
		return []byte{}, fmt.Errorf("empty response body")
	}
	return body, nil
}
