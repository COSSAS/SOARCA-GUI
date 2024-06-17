package main

import (
	"soarca-gui/routes"

	"github.com/gin-gonic/gin"
)

var (
	Version   string
	Buildtime string
)

func main() {
	app := gin.Default()
	routes.Setup(app)

	app.Run(":8081")
}
