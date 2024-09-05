package soarca

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"reflect"
	"strings"
	"testing"
	"time"
)

type TestData struct {
	Name  string `json:"name"`
	Value int    `json:"value"`
}

func TestFetchToJson(t *testing.T) {
	tests := []struct {
		name           string
		setupServer    func() *httptest.Server
		expectedData   *TestData
		expectedErrMsg string
	}{
		{
			name: "Successful fetch and unmarshal",
			setupServer: func() *httptest.Server {
				return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
					w.Header().Set("Content-Type", "application/json")
					w.WriteHeader(http.StatusOK)
					json.NewEncoder(w).Encode(TestData{Name: "test", Value: 123})
				}))
			},
			expectedData: &TestData{Name: "test", Value: 123},
		},
		{
			name: "Non-200 status code",
			setupServer: func() *httptest.Server {
				return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
					w.WriteHeader(http.StatusNotFound)
				}))
			},
			expectedErrMsg: "fetch failed: unexpected status code: 404",
		},
		{
			name: "Invalid JSON",
			setupServer: func() *httptest.Server {
				return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
					w.Header().Set("Content-Type", "application/json")
					w.WriteHeader(http.StatusOK)
					_, err := w.Write([]byte("Success"))
					if err != nil {
						t.Fatalf("Failed to write response: %v", err)
					}
				}))
			},
			expectedErrMsg: "failed to unmarshal JSON object",
		},
		{
			name: "Empty response body",
			setupServer: func() *httptest.Server {
				return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
					w.WriteHeader(http.StatusOK)
				}))
			},
			expectedErrMsg: "fetch failed: empty response body",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			server := tt.setupServer()
			defer server.Close()

			client := &http.Client{
				Timeout: 1 * time.Second, // Set a short timeout for the client
			}

			var result TestData
			err := fetchToJson(client, server.URL, &result)

			if tt.expectedErrMsg != "" {
				if err == nil {
					t.Fatalf("expected error containing %q, got nil", tt.expectedErrMsg)
				}
				if !strings.Contains(err.Error(), tt.expectedErrMsg) {
					t.Errorf("expected error containing %q, got %q", tt.expectedErrMsg, err.Error())
				}
			} else {
				if err != nil {
					t.Fatalf("unexpected error: %v", err)
				}
				if tt.expectedData != nil && !reflect.DeepEqual(result, *tt.expectedData) {
					t.Errorf("expected data %+v, got %+v", *tt.expectedData, result)
				}
			}
		})
	}
}

func TestFetchToJsonInvalidURL(t *testing.T) {
	client := &http.Client{}
	var result TestData
	err := fetchToJson(client, "invalid-url", &result)
	if err == nil {
		t.Fatal("expected error for invalid URL, got nil")
	}
	if !strings.Contains(err.Error(), "fetch failed") {
		t.Errorf("expected error to contain 'fetch failed', got %q", err.Error())
	}
}

func TestFetch(t *testing.T) {
	tests := []struct {
		name           string
		setupServer    func() *httptest.Server
		expectedBody   string
		expectedErrMsg string
	}{
		{
			name: "Successful fetch",
			setupServer: func() *httptest.Server {
				return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
					w.WriteHeader(http.StatusOK)
					_, err := w.Write([]byte("Success"))
					if err != nil {
						t.Fatalf("Failed to write response: %v", err)
					}
				}))
			},
			expectedBody: "Success",
		},
		{
			name: "Non-200 status code",
			setupServer: func() *httptest.Server {
				return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
					w.WriteHeader(http.StatusNotFound)
				}))
			},
			expectedErrMsg: "unexpected status code: 404",
		},
		{
			name: "Empty response body",
			setupServer: func() *httptest.Server {
				return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
					w.WriteHeader(http.StatusOK)
				}))
			},
			expectedErrMsg: "empty response body",
		},
		{
			name: "Context timeout",
			setupServer: func() *httptest.Server {
				return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
					time.Sleep(200 * time.Millisecond)
					w.WriteHeader(http.StatusOK)
					_, err := w.Write([]byte("Too late"))
					if err != nil {
						t.Fatalf("Failed to write response: %v", err)
					}
				}))
			},
			expectedErrMsg: "context deadline exceeded",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			server := tt.setupServer()
			defer server.Close()

			client := server.Client()
			ctx, cancel := context.WithTimeout(context.Background(), 100*time.Millisecond)
			defer cancel()

			body, err := fetch(ctx, client, server.URL)

			if tt.expectedErrMsg != "" {
				if err == nil {
					t.Fatalf("expected error containing %q, got nil", tt.expectedErrMsg)
				}
				if !strings.Contains(err.Error(), tt.expectedErrMsg) {
					t.Errorf("expected error containing %q, got %q", tt.expectedErrMsg, err.Error())
				}
			} else {
				if err != nil {
					t.Fatalf("unexpected error: %v", err)
				}
				if string(body) != tt.expectedBody {
					t.Errorf("expected body %q, got %q", tt.expectedBody, string(body))
				}
			}
		})
	}
}
