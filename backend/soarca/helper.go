package soarca

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

func fetchToJson(client http.Client, url string, target interface{}) error {
	body, err := fetch(client, url)
	if err != nil {
		return err
	}
	err = json.Unmarshal(body, target)
	if err != nil {
		return fmt.Errorf("failed to unmarshal JSON object: %w", err)
	}
	return nil
}

func fetch(client http.Client, url string) ([]byte, error) {
	response, err := client.Get(url)
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
