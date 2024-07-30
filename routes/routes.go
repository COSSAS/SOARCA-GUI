package routes

import (
	"net/http"

	"soarca-gui/backend"
	s_backend "soarca-gui/backend/soarca"
	"soarca-gui/handlers"
	"soarca-gui/public"
	"soarca-gui/utils"

	"github.com/gin-gonic/gin"
)

func Setup(app *gin.Engine) {
	app.GET("/404-page", handlers.ErrorPage)
	app.NoRoute(func(ctx *gin.Context) {
		ctx.Redirect(http.StatusTemporaryRedirect, "/404-page")
	})

	backend := s_backend.NewSoarcaBackend(utils.GetEnv("SOARCA_URI", "http://localhost:8080"))
	publicRoutes := app.Group("/")

	PublicRoutes(publicRoutes)
	Reporting(publicRoutes)
	StatusGroup(backend, publicRoutes)
	SettingsRouter(publicRoutes)
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

func Reporting(app *gin.RouterGroup) {
	reportingRoute := app.Group("/reporting")
	{
		reportingRoute.GET("/", handlers.ReportingDashboard)
		reportingRoute.GET("/reportingcard/:id", handlers.ReportingCard)
	}
}

func StatusGroup(backend backend.Backend, app *gin.RouterGroup) {
	statusHandler := handlers.NewStatusHandler(backend)

	statusRoute := app.Group("/status")
	{
		statusRoute.GET("/indicator/card", statusHandler.HealthComponentHandler)
	}
}

func SettingsRouter(app *gin.RouterGroup) {
	reportingRoute := app.Group("/settings")
	{
		reportingRoute.GET("/", handlers.SettingsDashboard)
	}
}
