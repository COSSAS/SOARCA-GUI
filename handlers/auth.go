package handlers

import (
	"errors"
	"net/http"
	"strings"

	"soarca-gui/utils"
	authviews "soarca-gui/views/auth"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct{}

func (a *AuthHandler) AuthPage(context *gin.Context) {
	render := utils.NewTempl(context, http.StatusOK, authviews.LoginIndex())
	context.Render(http.StatusOK, render)
}

func (a *AuthHandler) Login(context *gin.Context) {
	errors := a.inputValidation(context)

	// email := context.PostForm("email")
	// password := context.PostForm("password")
	if len(errors) > 0 {
		template := utils.NewTempl(context, http.StatusOK, authviews.AuthErrorCmp(errors))
		context.Render(http.StatusOK, template)
		return
	}
	context.Header("HX-Redirect", "/dashboard")
	context.String(http.StatusFound, "")
}

func (a *AuthHandler) inputValidation(context *gin.Context) []error {
	email := context.PostForm("email")
	password := context.PostForm("password")
	var validationErrors []error
	if email == "" {
		validationErrors = append(validationErrors, errors.New("email is empty"))
	}
	if !strings.Contains(email, "@") {
		validationErrors = append(validationErrors, errors.New("valid e-mail is required"))
	}
	if len(password) < 8 {
		validationErrors = append(validationErrors, errors.New("password must be at least 8 characters long"))
	}
	if password == "" {
		validationErrors = append(validationErrors, errors.New("password is empty"))
	}

	return validationErrors
}
