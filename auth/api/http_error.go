package api

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

type HTTPError struct {
	Status   int
	Internal error
}

func (e *HTTPError) Error() string {
	return fmt.Sprintf("HTTPError(%d): %s", e.Status, e.Internal)
}

func (e *HTTPError) Unwrap() error {
	return e.Internal
}

func JSONError(c *gin.Context, err error) {
	JSONErrorStatus(c, http.StatusInternalServerError, err)
}

func JSONErrorStatus(c *gin.Context, status int, err error) {
	log.Println("JSONErrorStatus", status, err)

	c.JSON(status, gin.H{
		"error": err.Error(),
	})
}
