package main

import (
	"fmt"

	"soarca-gui/routes"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

var (
	Version   string
	Buildtime string
)

// @title           SOARCA-GUI
// @version         0.0.1
func main() {
	errenv := godotenv.Load(".env")

	if errenv != nil {
		fmt.Println("Failed to read env variable, but will continue")
	}

	app := gin.Default()
	routes.Setup(app)

	err := app.Run(":8081")
	if err != nil {
		fmt.Println("failed to start server")
	}
	fmt.Println("exit")
}
