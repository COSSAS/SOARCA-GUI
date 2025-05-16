package soarca

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const (
	// timeout time.Duration = 500
	timeout time.Duration = 5000
)

func fetchToJson(client *http.Client, url string, target interface{}, modifyRequest func(*http.Request)) error {
	ctx, cancel := context.WithTimeout(context.Background(), timeout*time.Millisecond)
	defer cancel()

	body, err := fetch(ctx, client, url, modifyRequest)
	if err != nil {
		return fmt.Errorf("fetch failed: %w", err)
	}

	err = json.Unmarshal(body, target)
	if err != nil {
		return fmt.Errorf("failed to unmarshal JSON object: %w", err)
	}

	return nil
}

func fetch(ctx context.Context, client *http.Client, url string, modifyRequest func(*http.Request)) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	if modifyRequest != nil {
		modifyRequest(req)
	}

	response, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make GET request: %w", err)
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code: %d", response.StatusCode)
	}

	body, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	if len(body) == 0 {
		return nil, fmt.Errorf("empty response body")
	}

	return body, nil
}

func postJson(client *http.Client, url string, payload interface{}) error {
	ctx, cancel := context.WithTimeout(context.Background(), timeout*time.Millisecond)
	defer cancel()

	return postJsonWithContext(ctx, client, url, payload)
}

func postJsonWithContext(ctx context.Context, client *http.Client, url string, payload interface{}) error {
	jsonData, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal payload: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	response, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to make POST request: %w", err)
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(response.Body)
		return fmt.Errorf("unexpected status code: %d, body: %s", response.StatusCode, string(body))
	}

	return nil
}