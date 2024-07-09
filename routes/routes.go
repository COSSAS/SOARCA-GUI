package routes

import (
	"soarca-gui/handlers"
	"soarca-gui/public"
	"soarca-gui/utils"

	"github.com/gin-gonic/gin"
)

func Setup(app *gin.Engine) {
	publicRoutes := app.Group("/")
	PublicRoutes(publicRoutes)
	Reporting(publicRoutes)
	StatusGroup(publicRoutes)
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

func StatusGroup(app *gin.RouterGroup) {
	statusHandler := handlers.NewStatusHandler(utils.GetEnv("SOARCA_URI", "http://localhost:8080"))

	statusRoute := app.Group("/status")
	{
		statusRoute.GET("/indicator/card", statusHandler.HealthComponentHandler)
	}
}
