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

func TestMakeJsonRequest(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
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

		respBody := ResponseBody{
			Status: "success",
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(respBody)
	}))
	defer ts.Close()

	reqBody := RequestBody{
		Message: "test message",
	}

	var respBody ResponseBody
	respBody, err := utils.MakeJsonRequest(ts.URL, http.MethodPost, reqBody, respBody)
	if err != nil {
		t.Fatalf("MakeJsonRequest returned an error: %v", err)
	}

	if respBody.Status != "success" {
		t.Errorf("Expected response status 'success', got '%s'", respBody.Status)
	}
}
