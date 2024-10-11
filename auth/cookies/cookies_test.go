package cookies

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

const (
	testSecretKey     = "53481928395695659701516098079887"
	testEncryptionKey = "75757536457839383375666084204512"
)

func setupTest() (*CookieJar, *gin.Context, *httptest.ResponseRecorder) {
	cookieJar := NewCookieJar([]byte(testSecretKey), []byte(testEncryptionKey))
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest(http.MethodGet, "/", nil)
	return cookieJar, c, w
}

func TestSetCallBackState(t *testing.T) {
	cookieJar, c, w := setupTest()

	stateCookie, err := NewCookie(State, "test-state")
	assert.NoError(t, err)

	err = cookieJar.Store(c, stateCookie)
	assert.NoError(t, err)

	cookies := w.Result().Cookies()
	assert.NotEmpty(t, cookies, "Expected cookies to be set in the response")

	newRequest, _ := http.NewRequest(http.MethodGet, "/", nil)
	for _, cookie := range cookies {
		newRequest.AddCookie(cookie)
	}

	newWriter := httptest.NewRecorder()
	newContext, _ := gin.CreateTestContext(newWriter)
	newContext.Request = newRequest

	value, isNew, err := cookieJar.Get(newContext, State)
	assert.NoError(t, err)
	assert.False(t, isNew, "Expected existing state session")
	assert.Equal(t, "test-state", value, "Expected the state value to match 'test-state'")
}

func TestSetCallBackNonce(t *testing.T) {
	cookieJar, c, w := setupTest()

	nonceCookie, err := NewCookie(Nonce, "test-nonce")
	assert.NoError(t, err)

	err = cookieJar.Store(c, nonceCookie)
	assert.NoError(t, err)

	cookies := w.Result().Cookies()
	assert.NotEmpty(t, cookies, "Expected cookies to be set in the response")

	newRequest, _ := http.NewRequest(http.MethodGet, "/", nil)
	for _, cookie := range cookies {
		newRequest.AddCookie(cookie)
	}

	newWriter := httptest.NewRecorder()
	newContext, _ := gin.CreateTestContext(newWriter)
	newContext.Request = newRequest

	value, isNew, err := cookieJar.Get(newContext, Nonce)
	assert.NoError(t, err)
	assert.False(t, isNew, "Expected existing nonce session")
	assert.Equal(t, "test-nonce", value, "Expected the nonce value to match 'test-nonce'")
}

func TestGetStateSession(t *testing.T) {
	cookieJar, c, w := setupTest()

	// Test with no existing state
	value, isNew, err := cookieJar.Get(c, State)
	assert.NoError(t, err)
	assert.True(t, isNew)
	assert.Empty(t, value)

	// Set a state
	stateCookie, err := NewCookie(State, "test-state")
	assert.NoError(t, err)
	err = cookieJar.Store(c, stateCookie)
	assert.NoError(t, err)

	cookies := w.Result().Cookies()
	assert.NotEmpty(t, cookies)

	newRequest, _ := http.NewRequest(http.MethodGet, "/", nil)
	for _, cookie := range cookies {
		newRequest.AddCookie(cookie)
	}
	newWriter := httptest.NewRecorder()
	newContext, _ := gin.CreateTestContext(newWriter)
	newContext.Request = newRequest

	value, isNew, err = cookieJar.Get(newContext, State)
	assert.NoError(t, err)
	assert.False(t, isNew)
	assert.Equal(t, "test-state", value)
}

func TestGetUserToken(t *testing.T) {
	cookieJar, c, w := setupTest()

	// Test with no existing token
	value, isNew, err := cookieJar.Get(c, Token)
	assert.NoError(t, err)
	assert.True(t, isNew)
	assert.Empty(t, value)

	// Set a token
	tokenCookie, err := NewCookie(Token, "test-token")
	assert.NoError(t, err)
	err = cookieJar.Store(c, tokenCookie)
	assert.NoError(t, err)

	cookies := w.Result().Cookies()
	assert.NotEmpty(t, cookies)

	newRequest, _ := http.NewRequest(http.MethodGet, "/", nil)
	for _, cookie := range cookies {
		newRequest.AddCookie(cookie)
	}
	newWriter := httptest.NewRecorder()
	newContext, _ := gin.CreateTestContext(newWriter)
	newContext.Request = newRequest

	value, isNew, err = cookieJar.Get(newContext, Token)
	assert.NoError(t, err)
	assert.False(t, isNew)
	assert.Equal(t, "test-token", value)
}

func TestSetUserToken(t *testing.T) {
	cookieJar, c, w := setupTest()

	tokenCookie, err := NewCookie(Token, "test-token")
	assert.NoError(t, err)
	err = cookieJar.Store(c, tokenCookie)
	assert.NoError(t, err)

	cookies := w.Result().Cookies()
	assert.NotEmpty(t, cookies)

	newRequest, _ := http.NewRequest(http.MethodGet, "/", nil)
	for _, cookie := range cookies {
		newRequest.AddCookie(cookie)
	}
	newWriter := httptest.NewRecorder()
	newContext, _ := gin.CreateTestContext(newWriter)
	newContext.Request = newRequest

	value, isNew, err := cookieJar.Get(newContext, Token)
	assert.NoError(t, err)
	assert.False(t, isNew)
	assert.Equal(t, "test-token", value)
}

func TestDeleteStateSession(t *testing.T) {
	cookieJar, c, _ := setupTest()

	stateCookie, err := NewCookie(State, "test-state")
	assert.NoError(t, err)
	err = cookieJar.Store(c, stateCookie)
	assert.NoError(t, err)

	err = cookieJar.Delete(c, State)
	assert.NoError(t, err)

	value, isNew, err := cookieJar.Get(c, State)
	assert.NoError(t, err)
	assert.True(t, isNew)
	assert.Empty(t, value)
}

func TestDeleteNonceSession(t *testing.T) {
	cookieJar, c, _ := setupTest()

	nonceCookie, err := NewCookie(Nonce, "test-nonce")
	assert.NoError(t, err)
	err = cookieJar.Store(c, nonceCookie)
	assert.NoError(t, err)

	err = cookieJar.Delete(c, Nonce)
	assert.NoError(t, err)

	value, isNew, err := cookieJar.Get(c, Nonce)
	assert.NoError(t, err)
	assert.True(t, isNew)
	assert.Empty(t, value)
}
