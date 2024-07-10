package utils_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"soarca-gui/utils"
)

type RequestBody struct {
	Message string `json:"message"`
}
type ResponseBody struct {
	Status string `json:"status"`
}

func MockHTTPJsonServer(responseBody RequestBody) *httptest.Server {
	testServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var reqBody RequestBody
		err := json.NewDecoder(r.Body).Decode(&reqBody)
		if err != nil {
			http.Error(w, "Bad request", http.StatusBadRequest)
			return
		}

		if reqBody.Message != "test message" {
			http.Error(w, "Incorrect request body", http.StatusBadRequest)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(responseBody)
	}))

	return testServer
}

func TestMakeJsonRequest(t *testing.T) {
	reqBody := RequestBody{
		Message: "test message",
	}

	respBody := ResponseBody{
		Status: "success",
	}

	testServer := MockHTTPJsonServer(reqBody)
	defer testServer.Close()

	respBody, err := utils.MakeJsonRequest(testServer.URL, http.MethodGet, reqBody, respBody)
	if err != nil {
		t.Fatalf("MakeJsonRequest returned an error: %v", err)
	}

	if respBody.Status != "success" {
		t.Errorf("Expected response status 'success', got '%s'", respBody.Status)
	}
}
