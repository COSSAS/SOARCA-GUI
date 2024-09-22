package routes

import (
	"log"
	"net/http"
	"soarca-gui/auth"
	"soarca-gui/backend"
	"soarca-gui/backend/soarca"
	"soarca-gui/handlers"
	"soarca-gui/public"
	"soarca-gui/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

func Setup(app *gin.Engine) {
	app.GET("/404-page", handlers.ErrorPage)
	app.NoRoute(func(ctx *gin.Context) {
		ctx.Redirect(http.StatusTemporaryRedirect, "/404-page")
	})

	reporter := soarca.NewReport(utils.GetEnv("SOARCA_URI", "http://localhost:8080"), &http.Client{})
	status := soarca.NewStatus(utils.GetEnv("SOARCA_URI", "http://localhost:8080"), &http.Client{})
	authEnabledStr := utils.GetEnv("AUTH_ENABLED", "false")
	authEnabled, err := strconv.ParseBool(authEnabledStr)
	publicRoutes := app.Group("/")
	if err != nil {
		log.Fatal("AUTH_ENABLED flag could not be parsed properly should be 'true' | 'false'")
	}
	if authEnabled {
		PublicOIDCRoutes(publicRoutes)
	} else {
		PublicRoutes(publicRoutes)
	}
	ReportingRoutes(reporter, publicRoutes)
	StatusRoutes(status, publicRoutes)
	SettingsRoutes(publicRoutes)
}

func PublicOIDCRoutes(app *gin.RouterGroup) {
	auth := auth.SetupOIDCAuthHandler()
	authHandler := handlers.NewOIDCAuthHanlder(auth)
	publicRoute := app.Group("/")
	{
		publicRoute.GET("/", authHandler.OIDCAuthPageHandler)
		publicRoute.GET("/oidc-login", authHandler.OIDCLoginHandler)
		publicRoute.GET("/dashboard", handlers.HomeDashboard)

	}
	publicRoute.StaticFS("/public", public.GetPublicAssetsFileSystem())
}

func PublicRoutes(app *gin.RouterGroup) {
	authHandler := handlers.AuthHandler{}
	publicRoute := app.Group("/")
	{
		publicRoute.GET("/", authHandler.AuthPage)
		publicRoute.POST("/login", authHandler.Login)
		publicRoute.GET("/dashboard", handlers.HomeDashboard)

	}
	publicRoute.StaticFS("/public", public.GetPublicAssetsFileSystem())
}

func ReportingRoutes(backend backend.Report, app *gin.RouterGroup) {
	reportingHandlers := handlers.NewReportingHandler(backend)

	reportingRoute := app.Group("/reporting")
	{
		reportingRoute.GET("/", reportingHandlers.ReportingIndexHandler)
		reportingRoute.GET("/metrics", reportingHandlers.ReportingCardSectionHandler)
		reportingRoute.GET("/table", reportingHandlers.ReportingTableCardHandler)
		reportingRoute.GET("/detailed/:id", reportingHandlers.ReportingDetailedView)
	}
}

func StatusRoutes(backend backend.Status, app *gin.RouterGroup) {
	statusHandlers := handlers.NewStatusHandler(backend)

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
