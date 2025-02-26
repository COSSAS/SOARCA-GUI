package soarca

import (
	"context"
	"fmt"
	"net/http"
	"time"
)

const statusPingPath = "/status/ping"

type Status struct {
	Host           string
	client         *http.Client
	authentication bool
}

func NewStatus(host string, client *http.Client, authentication bool) *Status {
	return &Status{Host: host, client: client, authentication: authentication}
}

func (status *Status) GetPongFromStatus(bearerToken string) (string, error) {
	url := fmt.Sprintf("%s%s", status.Host, statusPingPath)
	ctx, cancel := context.WithTimeout(context.Background(), 1000*time.Millisecond)
	defer cancel()

	var body []byte
	var err error
	if status.authentication {
		body, err = fetch(ctx, status.client, url, func(req *http.Request) {
			if bearerToken != "" {
				req.Header.Add("Authorization", "Bearer "+bearerToken)
			}
		})
	} else {
		body, err = fetch(ctx, status.client, url, nil)
	}

	if err != nil {
		return "", fmt.Errorf("failed to read response body: %w", err)
	}

	return string(body), nil
}
