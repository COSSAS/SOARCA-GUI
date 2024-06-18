package routes

import (
	"soarca-gui/handlers"
	"soarca-gui/public"

	"github.com/gin-gonic/gin"
)

func Setup(app *gin.Engine) {
	publicRoutes := app.Group("/")
	PublicRoutes(publicRoutes)
	Reporting(publicRoutes)
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
