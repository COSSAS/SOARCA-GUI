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

	"github.com/stretchr/testify/assert"
)

type TestData struct {
	Name  string `json:"name"`
	Value int    `json:"value"`
}

func TestFetchToJsonSuccessful(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		err := json.NewEncoder(w).Encode(TestData{Name: "test", Value: 123})
		if err != nil {
			t.Fatalf("could not encode json: %v", err)
		}
	}))
	defer server.Close()

	client := &http.Client{Timeout: 1 * time.Second}
	var result TestData
	err := fetchToJson(client, server.URL, &result)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	expected := TestData{Name: "test", Value: 123}
	if !reflect.DeepEqual(result, expected) {
		t.Errorf("expected data %+v, got %+v", expected, result)
	}
}

func TestFetchToJsonNon200StatusCode(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNotFound)
	}))
	defer server.Close()

	client := &http.Client{Timeout: 1 * time.Second}
	var result TestData
	err := fetchToJson(client, server.URL, &result)

	expectedErrMsg := "fetch failed: unexpected status code: 404"
	if err == nil {
		t.Fatalf("expected error containing %q, got nil", expectedErrMsg)
	}
	if !strings.Contains(err.Error(), expectedErrMsg) {
		t.Errorf("expected error containing %q, got %q", expectedErrMsg, err.Error())
	}
}

func TestFetchToJsonInvalidJSON(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, err := w.Write([]byte("Success"))
		if err != nil {
			t.Fatalf("Failed to write response: %v", err)
		}
	}))
	defer server.Close()

	client := &http.Client{Timeout: 1 * time.Second}
	var result TestData
	err := fetchToJson(client, server.URL, &result)

	expectedErrMsg := "failed to unmarshal JSON object"
	if err == nil {
		t.Fatalf("expected error containing %q, got nil", expectedErrMsg)
	}
	if !strings.Contains(err.Error(), expectedErrMsg) {
		t.Errorf("expected error containing %q, got %q", expectedErrMsg, err.Error())
	}
}

func TestFetchToJsonEmptyResponseBody(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	client := &http.Client{Timeout: 1 * time.Second}
	var result TestData
	err := fetchToJson(client, server.URL, &result)

	expectedErrMsg := "fetch failed: empty response body"
	if err == nil {
		t.Fatalf("expected error containing %q, got nil", expectedErrMsg)
	}
	if !strings.Contains(err.Error(), expectedErrMsg) {
		t.Errorf("expected error containing %q, got %q", expectedErrMsg, err.Error())
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

func TestFetchSuccessful(t *testing.T) {
	checkBody := "Success"
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, err := w.Write([]byte(checkBody))
		if err != nil {
			t.Fatalf("Failed to write response: %v", err)
		}
	}))
	defer server.Close()

	client := server.Client()
	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Millisecond)
	defer cancel()

	body, err := fetch(ctx, client, server.URL)

	assert.Nil(t, err, "expected no error, got %v", err)
	assert.Equal(t, checkBody, string(body), "expected body to be 'Success', got %v", string(body))
}

func TestFetchEmptyResponseBody(t *testing.T) {
	expectedErrMsg := "empty response body"

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	client := server.Client()
	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Millisecond)
	defer cancel()

	body, err := fetch(ctx, client, server.URL)

	assert.NotNil(t, err, "expected an error, got nil")
	assert.Contains(t, err.Error(), expectedErrMsg, "expected error message to contain %q, got %q", expectedErrMsg, err.Error())
	assert.Empty(t, body, "expected body to be empty, got %v", string(body))
}

func TestFetchContextTimeout(t *testing.T) {
	expectedErrMsg := "context deadline exceeded"

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		time.Sleep(200 * time.Millisecond) // Simulate a delay to trigger context timeout
		w.WriteHeader(http.StatusOK)
		_, err := w.Write([]byte("Too late"))
		if err != nil {
			t.Fatalf("Failed to write response: %v", err)
		}
	}))
	defer server.Close()

	client := server.Client()
	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Millisecond) // Short timeout to trigger context timeout
	defer cancel()

	body, err := fetch(ctx, client, server.URL)

	assert.NotNil(t, err, "expected an error, got nil")
	assert.Contains(t, err.Error(), expectedErrMsg, "expected error message to contain %q, got %q", expectedErrMsg, err.Error())
	assert.Empty(t, body, "expected body to be empty, got %v", string(body))
}
