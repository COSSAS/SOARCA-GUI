package routes

import (
	"log"
	"net/http"
	"soarca-gui/backend"
	"soarca-gui/backend/soarca"
	"soarca-gui/handlers"
	"soarca-gui/public"
	"soarca-gui/utils"
	"strconv"

	"github.com/COSSAS/gauth"

	"github.com/gin-gonic/gin"
)

const requiredGroupPermission = "soarca_admin"

func Setup(app *gin.Engine) {
	app.NoRoute(handlers.NotFoundPage)

	authEnabled, _ := strconv.ParseBool(utils.GetEnv("AUTH_ENABLED", "false"))
	reporter := soarca.NewReport(utils.GetEnv("SOARCA_URI", "http://localhost:8080"), &http.Client{}, authEnabled)
	status := soarca.NewStatus(utils.GetEnv("SOARCA_URI", "http://localhost:8080"), &http.Client{}, authEnabled)
	manual := soarca.NewManual(utils.GetEnv("SOARCA_URI", "http://localhost:8080"), &http.Client{})

	var auth *gauth.Authenticator
	var authHandler *handlers.OIDCAuthHandler
	var err error

	publicRoutes := app.Group("/")
	protectedRoutes := app.Group("/")

	if authEnabled {
		auth, err = gauth.New(gauth.OIDCRedirectConfig())
		if err != nil {
			log.Fatal("could not configure oidc redirect config: ", err)
		}
		authHandler = handlers.NewOIDCAuthHandler(auth)
		protectedRoutes.Use(auth.LoadAuthContext())
		protectedRoutes.Use(auth.Middleware([]string{requiredGroupPermission}))
	}

	PublicRoutes(publicRoutes, authEnabled, authHandler)
	DashboardRoutes(protectedRoutes, authHandler)
	ReportingRoutes(reporter, protectedRoutes, authEnabled)
	StatusRoutes(status, protectedRoutes, authEnabled)
	ManualRoutes(manual, protectedRoutes, authEnabled)
	SettingsRoutes(protectedRoutes)
}

func PublicRoutes(app *gin.RouterGroup, authEnabled bool, oidcAuthHandler *handlers.OIDCAuthHandler) {
	publicRoute := app.Group("/")

	if authEnabled {
		publicRoute.GET("/", oidcAuthHandler.OIDCAuthPageHandler)
		publicRoute.GET("/oidc-login", oidcAuthHandler.OIDCLoginHandler)
		publicRoute.GET("/oidc-callback", oidcAuthHandler.OIDCCallBackHandler)
	} else {
		authHandler := handlers.AuthHandler{}
		publicRoute.GET("/", authHandler.AuthPage)
		publicRoute.POST("/login", authHandler.Login)
	}

	publicRoute.StaticFS("/public", public.GetPublicAssetsFileSystem())
}

func DashboardRoutes(app *gin.RouterGroup, authHandler *handlers.OIDCAuthHandler) {
	app.GET("dashboard", handlers.HomeDashboard)
	app.GET("logout", authHandler.OIDCLogoutHandler)
}

func ReportingRoutes(reporter backend.Report, app *gin.RouterGroup, authentication bool) {
	reportingHandlers := handlers.NewReportingHandler(reporter, authentication)

	reportingRoute := app.Group("/reporting")
	{
		reportingRoute.GET("/", reportingHandlers.ReportingIndexHandler)
		reportingRoute.GET("/metrics", reportingHandlers.ReportingCardSectionHandler)
		reportingRoute.GET("/table", reportingHandlers.ReportingTableCardHandler)
		reportingRoute.GET("/detailed/:id", reportingHandlers.ReportingDetailedView)
	}
}

func StatusRoutes(backend backend.Status, app *gin.RouterGroup, authentication bool) {
	statusHandlers := handlers.NewStatusHandler(backend, authentication)

	statusRoute := app.Group("/status")
	{
		statusRoute.GET("/indicator/card", statusHandlers.HealthComponentHandler)
	}
}

func SettingsRoutes(app *gin.RouterGroup) {
	reportingRoute := app.Group("/settings")
	{
		reportingRoute.GET("/", handlers.SettingsDashboard)
	}
}

func ManualRoutes(manual backend.Manual, app *gin.RouterGroup, authentication bool) {
	manualHandler := handlers.NewManualHandler(manual, authentication)

	manualRoutes := app.Group(("/manual"))
	{
		manualRoutes.GET("/", manualHandler.ManualActionsHandler)
		manualRoutes.POST("/continue", manualHandler.ManualContinueHandler)
	}
}
