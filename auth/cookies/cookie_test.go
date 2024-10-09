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

func TestNewCookieJar(t *testing.T) {
	cookieJar := NewCookieJar([]byte(testSecretKey), []byte(testEncryptionKey))

	assert.NotNil(t, cookieJar)
	assert.NotNil(t, cookieJar.store)
}

// func TestNewCookieJarWithShortKeys(t *testing.T) {
// 	shortKey := "short_key"
//
// 	assert.Panics(t, func() {
// 		NewCookieJar([]byte(shortKey), []byte(testEncryptionKey))
// 	}, "Expected NewCookieJar to panic with short secret key")
//
// 	assert.Panics(t, func() {
// 		NewCookieJar([]byte(testSecretKey), []byte(shortKey))
// 	}, "Expected NewCookieJar to panic with short encryption key")
// }

func TestSetCallBackState(t *testing.T) {
	cookieJar, c, w := setupTest()

	err := cookieJar.SetCallBackState(c, "test-state")
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

	value, isNew := cookieJar.GetStateSession(newContext)
	assert.False(t, isNew, "Expected existing state session")
	assert.Equal(t, "test-state", value, "Expected the state value to match 'test-state'")
}

func TestSetCallBackNonce(t *testing.T) {
	cookieJar, c, w := setupTest()

	err := cookieJar.SetCallBackNonce(c, "test-nonce")
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

	value, isNew := cookieJar.GetNonceSession(newContext)
	assert.False(t, isNew)
	assert.Equal(t, "test-nonce", value)
}

func TestGetStateSession(t *testing.T) {
	cookieJar, c, w := setupTest()

	value, isNew := cookieJar.GetStateSession(c)
	assert.True(t, isNew)
	assert.Empty(t, value)

	err := cookieJar.SetCallBackState(c, "test-state")
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

	value, isNew = cookieJar.GetStateSession(newContext)
	assert.False(t, isNew)
	assert.Equal(t, "test-state", value)
}

func TestGetUserToken(t *testing.T) {
	cookieJar, c, w := setupTest()

	value, isNew := cookieJar.GetUserToken(c)
	assert.True(t, isNew)
	assert.Empty(t, value)

	err := cookieJar.SetUserToken(c, "test-token")
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

	value, isNew = cookieJar.GetUserToken(newContext)
	assert.False(t, isNew)
	assert.Equal(t, "test-token", value)
}

func TestSetUserToken(t *testing.T) {
	cookieJar, c, w := setupTest()

	err := cookieJar.SetUserToken(c, "test-token")
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

	value, isNew := cookieJar.GetUserToken(newContext)
	assert.False(t, isNew)
	assert.Equal(t, "test-token", value)
}

func TestDeleteStateSession(t *testing.T) {
	cookieJar, c, _ := setupTest()

	err := cookieJar.SetCallBackState(c, "test-state")
	assert.NoError(t, err)

	err = cookieJar.DeleteStateSession(c)
	assert.NoError(t, err)

	value, isNew := cookieJar.GetStateSession(c)
	assert.True(t, isNew)
	assert.Empty(t, value)
}

func TestDeleteNonceSession(t *testing.T) {
	cookieJar, c, _ := setupTest()

	err := cookieJar.SetCallBackNonce(c, "test-nonce")
	assert.NoError(t, err)

	err = cookieJar.DeleteNonceSession(c)
	assert.NoError(t, err)

	value, isNew := cookieJar.GetNonceSession(c)
	assert.True(t, isNew)
	assert.Empty(t, value)
}
