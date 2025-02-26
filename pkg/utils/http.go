package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

func MakeJsonRequest[T any](url string, method string, requestBody interface{}, responseStruct T) (T, error) {
	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return responseStruct, fmt.Errorf("failed to marshal request body: %w", err)
	}

	req, err := http.NewRequest(method, url, bytes.NewBuffer(jsonData))
	if err != nil {
		return responseStruct, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{}

	resp, err := client.Do(req)
	if err != nil {
		return responseStruct, fmt.Errorf("failed to send request: %w", err)
	}

	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return responseStruct, fmt.Errorf("failed to read response body: %w", err)
	}

	err = json.Unmarshal(body, &responseStruct)
	if err != nil {
		return responseStruct, fmt.Errorf("failed to unmarshal response body: %w", err)
	}

	return responseStruct, nil
}
