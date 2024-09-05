package soarca

import (
	"context"
	"fmt"
	"net/http"
	"time"
)

type Status struct {
	Host   string
	client *http.Client
}

func NewStatus(host string, client *http.Client) *Status {
	return &Status{Host: host, client: client}
}

func (status *Status) GetPongFromStatus() (string, error) {
	url := fmt.Sprintf("%s%s", status.Host, statusPingPath)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	body, err := fetch(ctx, status.client, url)
	if err != nil {
		return "", fmt.Errorf("failed to read response body: %w", err)
	}

	return string(body), nil
}
