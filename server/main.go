package main

import (
	"fmt"

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

	err := app.Run(":8081")
	if err != nil {
		fmt.Println("failed to start server")
	}
	fmt.Println("exit")
}
